import { createServerSupabaseClient } from "../../lib/supabaseServer";
import MembersClient from "./MembersClient";

export default async function MembersPage() {
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
  let members = [];

  if (profile.role === "city_admin") {
    const { data: deps } = await supabase
      .from("departments")
      .select("*")
      .order("name", { ascending: true });

    departments = deps || [];

    const { data: mem } = await supabase
      .from("members")
      .select(`*, departments:department_id (id, name)`)
      .is("deleted_at", null)
      .order("last_name", { ascending: true });

    members = mem || [];
  } else {
    const { data: mem } = await supabase
      .from("members")
      .select(`*, departments:department_id (id, name)`)
      .eq("department_id", profile.department_id)
      .is("deleted_at", null)
      .order("last_name", { ascending: true });

    members = mem || [];
  }

  return (
    <MembersClient
      role={profile.role}
      departmentId={profile.department_id}
      departments={departments}
      initialMembers={members}
    />
  );
}