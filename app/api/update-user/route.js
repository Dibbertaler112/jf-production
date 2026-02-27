import { createClient } from "@supabase/supabase-js";

/* ============================================================
   POST – User (Auth + Profile) aktualisieren
============================================================ */

export async function POST(req) {

  try {

    /* ----------------------------------------------------------
       1️⃣ Request Body auslesen
    ---------------------------------------------------------- */

    const body = await req.json();

    const {
      id,
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
       3️⃣ AUTH USER UPDATE (Email + Passwort optional)
    ---------------------------------------------------------- */

    if (email || password) {

      const updatePayload = {};

      if (email) {
        updatePayload.email = email;
      }

      if (password) {
        updatePayload.password = password;
      }

      const { error: authError } =
        await supabaseAdmin.auth.admin.updateUserById(
          id,
          updatePayload
        );

      if (authError) {
        return new Response(
          JSON.stringify({ error: authError.message }),
          { status: 400 }
        );
      }
    }

    /* ----------------------------------------------------------
       4️⃣ PROFILE UPDATE
    ---------------------------------------------------------- */

    const { error: profileError } =
      await supabaseAdmin
        .from("profiles")
        .update({
          role,
          department_id:
            role === "city_admin"
              ? null
              : department_id,
          first_name,
          last_name
        })
        .eq("id", id);

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