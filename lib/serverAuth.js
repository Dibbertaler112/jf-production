import { createClient } from "@supabase/supabase-js";

let adminClient;

function getAdminClient() {
  if (!adminClient) {
    adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return adminClient;
}

export async function requireCityAdmin(req) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    return { error: "Nicht eingeloggt" };
  }

  const token = authHeader.replace("Bearer ", "");

  const supabase = getAdminClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return { error: "Ungültiger Token" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "city_admin") {
    return { error: "Kein Zugriff" };
  }

  return { user };
}