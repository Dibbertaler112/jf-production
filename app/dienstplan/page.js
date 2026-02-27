import ServiceImportUpload from "@/components/ServiceImportUpload"
import { createClient } from "@supabase/supabase-js"

/* ============================================================
   DienstplanPage – Anzeige + Import
============================================================ */

export default async function DienstplanPage() {

  /* ----------------------------------------------------------
     1️⃣ Supabase Admin Client erstellen
  ---------------------------------------------------------- */

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  /* ----------------------------------------------------------
     2️⃣ Dienste laden (sortiert nach Datum)
  ---------------------------------------------------------- */

  const { data: services } = await supabase
    .from("services")
    .select("*")
    .order("date", { ascending: true })

  /* ----------------------------------------------------------
     3️⃣ UI
  ---------------------------------------------------------- */

  return (
    <div className="p-8 space-y-10">

      {/* 🔵 Dienstplan Anzeige */}
      <div className="bg-[#1e293b] p-6 rounded-xl text-white">

        <h2 className="text-xl font-semibold text-[#d9ff00] mb-4">
          Dienstplan
        </h2>

        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead className="bg-[#0f172a]">
              <tr>
                <th className="p-2 text-left">Datum</th>
                <th className="p-2 text-left">Titel</th>
                <th className="p-2 text-left">Beginn</th>
                <th className="p-2 text-left">Ende</th>
                <th className="p-2 text-left">Beschreibung</th>
              </tr>
            </thead>

            <tbody>
              {services?.map((service) => (
                <tr
                  key={service.id}
                  className="border-b border-gray-700"
                >
                  <td className="p-2">{service.date}</td>
                  <td className="p-2">{service.title}</td>
                  <td className="p-2">{service.start_time}</td>
                  <td className="p-2">{service.end_time}</td>
                  <td className="p-2">{service.description}</td>
                </tr>
              ))}
            </tbody>

          </table>

        </div>
      </div>

      {/* 🟢 Upload Bereich */}
      <ServiceImportUpload />

    </div>
  )
}