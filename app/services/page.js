import { createServerSupabaseClient } from "../../lib/supabaseServer";
import ServicesClient from "./ServicesClient";

export default async function ServicesPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, department_id")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  let departments = [];
  let services = [];

  if (profile.role === "city_admin") {
    const { data: deps } = await supabase
      .from("departments")
      .select("*")
      .order("name", { ascending: true });

    departments = deps || [];

    const { data: srv } = await supabase
      .from("services")
      .select(`
        *,
        departments:department_id (name)
      `)
      .is("deleted_at", null)
      .order("is_closed", { ascending: true })
      .order("service_date", { ascending: false });

    services = srv || [];
  } else {
    const { data: srv } = await supabase
      .from("services")
      .select(`
        *,
        departments:department_id (name)
      `)
      .eq("department_id", profile.department_id)
      .is("deleted_at", null)
      .order("is_closed", { ascending: true })
      .order("service_date", { ascending: false });

    services = srv || [];
  }

  return (
    <ServicesClient
      role={profile.role}
      departmentId={profile.department_id}
      departments={departments}
      initialServices={services}
    />
  );
}