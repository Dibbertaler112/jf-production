"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function YouthDashboard() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

 useEffect(() => {
  const init = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log("Kein User — RLS greift nicht.");
      return;
    }

    console.log("USER ID:", user.id);

    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("is_closed", false)
      .order("service_date", { ascending: true })
      .limit(2);

    console.log("RESULT:", data);

    if (!error) {
      setServices(data);
    }
  };

  init();
}, []);

  const fetchServices = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("services")
      .select("id, title, service_date, start_time, end_time, department_id, is_closed")
      .eq("is_closed", false)
      .order("service_date", { ascending: true })
      .limit(2);

    console.log("SERVICES RESPONSE:", data);

    if (error) {
      console.error("Fehler beim Laden:", error);
    } else {
      setServices(data);
    }

    setLoading(false);
  };

  const closeService = async (service) => {

  // 1️⃣ Endzeit prüfen
  if (!service.end_time) {
    alert("Endzeit fehlt.");
    return;
  }

  // 2️⃣ Datum prüfen
  const today = new Date();
  const serviceDate = new Date(service.service_date);

  today.setHours(0,0,0,0);
  serviceDate.setHours(0,0,0,0);

  if (today < serviceDate) {
    alert("Dienst liegt in der Zukunft.");
    return;
  }

  // 3️⃣ Aktive Mitglieder laden
  const { data: members } = await supabase
    .from("members")
    .select("id")
    .eq("department_id", service.department_id)
    .eq("active", true);

  if (!members || members.length === 0) {
    alert("Keine aktiven Mitglieder vorhanden.");
    return;
  }

  // 4️⃣ Attendance laden
  const { data: attendance } = await supabase
    .from("attendance")
    .select("member_id, status")
    .eq("service_id", service.id);

  // 5️⃣ Prüfen ob Status fehlt
  const missing = members.filter(member => {
    const entry = attendance.find(a => a.member_id === member.id);
    return !entry || !entry.status;
  });

  if (missing.length > 0) {
    alert(`Es fehlen Status bei ${missing.length} Teilnehmern.`);
    return;
  }

  // 6️⃣ Abschließen
  const { error } = await supabase
    .from("services")
    .update({
      is_closed: true,
      closed_at: new Date().toISOString(),
    })
    .eq("id", service.id);

  if (!error) {
    fetchServices();
  }
};

  const editService = (id) => {
    router.push(`/youth/dashboard/edit/${id}`);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("de-DE", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="youth-dashboard">
      <h2 className="youth-title">Aktuelle Dienste</h2>

      {loading && <p>Lade Dienste...</p>}

      {!loading && services.length === 0 && (
        <p>Keine offenen Dienste vorhanden.</p>
      )}

      {services.map((service) => (
        <div key={service.id} className="youth-card">
          <div className="youth-date">
            {formatDate(service.service_date)}
          </div>

          <div className="youth-service-title">
            {service.title}
          </div>

          <div className="youth-time">
            {service.start_time} – {service.end_time}
          </div>

          <div className="youth-actions">
            <button
              className="youth-edit-btn"
              onClick={() => editService(service.id)}
            >
              Bearbeiten
            </button>

            <button
              className="youth-close-btn"
              onClick={() => closeService(service)}
            >
              Abschließen
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
