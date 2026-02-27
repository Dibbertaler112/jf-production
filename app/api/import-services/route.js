import { NextResponse } from "next/server"
import * as XLSX from "xlsx"
import { createClient } from "@supabase/supabase-js"

/* ============================================================
   Hilfsfunktionen
============================================================ */

function formatDate(value) {

  // Excel Datum als Zahl
  if (typeof value === "number") {
    const excelEpoch = new Date(1899, 11, 30)
    const date = new Date(excelEpoch.getTime() + value * 86400000)

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")

    return `${year}-${month}-${day}`
  }

  // Format: 01.12.2024
  if (typeof value === "string" && value.includes(".")) {
    const [day, month, year] = value.split(".")
    return `${year}-${month}-${day}`
  }

  return value
}

function formatTime(value) {

  // Excel Zeit als Zahl (z.B. 0.4166667)
  if (typeof value === "number") {
    const totalMinutes = Math.round(value * 24 * 60)
    const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0")
    const minutes = String(totalMinutes % 60).padStart(2, "0")

    return `${hours}:${minutes}`
  }

  // String wie "10:00"
  if (typeof value === "string") {
    return value
  }

  return null
}

/* ============================================================
   POST – Excel Import
============================================================ */

export async function POST(req) {

  try {

    /* ----------------------------------------------------------
       1️⃣ Supabase Client
    ---------------------------------------------------------- */

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    /* ----------------------------------------------------------
       2️⃣ Authentifizierung prüfen
    ---------------------------------------------------------- */

    const authHeader = req.headers.get("authorization")

    if (!authHeader) {
      return NextResponse.json(
        { error: "Nicht autorisiert" },
        { status: 401 }
      )
    }

    const token = authHeader.replace("Bearer ", "")

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token)

    if (!user || userError) {
      return NextResponse.json(
        { error: "Ungültiger Benutzer" },
        { status: 401 }
      )
    }

    /* ----------------------------------------------------------
       3️⃣ Profil & Rollenprüfung
    ---------------------------------------------------------- */

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, department_id")
      .eq("id", user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: "Profil nicht gefunden" },
        { status: 404 }
      )
    }

    if (
      profile.role !== "city_admin" &&
      profile.role !== "department_admin"
    ) {
      return NextResponse.json(
        { error: "Keine Berechtigung zum Import" },
        { status: 403 }
      )
    }

    /* ----------------------------------------------------------
       4️⃣ Datei auslesen
    ---------------------------------------------------------- */

    const formData = await req.formData()
    const file = formData.get("file")

    if (!file) {
      return NextResponse.json(
        { error: "Keine Datei hochgeladen" },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    const workbook = XLSX.read(buffer, { type: "buffer" })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]

    const rows = XLSX.utils.sheet_to_json(sheet, {
      defval: "",
      raw: true
    }).map(row => {
      const normalized = {}

      for (let key in row) {
        normalized[key.trim().toLowerCase()] = row[key]
      }

      return normalized
    })

    if (!rows.length) {
      return NextResponse.json(
        { error: "Excel-Datei enthält keine Daten" },
        { status: 400 }
      )
    }

    /* ----------------------------------------------------------
       5️⃣ Import-Loop
    ---------------------------------------------------------- */

    let imported = 0
    let skipped = 0
    let errors = []

    for (const row of rows) {

      try {

        const datum = row["datum"]
        const titel = row["titel"]
        const beginn = formatTime(row["beginn"])
        const endeRaw = row["ende"]
        const ende = endeRaw ? formatTime(endeRaw) : null
        const beschreibung = row["beschreibung"] || ""
        const ortswehrName = row["ortswehr"]

        if (!datum || !titel || !beginn) {
          errors.push(
            `Fehlende Pflichtfelder bei "${titel || "Unbekannt"}"`
          )
          continue
        }

        const formattedDate = formatDate(datum)

        let finalDepartmentId = profile.department_id

        /* ----------------------------------------------
           Sonderfall: city_admin
        ---------------------------------------------- */

        if (profile.role === "city_admin") {

          if (!ortswehrName) {
            errors.push(
              `Keine Ortswehr angegeben bei "${titel}"`
            )
            continue
          }

          const { data: department } = await supabase
            .from("departments")
            .select("id")
            .ilike("name", ortswehrName)
            .single()

          if (!department) {
            errors.push(
              `Ortswehr "${ortswehrName}" nicht gefunden`
            )
            continue
          }

          finalDepartmentId = department.id
        }

        /* ----------------------------------------------
           Insert Service
        ---------------------------------------------- */

        const { error: insertError } = await supabase
          .from("services")
          .insert({
            title: titel,
            description: beschreibung,
            service_date: formattedDate,
            start_time: beginn,
            end_time: ende,
            department_id: finalDepartmentId,
          })

        if (insertError) {
          console.error("Insert Error:", insertError)
          errors.push(
            `DB-Fehler bei "${titel}": ${insertError.message}`
          )
          continue
        }

        imported++

      } catch (rowError) {

        console.error("ROW ERROR:", rowError)

        errors.push(
          `Fehler bei "${row.titel || "Unbekannt"}": ${rowError.message}`
        )
      }
    }

    /* ----------------------------------------------------------
       6️⃣ Ergebnis zurückgeben
    ---------------------------------------------------------- */

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      errors,
    })

  } catch (error) {

    console.error("Import Fehler:", error)

    return NextResponse.json(
      { error: "Import fehlgeschlagen" },
      { status: 500 }
    )
  }
}