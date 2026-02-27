"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function YouthEditService() {
  const router = useRouter();
  const { id } = useParams();

  const [service, setService] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const { data: serviceData } = await supabase
      .from("services")
      .select("*")
      .eq("id", id)
      .single();

    setService(serviceData);

    const { data: membersData } = await supabase
      .from("members")
      .select("*")
      .eq("department_id", serviceData.department_id)
      .eq("active", true)
      .order("last_name");

    const { data: attendanceData } = await supabase
      .from("attendance")
      .select("*")
      .eq("service_id", id);

    const merged = membersData.map((member) => {
      const existing = attendanceData.find(
        (a) => a.member_id === member.id
      );

      return {
        ...member,
        status: existing ? existing.status : "",
        hours: existing ? existing.hours : 0,
      };
    });

    setMembers(merged);
    setLoading(false);
  }



  function updateServiceField(field, value) {
    setService((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function calculateHours() {
    if (!service.start_time || !service.end_time) return 0;

    const start = new Date(`1970-01-01T${service.start_time}`);
    const end = new Date(`1970-01-01T${service.end_time}`);

    const diff = (end - start) / 1000 / 60 / 60;
    return diff > 0 ? diff : 0;
  }

  async function saveAll() {
    // 🔹 1. Service speichern
    await supabase
      .from("services")
      .update({
        start_time: service.start_time,
        end_time: service.end_time,
        description: service.description,
      })
      .eq("id", id);

    // 🔹 2. Attendance speichern
for (const member of members) {

  if (member.status) {

    await supabase
  .from("attendance")
  .upsert(
    {
      service_id: id,
      member_id: member.id,
      status: member.status,
      hours:
        member.status === "present"
          ? calculateHours()
          : 0,
    },
    { onConflict: ["service_id", "member_id"] }
  );

  } else {

    await supabase
      .from("attendance")
      .delete()
      .eq("service_id", id)
      .eq("member_id", member.id);
      }
    }

    alert("Gespeichert");
    router.push("/youth/dashboard");
  }

  if (loading) return <div>Lade...</div>;
function updateMemberStatus(memberId, status) {
  setMembers((prev) =>
    prev.map((m) =>
      m.id === memberId
        ? { ...m, status }
        : m
    )
  );
}
  return (
    <div>

      <h2>{service.title}</h2>

      {/* 🔹 Zeiten bearbeiten */}
      <div className="youth-edit-section">
        <label>Startzeit</label>
        <input
          type="time"
          value={service.start_time || ""}
          onChange={(e) =>
            updateServiceField("start_time", e.target.value)
          }
        />

        <label>Endzeit</label>
        <input
          type="time"
          value={service.end_time || ""}
          onChange={(e) =>
            updateServiceField("end_time", e.target.value)
          }
        />
      </div>

      {/* 🔹 Beschreibung bearbeiten */}
      <div className="youth-edit-section">
        <label>Beschreibung</label>
        <textarea
          value={service.description || ""}
          onChange={(e) =>
            updateServiceField("description", e.target.value)
          }
        />
      </div>

      <h3>Teilnehmer</h3>

      {members.map((member) => (
  <div key={member.id} className="youth-member-row">

    <div>
      {member.first_name} {member.last_name}
      <span className="youth-type">
        {member.type === "child" ? " (Jugend)" : " (Betreuer)"}
      </span>
    </div>

    <select
      value={member.status || ""}
      onChange={(e) =>
        updateMemberStatus(member.id, e.target.value)
      }
    >
      <option value="">–</option>
      <option value="present">Anwesend</option>
      <option value="excused">Entschuldigt</option>
      <option value="unexcused">Unentschuldigt</option>
    </select>

  </div>
))}

      <button
        onClick={saveAll}
        className="youth-save-btn"
      >
        Speichern
      </button>

    </div>
  );
}
