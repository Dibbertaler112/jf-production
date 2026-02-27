"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { useParams } from "next/navigation";

export default function DepartmentDetail() {

  const params = useParams();
  const departmentId = params.id;

  const [children, setChildren] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [departmentName, setDepartmentName] = useState("");

  useEffect(() => {
    if (departmentId) {
      loadData();
    }
  }, [departmentId]);

  async function loadData() {

    // Department Name
    const { data: department } =
      await supabase
        .from("departments")
        .select("name")
        .eq("id", departmentId)
        .single();

    if (department) {
      setDepartmentName(department.name);
    }

    // Alle Mitglieder der Wehr laden
    const { data, error } =
      await supabase
        .from("members")
        .select("*")
        .eq("department_id", departmentId);

    if (error) {
      console.log("Fehler:", error);
      return;
    }

    // Trennen nach Typ
    const childMembers =
      data.filter(m => m.type === "child");

    const supervisorMembers =
      data.filter(m => m.type === "supervisor");

    setChildren(childMembers);
    setSupervisors(supervisorMembers);
  }

  return (
    <div className="page-container">

      <h1>{departmentName || "Detailansicht"}</h1>

      {/* ==========================
         JUGENDLICHE
      =========================== */}

      <h2>👦 Jugendliche ({children.length})</h2>

      {children.length === 0 ? (
        <p>Keine Jugendlichen vorhanden.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Vorname</th>
              <th>Nachname</th>
              <th>Geburtsdatum</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {children.map(m => (
              <tr key={m.id}>
                <td>{m.first_name}</td>
                <td>{m.last_name}</td>
                <td>{m.birthdate || "-"}</td>
                <td>
                  {m.active ? "Aktiv" : "Inaktiv"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <br /><br />

      {/* ==========================
         BETREUER
      =========================== */}

      <h2>👨‍🚒 Betreuer ({supervisors.length})</h2>

      {supervisors.length === 0 ? (
        <p>Keine Betreuer vorhanden.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Vorname</th>
              <th>Nachname</th>
              <th>Telefon</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {supervisors.map(m => (
              <tr key={m.id}>
                <td>{m.first_name}</td>
                <td>{m.last_name}</td>
                <td>{m.phone || "-"}</td>
                <td>
                  {m.active ? "Aktiv" : "Inaktiv"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

    </div>
  );
}
