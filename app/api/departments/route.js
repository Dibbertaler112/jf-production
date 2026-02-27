import { createClient } from "@supabase/supabase-js";

/* ============================================================
   GET – Alle Departments laden
============================================================ */

export async function GET() {

  try {

    /* ----------------------------------------------------------
       1️⃣ Supabase Admin Client erstellen
    ---------------------------------------------------------- */

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    /* ----------------------------------------------------------
       2️⃣ Departments abrufen
    ---------------------------------------------------------- */

    const { data, error } = await supabase
      .from("departments")
      .select("id, name");

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500 }
      );
    }

    /* ----------------------------------------------------------
       3️⃣ Erfolgreiche Response
    ---------------------------------------------------------- */

    return new Response(
      JSON.stringify(data),
      { status: 200 }
    );

  } catch (err) {

    /* ----------------------------------------------------------
       4️⃣ Globaler Serverfehler
    ---------------------------------------------------------- */

    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500 }
    );
  }
}