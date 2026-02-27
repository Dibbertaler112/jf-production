import CollapsibleSection from "./components/CollapsibleSection"
import { createServerSupabaseClient } from "@/lib/supabaseServer"
import StatsCard from "./components/StatsCard"

export default async function CityDashboard() {
  const supabase = await createServerSupabaseClient()

  // ─────────────────────────────
  // ALLE DATEN PARALLEL LADEN
  // ─────────────────────────────

  const [
  { data: departments },
  { data: members },
  { data: services },
  { data: attendance }
] = await Promise.all([
  supabase
    .from("departments")
    .select("id, name"),

  supabase
    .from("members")
    .select("id, department_id, type, first_name, last_name, birthdate, active")
    .is("deleted_at", null),

  supabase
    .from("services")
    .select("id, department_id, title, service_date, department:departments(name)")
    .is("deleted_at", null),

  supabase
    .from("attendance")
    .select("hours, service_id")
])

  
  // ─────────────────────────────
  // GLOBALE KPI
  // ─────────────────────────────

  const youthTotal =
    members?.filter(m => m.type === "child").length ?? 0

  const supervisorTotal =
    members?.filter(m => m.type === "supervisor").length ?? 0

  const servicesCount = services?.length ?? 0

  const totalHours =
    attendance?.reduce((sum, a) => sum + (a.hours || 0), 0) ?? 0

  // ─────────────────────────────
  // ORTSWEHR ANALYSE (IN MEMORY)
  // ─────────────────────────────

  const departmentStats = departments?.map(dep => {

    const depMembers =
      members?.filter(m => m.department_id === dep.id) ?? []

    const depServices =
      services?.filter(s => s.department_id === dep.id) ?? []

    const depServiceIds = depServices.map(s => s.id)

    const depAttendance =
      attendance?.filter(a =>
        depServiceIds.includes(a.service_id)
      ) ?? []

    const depTotalHours =
      depAttendance.reduce((sum, a) => sum + (a.hours || 0), 0)

    return {
      id: dep.id,
      name: dep.name,
      youthCount: depMembers.filter(m => m.type === "child").length,
      supervisorCount: depMembers.filter(m => m.type === "supervisor").length,
      servicesCount: depServices.length,
      totalHours: depTotalHours.toFixed(2)
    }
  }) ?? []

  // ─────────────────────────────
  // DIENSTE (ZUKUNFT)
  // ─────────────────────────────

  const todayISO = new Date().toISOString().split("T")[0]

  const nextServices =
    services
      ?.filter(s => s.service_date >= todayISO)
      .sort((a, b) => a.service_date.localeCompare(b.service_date))
      .slice(0, 3) ?? []

// ─────────────────────────────
// GEBURTSTAGE (3 NÄCHSTE + 2 LETZTE)
// ─────────────────────────────

const today = new Date()
const currentYear = today.getFullYear()

const birthdayData =
  members
    ?.filter(m => m.active && m.birthdate)
    .map(member => {
      const birth = new Date(member.birthdate)

      const thisYearBirthday = new Date(
        currentYear,
        birth.getMonth(),
        birth.getDate()
      )

      let nextBirthday = thisYearBirthday
      let lastBirthday = thisYearBirthday

      if (thisYearBirthday < today) {
        nextBirthday = new Date(
          currentYear + 1,
          birth.getMonth(),
          birth.getDate()
        )
      } else {
        lastBirthday = new Date(
          currentYear - 1,
          birth.getMonth(),
          birth.getDate()
        )
      }

      return {
        ...member,
        nextBirthday,
        lastBirthday,
        upcomingAge:
          nextBirthday.getFullYear() - birth.getFullYear()
      }
    }) ?? []

// Sortierung
const nextThree = birthdayData
  .filter(m => m.nextBirthday >= today)
  .sort((a, b) => a.nextBirthday - b.nextBirthday)
  .slice(0, 3)

const lastTwo = birthdayData
  .filter(m => m.lastBirthday < today)
  .sort((a, b) => b.lastBirthday - a.lastBirthday)
  .slice(0, 2)

  // ─────────────────────────────
  // UI
  // ─────────────────────────────

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 py-8 sm:py-12 space-y-12 sm:space-y-16 text-white">

      {/* HEADER */}
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#d9ff00]">
        Stadt-Dashboard
      </h1>

      {/* KPI GRID */}
      <div className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Jugendliche gesamt" value={youthTotal} />
        <StatsCard title="Betreuer gesamt" value={supervisorTotal} />
        <StatsCard title="Gesamt Dienste" value={servicesCount} />
        <StatsCard title="Gesamt Stunden" value={totalHours.toFixed(2)} />
      </div>

{/* GEBURTSTAGE */}
<CollapsibleSection title="Geburtstage">

  

    {/* NÄCHSTE 3 */}
    <div className="space-y-4">

      <h3 className="text-lg sm:text-xl font-bold text-[#d9ff00]">
        Nächste Geburtstage
      </h3>

      <div className="space-y-3">

        {nextThree.map((member, index) => {

          const isNext = index === 0
          const isToday =
            member.nextBirthday.toDateString() === today.toDateString()

          return (
            <div
              key={member.id}
              className={`
                p-4 sm:p-5
                rounded-xl
                border
                transition
                ${isNext
                  ? "bg-[#0f172a] border-[#d9ff00]"
                  : "bg-[#0f172a] border-slate-700 hover:border-[#d9ff00]"}
              `}
            >
              <div className="flex justify-between items-center">

                <div>
                  <div className="font-semibold text-white">
                    {member.first_name} {member.last_name}
                  </div>

                  <div className="text-sm text-[#d9ff00]">
                    {member.nextBirthday.toLocaleDateString("de-DE")}
                  </div>
                </div>

                <div className="bg-[#d9ff00] text-black px-3 py-1 rounded-lg text-sm font-bold">
                  {member.upcomingAge} Jahre
                </div>
              </div>

              {isToday && (
                <div className="text-xs text-[#d9ff00] mt-2 font-semibold">
                  🎉 Hat heute Geburtstag!
                </div>
              )}

              {isNext && !isToday && (
                <div className="text-xs text-slate-400 mt-2">
                  Nächster Geburtstag
                </div>
              )}
            </div>
          )
        })}

      
    </div>

    {/* LETZTE 2 */}
    {lastTwo.length > 0 && (
      <div className="space-y-4 border-t border-slate-700 pt-6">

        <h3 className="text-lg sm:text-xl font-bold text-[#d9ff00]">
          Kürzlich gefeiert
        </h3>

        <div className="space-y-3">

          {lastTwo.map(member => {

            const daysAgo = Math.floor(
              (today - member.lastBirthday) /
              (1000 * 60 * 60 * 24)
            )

            const newAge =
              member.lastBirthday.getFullYear() -
              new Date(member.birthdate).getFullYear()

            return (
              <div
                key={member.id}
                className="
                  bg-[#0f172a]
                  p-4
                  rounded-xl
                  border border-slate-700
                  flex justify-between items-center
                  hover:border-slate-500
                  transition
                "
              >
                <div>
                  <div className="font-semibold text-white">
                    {member.first_name} {member.last_name}
                  </div>

                  <div className="text-xs text-slate-400">
                    {member.lastBirthday.toLocaleDateString("de-DE")}
                    {" "}· vor {daysAgo} Tagen
                  </div>
                </div>

                <div className="text-xs text-slate-400 font-medium">
                  {newAge} Jahre
                </div>
              </div>
            )
          })}

        </div>

      </div>
    )}

  </div>

</CollapsibleSection>

      {/* ORTSWEHR STATISTIK */}
      <CollapsibleSection title="Ortswehr Statistik">
      

          {departmentStats.map(dep => (
            <div key={dep.id}>
              
              <h3 className="text-lg sm:text-xl font-bold text-[#d9ff00]">
                {dep.name}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">

                <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-600">
                  <div className="text-sm text-slate-400">Jugendliche</div>
                  <div className="text-xl font-bold text-[#d9ff00]">
                    {dep.youthCount}
                  </div>
                </div>

                <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-600">
                  <div className="text-sm text-slate-400">Betreuer</div>
                  <div className="text-xl font-bold text-[#d9ff00]">
                    {dep.supervisorCount}
                  </div>
                </div>

                <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-600">
                  <div className="text-sm text-slate-400">Dienste</div>
                  <div className="text-xl font-bold text-[#d9ff00]">
                    {dep.servicesCount}
                  </div>
                </div>

                <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-600">
                  <div className="text-sm text-slate-400">Stunden</div>
                  <div className="text-xl font-bold text-[#d9ff00]">
                    {dep.totalHours}
                  </div>
                </div>

              </div>
            </div>
          ))}

        
      </CollapsibleSection>

      {/* DIENSTE */}
      <CollapsibleSection title="Nächsten Dienste">
      
      <div className="space-y-4">

        <h3 className="font-semibold text-lg text-[#d9ff00]">
          Nächste 3 Dienste
        </h3>

        <div className="space-y-4">

          {nextServices.map(service => (
            <div
              key={service.id}
              className="
                bg-[#0f172a]
                p-4 sm:p-5
                rounded-xl
                border border-slate-700
                hover:border-[#d9ff00]
                transition
              "
            >
              <div className="font-semibold">
                {service.title}
              </div>

              <div className="text-sm text-[#d9ff00]">
                {new Date(service.service_date).toLocaleDateString()}
              </div>

              <div className="text-sm text-slate-500">
                {service.department?.name}
              </div>
            </div>
          ))}

        </div>

        <a
          href="/services"
          className="
            block w-full sm:w-auto
            text-center
            bg-[#d9ff00]
            text-black
            px-6 py-4
            rounded-xl
            font-semibold
            mt-6
            min-h-[48px]
            hover:opacity-90
            transition
          "
        >
          Alle Dienste anzeigen →
        </a>

      </div>
</CollapsibleSection>
    </div>
    
  )


  
}