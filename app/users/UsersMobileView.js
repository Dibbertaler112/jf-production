"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function UsersMobileView() {

  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const [showCreate, setShowCreate] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    role: "department_admin",
    department_id: ""
  });

  useEffect(() => {
    loadUsers();
    loadDepartments();
  }, []);

  async function loadUsers() {
    const { data: { session } } =
      await supabase.auth.getSession();

    const res = await fetch("/api/users", {
      headers: {
        Authorization: `Bearer ${session?.access_token}`
      }
    });

    const data = await res.json();
    setUsers(data || []);
  }

  async function loadDepartments() {
    const { data } = await supabase
      .from("departments")
      .select("*")
      .order("name");

    setDepartments(data || []);
  }

  async function createUser() {

    const { data: { session } } =
      await supabase.auth.getSession();

    const res = await fetch("/api/create-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`
      },
      body: JSON.stringify(form)
    });

    const result = await res.json();

    if (result.error) {
      alert(result.error);
      return;
    }

    alert("Benutzer erstellt");

    setForm({
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      role: "department_admin",
      department_id: ""
    });

    setShowCreate(false);
    loadUsers();
  }

  async function updateUser(id) {

    const { data: { session } } =
      await supabase.auth.getSession();

    const payload = { id, ...editData };

    if (!payload.password) delete payload.password;

    const res = await fetch("/api/update-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`
      },
      body: JSON.stringify(payload)
    });

    const result = await res.json();

    if (result.error) {
      alert(result.error);
      return;
    }

    alert("Gespeichert");
    setEditingId(null);
    setEditData({});
    loadUsers();
  }

  function roleLabel(role) {
    if (role === "city_admin") return "Stadtjugendwart";
    if (role === "department_admin") return "Jugendwart";
    if (role === "department_deputy") return "Jugendwart stellv.";
    if (role === "department_youth_representative") return "Jugendsprecher";
    return role;
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white px-3 pt-4 pb-28 space-y-4">

      <h1 className="text-xl font-bold text-[#d9ff00]">
        Benutzerverwaltung
      </h1>

      {/* ================= USER LIST ================= */}

      {users.map(u => {

        const isEditing = editingId === u.id;

        return (
          <div
            key={u.id}
            className="bg-[#1e293b] border border-slate-700 rounded-2xl p-4 space-y-3"
          >

            {isEditing ? (
              <>
                <Input
                  value={editData.email || ""}
                  onChange={(v) =>
                    setEditData({ ...editData, email: v })
                  }
                />

                <Input
                  type="password"
                  placeholder="Neues Passwort (optional)"
                  onChange={(v) =>
                    setEditData({ ...editData, password: v })
                  }
                />

                <Input
                  value={editData.first_name || ""}
                  onChange={(v) =>
                    setEditData({ ...editData, first_name: v })
                  }
                />

                <Input
                  value={editData.last_name || ""}
                  onChange={(v) =>
                    setEditData({ ...editData, last_name: v })
                  }
                />

                <Select
                  value={editData.role}
                  onChange={(v) =>
                    setEditData({ ...editData, role: v })
                  }
                  options={[
                    { value: "city_admin", label: "Stadtjugendwart" },
                    { value: "department_admin", label: "Jugendwart" },
                    { value: "department_deputy", label: "Jugendwart stellv." },
                    { value: "department_youth_representative", label: "Jugendsprecher" }
                  ]}
                />

                <Select
                  value={editData.department_id || ""}
                  onChange={(v) =>
                    setEditData({ ...editData, department_id: v })
                  }
                  options={[
                    { value: "", label: "-" },
                    ...departments.map(d => ({
                      value: d.id,
                      label: d.name
                    }))
                  ]}
                />

                <button
                  onClick={() => updateUser(u.id)}
                  className="w-full bg-[#d9ff00] text-black py-2 rounded-xl font-semibold"
                >
                  Speichern
                </button>

                <button
                  onClick={() => setEditingId(null)}
                  className="w-full bg-slate-700 py-2 rounded-xl"
                >
                  Abbrechen
                </button>
              </>
            ) : (
              <>
                <div className="font-semibold">
                  {u.first_name} {u.last_name}
                </div>

                <div className="text-sm text-slate-400">
                  {u.email}
                </div>

                <div className="flex flex-wrap gap-2 text-xs pt-1">
                  <span className="bg-[#d9ff00] text-black px-3 py-1 rounded-full font-semibold">
                    {roleLabel(u.role)}
                  </span>

                  <span className="text-slate-400">
                    {departments.find(d => d.id === u.department_id)?.name || "-"}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setEditingId(u.id);
                    setEditData(u);
                  }}
                  className="w-full bg-slate-700 py-2 rounded-xl text-sm mt-2"
                >
                  Bearbeiten
                </button>
              </>
            )}

          </div>
        );
      })}

      {/* ================= FLOATING BUTTON ================= */}

      <button
        onClick={() => setShowCreate(true)}
        className="fixed bottom-5 right-5 w-14 h-14 rounded-full bg-[#d9ff00] text-black text-2xl font-bold shadow-xl"
      >
        +
      </button>

      {/* ================= CREATE PANEL ================= */}

      {showCreate && (
        <div className="fixed inset-0 bg-black/70 flex items-end z-50">

          <div className="w-full bg-[#0f172a] rounded-t-2xl p-5 space-y-4">

            <h3 className="text-[#d9ff00] font-semibold">
              Neuer Benutzer
            </h3>

            <Input
              placeholder="Email"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
            />

            <Input
              type="password"
              placeholder="Passwort"
              value={form.password}
              onChange={(v) => setForm({ ...form, password: v })}
            />

            <Input
              placeholder="Vorname"
              value={form.first_name}
              onChange={(v) => setForm({ ...form, first_name: v })}
            />

            <Input
              placeholder="Nachname"
              value={form.last_name}
              onChange={(v) => setForm({ ...form, last_name: v })}
            />

            <Select
              value={form.role}
              onChange={(v) => setForm({ ...form, role: v })}
              options={[
                { value: "city_admin", label: "Stadtjugendwart" },
                { value: "department_admin", label: "Jugendwart" },
                { value: "department_deputy", label: "Jugendwart stellv." },
                { value: "department_youth_representative", label: "Jugendsprecher" }
              ]}
            />

            {form.role !== "city_admin" && (
              <Select
                value={form.department_id}
                onChange={(v) =>
                  setForm({ ...form, department_id: v })
                }
                options={[
                  { value: "", label: "Ortswehr wählen" },
                  ...departments.map(d => ({
                    value: d.id,
                    label: d.name
                  }))
                ]}
              />
            )}

            <button
              onClick={createUser}
              className="w-full bg-[#d9ff00] text-black py-2 rounded-xl font-semibold"
            >
              Speichern
            </button>

            <button
              onClick={() => setShowCreate(false)}
              className="w-full bg-slate-700 py-2 rounded-xl"
            >
              Abbrechen
            </button>

          </div>
        </div>
      )}

    </div>
  );
}

/* ================= REUSABLE INPUTS ================= */

function Input({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm"
    />
  );
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm"
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}