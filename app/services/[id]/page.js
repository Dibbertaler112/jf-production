"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function ServiceDetail() {
  const { id } = useParams();
  const router = useRouter();

  const [service, setService] = useState(null);
  const [members, setMembers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [attendanceDraft, setAttendanceDraft] = useState({});
  const [loading, setLoading] = useState(true);

  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [editServiceDate, setEditServiceDate] = useState("");

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    async function loadData() {

      const { data: serviceData } = await supabase
        .from("services")
        .select("*")
        .eq("id", id)
        .single();

      if (!serviceData) return;

      setService(serviceData);

      setEditTitle(serviceData.title || "");
      setEditServiceDate(serviceData.service_date || "");
      setEditDescription(serviceData.description || "");
      setEditStartTime(serviceData.start_time || "");
      setEditEndTime(serviceData.end_time || "");

      const { data: memberData } = await supabase
        .from("members")
        .select("*")
        .eq("department_id", serviceData.department_id)
        .eq("active", true)
        .order("last_name", { ascending: true });

      setMembers(memberData || []);

      const { data: attendanceData } = await supabase
        .from("attendance")
        .select("*")
        .eq("service_id", id);

      setAttendance(attendanceData || []);
      setLoading(false);
    }

    loadData();
  }, [id]);

  /* ================= SAVE ATTENDANCE ================= */

  async function saveAttendance() {
    if (!service) return;

    function timeToDecimal(timeString) {
      if (!timeString) return 0;
      const [h, m] = timeString.split(":");
      return parseInt(h) + parseInt(m) / 60;
    }

    const startDecimal = timeToDecimal(service.start_time);
    const endDecimal = timeToDecimal(service.end_time);
    const hours = Math.max(0, endDecimal - startDecimal);

    for (const memberId in attendanceDraft) {

      const status = attendanceDraft[memberId];

      const existing = attendance.find(
        (a) => String(a.member_id) === String(memberId)
      );

      const calculatedHours =
        status === "present" ? hours : 0;

      if (existing) {
        await supabase
          .from("attendance")
          .update({
            status,
            hours: calculatedHours
          })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("attendance")
          .insert({
            service_id: id,
            member_id: memberId,
            status,
            hours: calculatedHours
          });
      }
    }

    const { data: newAttendance } = await supabase
      .from("attendance")
      .select("*")
      .eq("service_id", id);

    setAttendance(newAttendance || []);
    setAttendanceDraft({});
    alert("Gespeichert!");
  }

  /* ================= UPDATE SERVICE ================= */

  async function updateServiceDetails() {

    const { error } = await supabase
      .from("services")
      .update({
        title: editTitle,
        description: editDescription,
        service_date: editServiceDate,
        start_time: editStartTime,
        end_time: editEndTime
      })
      .eq("id", id);

    if (error) {
      alert("Fehler: " + error.message);
      return;
    }

    setService({
      ...service,
      title: editTitle,
      description: editDescription,
      service_date: editServiceDate,
      start_time: editStartTime,
      end_time: editEndTime
    });

    setEditMode(false);
  }
  function cancelChanges() {
    router.push("/services");
  }
  function formatDateGerman(dateString) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("de-DE");
}

function formatTimeGerman(timeString) {
  if (!timeString) return "-";
  return timeString.slice(0, 5);
}
 /* ================= CLOSE SERVICE ================= */

