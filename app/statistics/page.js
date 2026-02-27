import { createServerSupabaseClient } from "../../lib/supabaseServer";
import StatisticsClient from "./StatisticsClient";

export default async function StatisticsPage() {
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

  let departments = [];
  let members = [];
  let attendance = [];

  if (profile.role === "city_admin") {
    const { data: deps } = await supabase
      .from("departments")
      .select("id, name")
      .order("name");

    departments = deps || [];

    const { data: services } = await supabase
      .from("services")
      .select("id")
      .eq("is_closed", true)
      .is("deleted_at", null);

    const serviceIds = services?.map(s => s.id) || [];

    const { data: att } = await supabase
      .from("attendance")
      .select("*")
      .in("service_id", serviceIds);

    const { data: mem } = await supabase
      .from("members")
      .select("*")
      .eq("active", true)
      .is("deleted_at", null);

    members = mem || [];
    attendance = att || [];
  } else {
    const { data: services } = await supabase
      .from("services")
      .select("id")
      .eq("department_id", profile.department_id)
      .eq("is_closed", true)
      .is("deleted_at", null);

    const serviceIds = services?.map(s => s.id) || [];

    const { data: att } = await supabase
      .from("attendance")
      .select("*")
      .in("service_id", serviceIds);

    const { data: mem } = await supabase
      .from("members")
      .select("*")
      .eq("department_id", profile.department_id)
      .eq("active", true)
      .is("deleted_at", null);

    members = mem || [];
    attendance = att || [];
  }

  return (
    <StatisticsClient
      role={profile.role}
      departments={departments}
      initialMembers={members}
      initialAttendance={attendance}
    />
  );
}