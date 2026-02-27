import { createClient } from "@supabase/supabase-js";

/* ============================================================
   GET – Alle Profile inkl. Email aus Auth laden
============================================================ */

export async function GET() {

  /* ----------------------------------------------------------
     1️⃣ Supabase Admin Client erstellen
  ---------------------------------------------------------- */

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  /* ----------------------------------------------------------
     2️⃣ Profile laden
  ---------------------------------------------------------- */

  const { data: profiles, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .order("last_name", { ascending: true });

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400 }
    );
  }

  /* ----------------------------------------------------------
     3️⃣ ALLE Auth User auf einmal laden
  ---------------------------------------------------------- */

  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.listUsers();

  if (authError) {
    return new Response(
      JSON.stringify({ error: authError.message }),
      { status: 400 }
    );
  }

  const authUsers = authData?.users || [];

  /* ----------------------------------------------------------
     4️⃣ Profile + Email mergen
  ---------------------------------------------------------- */

  const usersWithEmail = profiles.map((profile) => {

    const authUser = authUsers.find(
      (u) => u.id === profile.id
    );

    return {
      ...profile,
      email: authUser?.email || ""
    };
  });

  /* ----------------------------------------------------------
     5️⃣ Response zurückgeben
  ---------------------------------------------------------- */

  return new Response(
    JSON.stringify(usersWithEmail),
    { status: 200 }
  );
}