async function closeService() {

  if (!service) return;

  /* === 1️⃣ DATUM PRÜFEN === */

  const today = new Date();
  const serviceDateObj = new Date(service.service_date);

  today.setHours(0, 0, 0, 0);
  serviceDateObj.setHours(0, 0, 0, 0);

  if (today < serviceDateObj) {
    alert("Dienst liegt in der Zukunft und kann noch nicht abgeschlossen werden.");
    return;
  }

  /* === 2️⃣ ENDZEIT PRÜFEN === */

  if (!service.end_time) {
    alert("Endzeit fehlt.");
    return;
  }

  /* === 3️⃣ TEILNEHMER STATUS PRÜFEN === */

  const allAssigned = members.every((m) => {

    const draftStatus = attendanceDraft[m.id];

    const savedStatus = attendance.find(
      (a) => a.member_id === m.id
    )?.status;

    const finalStatus = draftStatus ?? savedStatus ?? null;

    return finalStatus !== null && finalStatus !== "";
  });

  if (!allAssigned) {
    alert("Nicht alle Teilnehmer haben einen Status.");
    return;
  }

  /* === 4️⃣ BESTÄTIGUNG === */

  const confirmClose = confirm(
    "Dienst wirklich abschließen? Danach keine Änderungen mehr möglich."
  );

  if (!confirmClose) return;

  /* === 5️⃣ ABSCHLIESSEN === */

  await supabase
    .from("services")
    .update({
      is_closed: true,
      closed_at: new Date().toISOString()
    })
    .eq("id", id);

  setService({ ...service, is_closed: true });
}
if (!service) {
  return (
    <div className="min-h-screen flex items-center justify-center text-[#d9ff00]">
      Dienst nicht gefunden...
    </div>
  );
}
  /* ================= RENDER ================= */

  return (
    <div className="min-h-screen bg-[#0f172a] text-white px-4 md:px-10 py-8 space-y-8 overflow-x-hidden w-full max-w-full">

      {/* ================= HEADER ================= */}

      <div className="bg-[#1e293b] border border-slate-700 rounded-3xl p-6 shadow-xl">

        {!editMode ? (
          <div className="space-y-4">

            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">

              <div>
                <h1 className="text-2xl font-bold text-[#d9ff00]">
                  {service.title}
                </h1>

                {service.description && (
                  <p className="text-slate-400 mt-2 whitespace-pre-line">
                    {service.description}
                  </p>
                )}

                <div className="text-sm text-slate-400 mt-3">
                  📅 {formatDateGerman(service.service_date)} • ⏰ {formatTimeGerman(service.start_time)} - {formatTimeGerman(service.end_time)}
                </div>
              </div>

              {!service.is_closed && (
                <button
                  onClick={() => setEditMode(true)}
                  className="
  w-full
  md:w-auto
  bg-slate-700
  hover:bg-slate-600
  transition
  px-4
  py-2
  rounded-lg
  text-[#d9ff00]
  text-sm
"
                >
                  Bearbeiten
                </button>
              )}
            </div>

          </div>
        ) : (

          <div className="space-y-4">

            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3"
              placeholder="Titel"
            />

            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3"
              placeholder="Beschreibung"
              rows={3}
            />

            <input
              type="date"
              value={editServiceDate}
              onChange={(e) => setEditServiceDate(e.target.value)}
              className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 appearance-none"
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                type="time"
                value={editStartTime}
                onChange={(e) => setEditStartTime(e.target.value)}
                className="bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 appearance-none"
              />

              <input
                type="time"
                value={editEndTime}
                onChange={(e) => setEditEndTime(e.target.value)}
                className="bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 appearance-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={updateServiceDetails}
                className="bg-[#d9ff00] text-black px-6 py-3 rounded-xl font-semibold"
              >
                Speichern
              </button>

              <button
                onClick={() => setEditMode(false)}
                className="bg-slate-700 px-6 py-3 rounded-xl font-semibold"
              >
                Abbrechen
              </button>
            </div>

          </div>
        )}
      </div>

      {/* ================= ANWESENHEIT ================= */}

      <div className="bg-[#1e293b] border border-slate-700 rounded-3xl shadow-xl overflow-hidden">

        <div className="px-6 py-4 border-b border-slate-700 text-lg font-semibold text-[#d9ff00]">
          Anwesenheit
        </div>

        <div className="p-6 space-y-4">

          {members.map((m) => {

            const entry = attendance.find(a => a.member_id === m.id);

            const currentStatus =
              attendanceDraft[m.id] ??
              entry?.status ??
              "";

            return (
              <div
                key={m.id}
                className="bg-[#0f172a] border border-slate-700 rounded-xl p-4"
              >

                <div className="font-semibold">
                  {m.first_name} {m.last_name}
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 w-full max-w-full">

                  <StatusButton
                    disabled={service.is_closed}
                    label="Anwesend"
                    active={currentStatus === "present"}
                    onClick={() =>
                      setAttendanceDraft({
                        ...attendanceDraft,
                        [m.id]: "present"
                      })
                    }
                  />

                  <StatusButton
                    disabled={service.is_closed}
                    label="Entschuldigt"
                    active={currentStatus === "excused"}
                    onClick={() =>
                      setAttendanceDraft({
                        ...attendanceDraft,
                        [m.id]: "excused"
                      })
                    }
                  />

                  <StatusButton
                    disabled={service.is_closed}
                    label="Fehlt"
                    active={currentStatus === "unexcused"}
                    onClick={() =>
                      setAttendanceDraft({
                        ...attendanceDraft,
                        [m.id]: "unexcused"
                      })
                    }
                  />

                </div>
              </div>
            );
          })}

        </div>
      </div>

      {/* ================= FOOTER ================= */}

      <div className="flex flex-col md:flex-row gap-4 pt-4">

        {!service.is_closed && (
          <>
            <button
              onClick={saveAttendance}
              className="flex-1 bg-[#d9ff00] text-black py-3 rounded-xl font-semibold"
            >
              Speichern
            </button>

            <button
              onClick={closeService}
              className="flex-1 bg-green-600 py-3 rounded-xl font-semibold"
            >
              Abschließen
            </button>
          </>
        )}

        <button
          onClick={cancelChanges}
          className="flex-1 bg-slate-700 py-3 rounded-xl font-semibold"
        >
          Zurück
        </button>

      </div>

    </div>
  );
}

/* ================= STATUS BUTTON ================= */

function StatusButton({ label, active, onClick, disabled }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`
        w-full
        min-w-0
        break-words
        whitespace-normal
        text-center
        py-2
        rounded-lg
        text-[11px]
        leading-tight
        font-semibold
        border
        transition
        ${active
          ? "border-[#d9ff00] bg-[#d9ff00] text-black"
          : "border-slate-700 bg-slate-700"}
        ${disabled ? "opacity-40 cursor-not-allowed" : ""}
      `}
    >
      {label}
    </button>
  );
}