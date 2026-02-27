"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import ServicesDesktopView from "./ServicesDesktopView";
import ServicesMobileView from "./ServicesMobileView";

export default function ServicesClient({
  role,
  departmentId,
  departments,
  initialServices
}) {

  const [services, setServices] = useState(initialServices);
  const [isMobile, setIsMobile] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);

  /* ================= MOBILE DETECTION ================= */

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ================= RELOAD ================= */

  async function reload(customShowDeleted = showDeleted) {

  let query = supabase
    .from("services")
    .select(`
      *,
      departments:department_id (name)
    `)
    .order("is_closed", { ascending: true })
    .order("service_date", { ascending: false });

  if (customShowDeleted) {
    query = query.not("deleted_at", "is", null);
  } else {
    query = query.is("deleted_at", null);
  }

  if (role !== "city_admin") {
    query = query.eq("department_id", departmentId);
  }

  const { data } = await query;
  setServices(data || []);
}

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">

      <div
        className={`
          w-full
          ${isMobile
            ? "px-2 py-4 space-y-4"
            : "max-w-[1600px] mx-auto px-6 lg:px-12 py-10 space-y-10"}
        `}
      >

        <div className="space-y-1">
          <h1
            className={`
              font-bold text-[#d9ff00]
              ${isMobile ? "text-xl" : "text-3xl xl:text-4xl"}
            `}
          >
            Dienstplan
          </h1>

          {!isMobile && (
            <p className="text-slate-400">
              Übersicht und Verwaltung aller Dienste
            </p>
          )}
        </div>

        {isMobile ? (
          <ServicesMobileView
  services={services}
  role={role}
  departments={departments}
  departmentId={departmentId}
  reload={reload}
  showDeleted={showDeleted}
/>
        ) : (
          <ServicesDesktopView
  services={services}
  role={role}
  departments={departments}
  departmentId={departmentId}
  reload={reload}
  showDeleted={showDeleted}
/>
        )}

      </div>
    </div>
  );
}