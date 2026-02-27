import CityDashboard from "./CityDashboard"
import DepartmentDashboard from "./DepartmentDashboard"
import YouthDashboard from "./YouthDashboard"
import { createServerSupabaseClient } from "@/lib/supabaseServer"

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div className="text-white">Nicht eingeloggt</div>
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, department_id")
    .eq("id", user.id)
    .single()

  if (profile.role === "city_admin") {
    return <CityDashboard />
  }

  if (
    profile.role === "department_admin" ||
    profile.role === "department_deputy"
  ) {
    return <DepartmentDashboard departmentId={profile.department_id} />
  }

  if (profile.role === "department_youth_representative") {
    return <YouthDashboard />
  }

  return <div className="text-white">Kein Zugriff</div>
}