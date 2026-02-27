"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function ServicesMobileView({
  services,
  role,
  departments,
  departmentId,
  reload
}) {

  const [expandedArchive, setExpandedArchive] = useState(null);
  const [archiveAttendance, setArchiveAttendance] = useState({});
  const [showCreate, setShowCreate] = useState(false);
  const [showArchive, setShowArchive] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [serviceDate, setServiceDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");

  const router = useRouter();

  /* ================= SORTING ================= */

  const offeneDienste = services
    .filter(s => !s.is_closed)
    .sort((a, b) =>
      new Date(a.service_date) - new Date(b.service_date)
    );

  const archivDienste = services.filter(s => s.is_closed);

  /* ================= AKTUELLER DIENST ================= */

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentServiceId = offeneDienste.find((s) => {
    const d = new Date(s.service_date);
    d.setHours(0, 0, 0, 0);
    return d >= today;
  })?.id;

  /* ================= FORMAT ================= */

  function formatDateGerman(dateString) {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("de-DE");
  }

  function formatTimeShort(timeString) {
    if (!timeString) return "-";
    return timeString.slice(0, 5);
  }

  /* ================= ACTIONS ================= */

  async function closeService(service) {

    if (!service.end_time) {
      alert("Endzeit fehlt");
      return;
    }

    const today = new Date();
    const serviceDateObj = new Date(service.service_date);

    today.setHours(0,0,0,0);
    serviceDateObj.setHours(0,0,0,0);

    if (today < serviceDateObj) {
      alert("Dienst liegt in Zukunft");
      return;
    }

    const { data: members } = await supabase
      .from("members")
      .select("id")
      .eq("department_id", service.department_id)
      .eq("active", true);

    const { data: attendance } = await supabase
      .from("attendance")
      .select("member_id, status")
      .eq("service_id", service.id);

    const missing = members.filter(member => {
      const entry = attendance.find(
        a => String(a.member_id) === String(member.id)
      );
      return !entry || !entry.status;
    });

    if (missing.length > 0) {
      alert(`${missing.length} Teilnehmer/in noch nicht zugeordnet.`);
      return;
    }

    await supabase
      .from("services")
      .update({
        is_closed: true,
        closed_at: new Date().toISOString()
      })
      .eq("id", service.id);

    reload();
  }

  async function toggleArchive(serviceId) {

    if (expandedArchive === serviceId) {
      setExpandedArchive(null);
      return;
    }

    if (!archiveAttendance[serviceId]) {
      const { data } = await supabase
        .from("attendance")
        .select(`status, members:member_id (first_name,last_name,type)`)
        .eq("service_id", serviceId);

      setArchiveAttendance(prev => ({
        ...prev,
        [serviceId]: data || []
      }));
    }

    setExpandedArchive(serviceId);
  }

  async function reopenService(service) {
    if (role !== "city_admin") return;

    if (!window.confirm(`Dienst "${service.title}" wirklich wieder öffnen?`)) return;

    await supabase
      .from("services")
      .update({ is_closed: false, closed_at: null })
      .eq("id", service.id);

    reload();
  }

  async function deleteService(service) {
    if (role !== "city_admin") return;

    if (!window.confirm(`Dienst "${service.title}" löschen?`)) return;

    await supabase
      .from("services")
      .delete()
      .eq("id", service.id);

    reload();
  }

  async function createService() {
    const finalDepartment =
      role === "city_admin"
        ? selectedDepartment
        : departmentId;

    if (!finalDepartment) {
      alert("Bitte Ortswehr wählen.");
      return;
    }

    await supabase
      .from("services")
      .insert([{
        title,
        description,
        service_date: serviceDate,
        start_time: startTime,
        end_time: endTime || null,
        department_id: finalDepartment,
        is_closed: false
      }]);

    setShowCreate(false);
    reload();
  }

  /* ================= RENDER ================= */

  return (
  <div className="min-h-screen bg-[#0f172a] text-white px-3 pt-4 pb-28 space-y-5 overflow-x-hidden">

    {/* ================= OFFENE ================= */}

    <h2 className="text-lg font-semibold text-[#d9ff00]">
      Offene Dienste
    </h2>

    {offeneDienste.map((s) => (
      <div
        key={s.id}
        className={`
          w-full box-border p-4 rounded-xl space-y-2 transition
          ${s.id === currentServiceId
            ? "bg-gradient-to-r from-[#1e3a8a]/50 to-[#1e293b] border-l-4 border-[#d9ff00] shadow-lg"
            : "bg-[#1e293b]"}
        `}
      >

        {s.id === currentServiceId && (
          <div className="text-[10px] text-[#d9ff00] font-semibold uppercase tracking-wide">
            Aktueller Dienst
          </div>
        )}

        <div className="font-semibold break-words">
          {s.title}
        </div>

        <div className="text-xs text-slate-400 break-words">
          {formatDateGerman(s.service_date)} •{" "}
          {formatTimeShort(s.start_time)} –{" "}
          {s.end_time ? formatTimeShort(s.end_time) : "offen"}
        </div>

        <div className="flex gap-2 pt-2 min-w-0">

  <Link href={`/services/${s.id}`} className="flex-1 min-w-0">
    <button className="w-full flex-1 bg-slate-700 py-3 rounded-lg text-[#d9ff00]">
      Bearbeiten
    </button>
  </Link>

  {role === "city_admin" && (
    <button
      onClick={() => deleteService(s)}
      className="w-full flex-1 bg-slate-700 py-3 rounded-lg text-[#d9ff00]"
    >
      Löschen
    </button>
  )}

</div>
      </div>
    ))}

    {/* ================= ARCHIV ================= */}

    <div
      onClick={() => setShowArchive(!showArchive)}
      className="w-full box-border flex justify-between items-center bg-[#1e293b] px-4 py-3 rounded-xl cursor-pointer"
    >
      <span className="text-[#d9ff00] font-semibold text-sm break-words">
        Archiv ({archivDienste.length})
      </span>
      <span className="text-[#d9ff00] font-bold text-lg">
        {showArchive ? "−" : "+"}
      </span>
    </div>

    {showArchive && archivDienste.map((s) => (
      <div
        key={s.id}
        className="w-full box-border bg-[#1e293b] p-4 rounded-xl space-y-3"
      >

        <div className="font-semibold break-words">
          {s.title}
        </div>

        <div className="text-xs text-slate-400 break-words">
          {formatDateGerman(s.service_date)} •{" "}
          {formatTimeShort(s.start_time)} –{" "}
          {formatTimeShort(s.end_time)}
        </div>

        <button
          onClick={() => toggleArchive(s.id)}
          className="w-full flex-1 bg-slate-700 py-3 rounded-lg text-[#d9ff00]"
        >
          {expandedArchive === s.id ? "Schließen" : "Details"}
        </button>

        {expandedArchive === s.id && (
          <div className="space-y-6 pt-3 border-t border-slate-700">

            {s.description && (
              <div className="bg-[#0f172a] p-3 rounded-lg text-sm whitespace-pre-line break-words"> 
                {s.description}
              </div>
            )}

            {archiveAttendance[s.id]?.length > 0 ? (() => {

              const present = archiveAttendance[s.id].filter(a => a.status === "present");
              const excused = archiveAttendance[s.id].filter(a => a.status === "excused");
              const unexcused = archiveAttendance[s.id].filter(a => a.status === "unexcused");

              const Section = ({ title, color, data }) => (
                data.length > 0 && (
                  <div>
                    <div className={`font-semibold mb-2 ${color}`}>
                      {title} ({data.length})
                    </div>

                    <div className="space-y-2">
                      {data.map((a, index) => (
                        <div
                          key={index}
                          className="bg-[#1e293b] p-3 rounded-lg text-sm break-words"
                        >
                          {a.members.first_name} {a.members.last_name}
                          <div className="text-xs text-slate-400">
                            {a.members.type === "child"
                              ? "Jugendlicher"
                              : "Betreuer"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              );

              return (
                <>
                  <Section title="🟢 Anwesend" color="text-green-400" data={present} />
                  <Section title="🟡 Entschuldigt" color="text-yellow-400" data={excused} />
                  <Section title="🔴 Unentschuldigt" color="text-red-400" data={unexcused} />
                </>
              );

            })() : (
              <div className="text-slate-400 text-sm">
                Keine Teilnehmer gespeichert.
              </div>
            )}

            {role === "city_admin" && (
              <div className="flex gap-2 pt-3 min-w-0">
                <button
                  onClick={() => reopenService(s)}
                  className="flex-1 bg-slate-700 py-3 rounded-lg text-[#d9ff00]"
                >
                  Wieder öffnen
                </button>

                <button
                  onClick={() => deleteService(s)}
                  className="flex-1 bg-slate-700 py-3 rounded-lg text-[#d9ff00]"
                >
                  Löschen
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    ))}

    {/* ================= FLOATING BUTTON ================= */}

    <button
      onClick={() => setShowCreate(true)}
      className="fixed bottom-5 right-4 w-14 h-14 rounded-full bg-[#d9ff00] text-black text-2xl font-bold shadow-xl hover:scale-105 transition"
    >
      +
    </button>

  </div>
);
}