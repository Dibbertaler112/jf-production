"use client";

import { useState, useEffect, Fragment } from "react";
import { supabase } from "../../lib/supabaseClient";
import ServiceImportUpload from "../../components/ServiceImportUpload";
import Link from "next/link";

export default function Services() {

  const [services, setServices] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [role, setRole] = useState(null);
  const [departmentId, setDepartmentId] = useState(null);
  const [editingService, setEditingService] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [serviceDate, setServiceDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");

  const [showServices, setShowServices] = useState(false);
  const [showArchiveBlock, setShowArchiveBlock] = useState(false);
  const [loading, setLoading] = useState(true);

  const [expandedArchive, setExpandedArchive] = useState(null);
  const [archiveAttendance, setArchiveAttendance] = useState({});


  
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, department_id")
        .eq("id", user.id)
        .single();

      setRole(profile.role);
      setDepartmentId(profile.department_id);

      if (profile.role === "city_admin") {
        const { data: deps } = await supabase
          .from("departments")
          .select("*");
        setDepartments(deps || []);
      }

      loadServices(profile.role, profile.department_id);
      setLoading(false);
    }

    init();
  }, []);

  async function loadServices(role, departmentId) {
    let query = supabase
      .from("services")
      .select(`*, departments:department_id (name)`)
      .order("is_closed", { ascending: true })
      .order("service_date", { ascending: false });

    if (role !== "city_admin") {
      query = query.eq("department_id", departmentId);
    }

    const { data } = await query;
    setServices(data || []);
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

    const { error } = await supabase
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

    if (!error) {
      setTitle("");
      setDescription("");
      setServiceDate("");
      setStartTime("");
      setEndTime("");
      setSelectedDepartment("");
      loadServices(role, departmentId);
    } else {
      alert(error.message);
    }
  }

  async function updateService() {
    const { error } = await supabase
      .from("services")
      .update({
        title: editingService.title,
        description: editingService.description,
        service_date: editingService.service_date,
        start_time: editingService.start_time,
        end_time: editingService.end_time || null,
        department_id: editingService.department_id
      })
      .eq("id", editingService.id);

    if (!error) {
      setEditingService(null);
      loadServices(role, departmentId);
    } else {
      alert(error.message);
    }
  }

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
      const entry = attendance.find(a => String(a.member_id) === String(member.id));
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

    loadServices(role, departmentId);
  }

  async function deleteService(service) {
    if (role !== "city_admin") {
      alert("Nur der Stadtadmin darf Dienste löschen.");
      return;
    }

    if (!window.confirm(`⚠️ Dienst "${service.title}" wirklich löschen?`)) return;

    await supabase.from("services").delete().eq("id", service.id);
    loadServices(role, departmentId);
  }

  async function reopenService(service) {
    if (role !== "city_admin") return;

    if (!window.confirm(`Dienst "${service.title}" wirklich wieder öffnen?`)) return;

    await supabase
      .from("services")
      .update({ is_closed: false, closed_at: null })
      .eq("id", service.id);

    loadServices(role, departmentId);
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

      setArchiveAttendance(prev => ({ ...prev, [serviceId]: data || [] }));
    }

    setExpandedArchive(serviceId);
  }

  function getCountdown(dateString) {
    const today = new Date();
    const serviceDateObj = new Date(dateString);
    today.setHours(0,0,0,0);
    serviceDateObj.setHours(0,0,0,0);
    const diffDays = Math.ceil((serviceDateObj - today)/(1000*60*60*24));
    if (diffDays === 0) return "Heute";
    if (diffDays === 1) return "Morgen";
    return `In ${diffDays} Tagen`;
  }

  function formatDateGerman(dateString) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("de-DE");
}

