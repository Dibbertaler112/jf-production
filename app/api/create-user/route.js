import { createClient } from "@supabase/supabase-js";

/* ============================================================
   POST – Neuen User (Auth + Profile) erstellen
============================================================ */

export async function POST(req) {

  try {

    /* ----------------------------------------------------------
       1️⃣ Request Body auslesen
    ---------------------------------------------------------- */

    const body = await req.json();

    const {
      email,
      password,
      role,
      department_id,
      first_name,
      last_name
    } = body;

    /* ----------------------------------------------------------
       2️⃣ Supabase Admin Client erstellen
    ---------------------------------------------------------- */

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    /* ----------------------------------------------------------
       3️⃣ Auth User erstellen
    ---------------------------------------------------------- */

    const { data: userData, error: userError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (userError) {
      return new Response(
        JSON.stringify({ error: userError.message }),
        { status: 400 }
      );
    }

    /* ----------------------------------------------------------
       4️⃣ Profil anlegen
    ---------------------------------------------------------- */

    const { error: profileError } =
      await supabaseAdmin
        .from("profiles")
        .insert({
          id: userData.user.id,
          role,
          department_id:
            role === "city_admin"
              ? null
              : department_id,
          first_name,
          last_name
        });

    if (profileError) {
      return new Response(
        JSON.stringify({ error: profileError.message }),
        { status: 400 }
      );
    }

    /* ----------------------------------------------------------
       5️⃣ Erfolgreiche Response
    ---------------------------------------------------------- */

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200 }
    );

  } catch (err) {

    /* ----------------------------------------------------------
       6️⃣ Globaler Serverfehler
    ---------------------------------------------------------- */

    return new Response(
      JSON.stringify({ error: "Serverfehler" }),
      { status: 500 }
    );
  }
}