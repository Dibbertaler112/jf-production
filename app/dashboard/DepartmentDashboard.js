import { createServerSupabaseClient } from "@/lib/supabaseServer"
import StatsCard from "./components/StatsCard"

export default async function DepartmentDashboard({ departmentId }) {
  const supabase = await createServerSupabaseClient()

  // ─────────────────────────────
  // ALLE DATEN PARALLEL LADEN
  // ─────────────────────────────

  const [
  { data: members },
  { data: services },
  { data: attendance }
] = await Promise.all([
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
  // KPI BERECHNEN (IN MEMORY)
  // ─────────────────────────────

  const youthCount =
    members?.filter(m => m.type === "child").length ?? 0

  const supervisorCount =
    members?.filter(m => m.type === "supervisor").length ?? 0

  const servicesCount = services?.length ?? 0

  const serviceIds = services?.map(s => s.id) ?? []

  const depAttendance =
    attendance?.filter(a => serviceIds.includes(a.service_id)) ?? []

  const totalHours =
    depAttendance.reduce((sum, a) => sum + (a.hours || 0), 0)

  const activeMembers =
    members?.filter(m => m.active === true).length ?? 0

  const archivedMembers =
    members?.filter(m => m.active === false).length ?? 0

  // ─────────────────────────────
  // DIENSTE
  // ─────────────────────────────

  const todayISO = new Date().toISOString().split("T")[0]

  const upcomingServices =
    services
      ?.filter(s => s.service_date >= todayISO)
      .sort((a, b) => a.service_date.localeCompare(b.service_date)) ?? []

  const nextService = upcomingServices[0] ?? null
  const nextThree = upcomingServices.slice(0, 3)

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

const nextBirthdays = birthdayData
  .filter(m => m.nextBirthday >= today)
  .sort((a, b) => a.nextBirthday - b.nextBirthday)
  .slice(0, 3)

const recentBirthdays = birthdayData
  .filter(m => m.lastBirthday < today)
  .sort((a, b) => b.lastBirthday - a.lastBirthday)
  .slice(0, 2)

  const openServices =
    services?.filter(s => s.is_closed === false).length ?? 0


    
  // ─────────────────────────────
  // UI
  // ─────────────────────────────

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-12 text-white">

      {/* HEADER */}
      <h1 className="text-2xl sm:text-3xl font-bold text-[#d9ff00]">
        Abteilungs-Dashboard
      </h1>

      {/* KPI GRID */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Jugendliche" value={youthCount} />
        <StatsCard title="Betreuer" value={supervisorCount} />
        <StatsCard title="Dienste gesamt" value={servicesCount} />
        <StatsCard title="Stunden gesamt" value={totalHours.toFixed(2)} />
      </div>

      {/* DIENSTE */}
      <div className="space-y-6">

        <h2 className="text-lg font-semibold text-[#d9ff00]">
          Dienste
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Nächster Dienst */}
          <div className="bg-[#1e293b] rounded-2xl p-6 border border-slate-700">
            <div className="text-sm text-slate-400 mb-2">
              Nächster Dienst
            </div>

            {nextService ? (
              <>
                <div className="text-lg font-semibold">
                  {nextService.title}
                </div>
                <div className="text-sm text-[#d9ff00]">
                  {new Date(nextService.service_date).toLocaleDateString()}
                </div>
              </>
            ) : (
              <div className="text-[#d9ff00]">
                Kein geplanter Dienst
              </div>
            )}
          </div>

          {/* Übersicht + Button */}
          <div className="bg-[#1e293b] rounded-2xl p-6 border border-slate-700 space-y-6 hover:border-[#d9ff00] transition">

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400">
                  Offene Dienste
                </div>
                <div className="text-2xl font-bold text-[#d9ff00]">
                  {openServices}
                </div>
              </div>

              <a
                href="/services"
                className="bg-[#d9ff00] text-black px-5 py-3 rounded-xl font-semibold min-h-[48px] flex items-center justify-center"
              >
                Zum Dienstplan
              </a>
            </div>

          </div>

        </div>

        {/* Nächste 3 */}
        <div className="bg-[#1e293b] rounded-2xl p-6 border border-slate-700">
          <div className="font-semibold mb-4">
            Nächste 3 Dienste
          </div>

          <div className="space-y-4">
            {nextThree.map(service => (
              <div
                key={service.id}
                className="border-b border-slate-700 pb-3 last:border-none"
              >
                <div>{service.title}</div>
                <div className="text-sm text-[#d9ff00]">
                  {new Date(service.service_date).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* MITGLIEDER */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-[#d9ff00]">
          Mitglieder
        </h2>

        <div className="bg-[#1e293b] rounded-2xl p-6 border border-slate-700 hover:border-[#d9ff00] transition">

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-400">
                Aktive Mitglieder
              </div>
              <div className="text-2xl font-bold text-[#d9ff00]">
                {activeMembers}
              </div>
            </div>

            <div>
              <div className="text-sm text-slate-400">
                Archivierte Mitglieder
              </div>
              <div className="text-2xl font-bold text-[#ff7300]">
                {archivedMembers}
              </div>
            </div>
          </div>

        </div>
    

    </div>

      {/* GEBURTSTAGE */}
      {(nextBirthdays.length > 0 || recentBirthdays.length > 0) && (
        <div className="space-y-6">

          <h2 className="text-lg font-semibold text-[#d9ff00]">
            Geburtstage
          </h2>

          <div className="
            bg-[#1e293b]
            rounded-2xl
            p-6
            border border-slate-700
            space-y-8
          ">

            {/* NÄCHSTE 3 */}
            {nextBirthdays.length > 0 && (
              <div className="space-y-4">

                <div className="text-sm text-slate-400">
                  Nächste Geburtstage
                </div>

                {nextBirthdays.map((member, index) => {

                  const isNext = index === 0
                  const isToday =
                    member.nextBirthday.toDateString() === today.toDateString()

                  return (
                    <div
                      key={member.id}
                      className={`
                        p-4
                        rounded-xl
                        border
                        transition
                        ${isNext
                          ? "bg-[#0f172a] border-[#d9ff00]"
                          : "bg-[#0f172a] border-slate-700"}
                      `}
                    >
                      <div className="flex justify-between items-center">

                        <div>
                          <div className="font-semibold">
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
                    </div>
                  )
                })}

              </div>
            )}

            {/* LETZTE 2 */}
            {recentBirthdays.length > 0 && (
              <div className="space-y-4 border-t border-slate-700 pt-6">

                <div className="text-sm text-slate-400">
                  Kürzlich gefeiert
                </div>

                {recentBirthdays.map(member => {

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
                      "
                    >
                      <div>
                        <div className="font-semibold">
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
            )}

          </div>
        </div>
      )}

    </div>
  )
}