function formatTimeShort(timeString) {
  if (!timeString) return "-";
  return timeString.slice(0, 5); // schneidet :00 Sekunden ab
}
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#d9ff00]">
        Lade...
      </div>
    );
  }

  const offeneDienste = services
    .filter(s => !s.is_closed)
    .sort((a, b) => new Date(a.service_date) - new Date(b.service_date));

  const today = new Date();
  today.setHours(0,0,0,0);

  let currentIndex = offeneDienste.findIndex(s => {
    const d = new Date(s.service_date);
    d.setHours(0,0,0,0);
    return d >= today;
  });

  if (currentIndex === -1 && offeneDienste.length > 0) {
    currentIndex = offeneDienste.length - 1;
  }

  const currentService = offeneDienste[currentIndex];
  const olderServices = offeneDienste.slice(0, currentIndex).slice(-3);
  const upcomingServices = offeneDienste.slice(currentIndex + 1, currentIndex + 4);
  const archivDienste = services.filter(s => s.is_closed);

  if (loading) return (
  <div className="min-h-screen flex items-center justify-center text-[#d9ff00]">
    Lade...
  </div>
);

return (
<div className="min-h-screen bg-[#0f172a] text-white">

<div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-12">



{/* ================= NEUER DIENST ================= */}

<div className="bg-[#1e293b] rounded-3xl border border-slate-700 shadow-xl p-8">

<div
  className="flex justify-between items-center cursor-pointer"
  onClick={() => setShowServices(!showServices)}
>
  <h2 className="text-xl font-semibold text-[#d9ff00]">
    Neuen Dienst anlegen
  </h2>
  <span className="text-[#d9ff00] text-xl font-bold">
    {showServices ? "−" : "+"}
  </span>
</div>

{showServices && (
<div className="mt-8 space-y-6">

{(role === "city_admin" || role === "department_admin") && (
<>
<div className="grid gap-6">

<input
  placeholder="Titel"
  value={title}
  onChange={(e) => setTitle(e.target.value)}
  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 h-[48px]"
/>

<input
  placeholder="Beschreibung"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 h-[48px]"
/>

<input
  type="date"
  value={serviceDate}
  onChange={(e) => setServiceDate(e.target.value)}
  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 h-[48px]"
/>

<div className="grid grid-cols-2 gap-4">
  <input
    type="time"
    value={startTime}
    onChange={(e) => setStartTime(e.target.value)}
    className="bg-[#0f172a] border border-slate-700 rounded-xl px-4 h-[48px]"
  />
  <input
    type="time"
    value={endTime}
    onChange={(e) => setEndTime(e.target.value)}
    className="bg-[#0f172a] border border-slate-700 rounded-xl px-4 h-[48px]"
  />
</div>

{role === "city_admin" && (
<select
  value={selectedDepartment}
  onChange={(e) => setSelectedDepartment(e.target.value)}
  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 h-[48px]"
>
  <option value="">Ortswehr wählen</option>
  {departments.map((d) => (
    <option key={d.id} value={d.id}>{d.name}</option>
  ))}
</select>
)}

<button
  onClick={createService}
  className="bg-[#d9ff00] text-black py-3 rounded-xl font-semibold hover:opacity-90 transition"
>
  Dienst speichern
</button>

</div>
</>
)}
</div>
)}
</div>

{/* ================= OFFENE DIENSTE ================= */}

<div className="bg-[#1e293b] rounded-3xl border border-slate-700 shadow-xl overflow-hidden">

<div className="px-8 py-6 border-b border-slate-700 text-lg font-semibold text-[#d9ff00]">
Offene Dienste
</div>

<div className="overflow-x-auto">
<table className="w-full text-left">
<thead className="bg-[#0f172a] text-slate-400 text-sm">
<tr>
<th className="px-6 py-4">Datum</th>
<th className="px-6 py-4">Titel</th>
<th className="px-6 py-4">Ortswehr</th>
<th className="px-6 py-4">Uhrzeit</th>
<th className="px-6 py-4">Aktionen</th>
</tr>
</thead>

<tbody>

{/* ===== OLDER ===== */}
{olderServices.map((s) => (
<tr key={s.id} className="opacity-60 border-t border-slate-700 hover:bg-[#0f172a] transition">
<td className="px-6 py-4">{formatDateGerman(s.service_date)}</td>
<td className="px-6 py-4">{s.title}</td>
<td className="px-6 py-4">{s.departments?.name || "-"}</td>
<td className="px-6 py-4">{formatTimeShort(s.start_time)} - {s.end_time ? formatTimeShort(s.end_time) : "offen"}</td> 
<td className="px-6 py-4 space-x-4">
<Link href={`/services/${s.id}`}>
<button className="bg-slate-700 hover:bg-slate-600 transition py-3 rounded-lg text-[#d9ff00]">Bearbeiten</button>
</Link>
<button onClick={() => closeService(s)} className="bg-slate-700 hover:bg-slate-600 transition py-3 rounded-lg text-[#d9ff00]">Abschließen</button>
{role === "city_admin" && (
<button onClick={() => deleteService(s)} className="bg-slate-700 hover:bg-slate-600 transition py-3 rounded-lg text-[#d9ff00]">Löschen</button>
)}
</td>
</tr>
))}

{/* ===== CURRENT ===== */}
{currentService && (
<tr
className="border-t border-slate-700 bg-[#1e3a8a]/30 border-l-4 border-[#d9ff00]"
>
<td className="px-6 py-4 font-bold">{formatDateGerman(currentService.service_date)}</td>
<td className="px-6 py-4 font-bold">{currentService.title}</td>
<td className="px-6 py-4">{currentService.departments?.name || "-"}</td>
<td className="px-6 py-4">
{formatTimeShort(currentService.start_time)} - 
{currentService.end_time ? formatTimeShort(currentService.end_time) : "offen"}
</td>
<td className="px-6 py-4 space-x-4">
<Link href={`/services/${currentService.id}`}>
<button className="bg-slate-700 hover:bg-slate-600 transition py-3 rounded-lg text-[#d9ff00]">Bearbeiten</button>
</Link>
<button onClick={() => closeService(currentService)} className="bg-slate-700 hover:bg-slate-600 transition py-3 rounded-lg text-[#d9ff00]">Abschließen</button>
{role === "city_admin" && (
<button onClick={() => deleteService(currentService)} className="bg-slate-700 hover:bg-slate-600 transition py-3 rounded-lg text-[#d9ff00]">Löschen</button>
)}
</td>
</tr>
)}

{/* ===== UPCOMING ===== */}
{upcomingServices.map((s) => (
<tr key={s.id} className="border-t border-slate-700 hover:bg-[#0f172a] transition">
<td className="px-6 py-4">{formatDateGerman(s.service_date)}</td>
<td className="px-6 py-4">{s.title}</td>
<td className="px-6 py-4">{s.departments?.name || "-"}</td>
<td className="px-6 py-4">
{formatTimeShort(s.start_time)} - {s.end_time ? formatTimeShort(s.end_time) : "offen"}
<div className="text-xs text-[#d9ff00] mt-1">
⏳ {getCountdown(s.service_date)}
</div>
</td>
<td className="px-6 py-4 space-x-4">
<Link href={`/services/${s.id}`}>
<button className="bg-slate-700 hover:bg-slate-600 transition py-3 rounded-lg text-[#d9ff00]">Bearbeiten</button>
</Link>
<button onClick={() => closeService(s)} className="bg-slate-700 hover:bg-slate-600 transition py-3 rounded-lg text-[#d9ff00]">Abschließen</button>
{role === "city_admin" && (
<button onClick={() => deleteService(s)} className="bg-slate-700 hover:bg-slate-600 transition py-3 rounded-lg text-[#d9ff00]">Löschen</button>
)}
</td>
</tr>
))}

</tbody>
</table>
</div>
</div>

{/* ================= ARCHIV BLOCK ================= */}

<div className="bg-[#1e293b] rounded-3xl border border-slate-700 shadow-xl overflow-hidden">

<div
className="px-8 py-6 border-b border-slate-700 flex justify-between items-center cursor-pointer"
onClick={() => setShowArchiveBlock(!showArchiveBlock)}
>
<h3 className="text-lg font-semibold text-[#d9ff00]">
Archivierte Dienste
</h3>
<span className="text-[#d9ff00] font-bold text-xl">
{showArchiveBlock ? "−" : "+"}
</span>
</div>

{showArchiveBlock && (
<div className="overflow-x-auto">
<table className="w-full text-left">
<thead className="bg-[#0f172a] text-slate-400 text-sm">
<tr>
<th className="px-6 py-4">Datum</th>
<th className="px-6 py-4">Titel</th>
<th className="px-6 py-4">Ortswehr</th>
<th className="px-6 py-4">Uhrzeit</th>
<th className="px-6 py-4">Aktionen</th>
</tr>
</thead>

<tbody>
  {archivDienste.map((s) => (
    <Fragment key={s.id}>

      {/* ================= HAUPTZEILE ================= */}
      <tr className="border-t border-slate-700 hover:bg-[#0f172a] transition">
        <td className="px-6 py-4">
          {formatDateGerman(s.service_date)}
        </td>

        <td className="px-6 py-4">
          {s.title}
        </td>

        <td className="px-6 py-4">
          {s.departments?.name || "-"}
        </td>

        <td className="px-6 py-4">
          {formatTimeShort(s.start_time)} -{" "}
          {s.end_time ? formatTimeShort(s.end_time) : "offen"}
        </td>

        <td className="px-6 py-4 space-x-3">
          <button
            onClick={() => toggleArchive(s.id)}
            className="bg-slate-700 hover:bg-slate-600 transition py-3 rounded-lg text-[#d9ff00]"
          >
            {expandedArchive === s.id ? "Schließen" : "Details"}
          </button>

          {role === "city_admin" && (
            <>
              <button
                onClick={() => reopenService(s)}
                className="bg-slate-700 hover:bg-slate-600 transition py-3 rounded-lg text-[#d9ff00]"
              >
                Wieder öffnen
              </button>

              <button
                onClick={() => deleteService(s)}
                className="bg-slate-700 hover:bg-slate-600 transition py-3 rounded-lg text-[#d9ff00]"
              >
                Löschen
              </button>
            </>
          )}
        </td>
      </tr>

      {/* ================= DETAILZEILE ================= */}
      {expandedArchive === s.id && (
        <tr className="bg-[#0f172a]">
          <td colSpan="5" className="px-8 py-8">

            <div className="space-y-8">

              {/* Beschreibung */}
              {s.description && (
                <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-6">
                  <div className="text-sm text-slate-400 mb-2">
                    Beschreibung
                  </div>
                  <div className="whitespace-pre-line">
                    {s.description}
                  </div>
                </div>
              )}

              {/* Teilnehmer */}
              <div>
                <div className="text-sm text-slate-400 mb-6">
                  Teilnehmer ({archiveAttendance[s.id]?.length || 0})
                </div>

                {archiveAttendance[s.id]?.length > 0 ? (() => {

                  const present = archiveAttendance[s.id].filter(a => a.status === "present");
                  const excused = archiveAttendance[s.id].filter(a => a.status === "excused");
                  const unexcused = archiveAttendance[s.id].filter(a => a.status === "unexcused");

                  const Section = ({ title, color, data }) => (
                    data.length > 0 && (
                      <div className="mb-8">
                        <div className={`font-semibold mb-4 ${color}`}>
                          {title} ({data.length})
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {data.map((a, index) => (
                            <div
                              key={index}
                              className="bg-[#1e293b] border border-slate-700 rounded-xl p-4"
                            >
                              <div className="font-semibold">
                                {a.members.first_name} {a.members.last_name}
                              </div>
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
                  <div className="text-slate-400">
                    Keine Teilnehmer gespeichert.
                  </div>
                )}
              </div>

            </div>

          </td>
        </tr>
      )}

    </Fragment>
  ))}
</tbody>
</table>
</div>
)}

</div>

{/* ================= IMPORT ================= */}

<div className="bg-[#1e293b] rounded-3xl border border-slate-700 shadow-xl p-8">
  <h3 className="text-lg font-semibold text-[#d9ff00] mb-6">
    📥 Dienstplan aus Excel importieren
  </h3>
  <ServiceImportUpload />
</div>

</div>
</div>
);
}