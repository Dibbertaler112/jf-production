"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function MembersDesktopView({
  members,
  role,
  departments,
  departmentId,
  reload,

  searchTerm,
  setSearchTerm,

  typeFilter,
  setTypeFilter,
  departmentFilter,
  setDepartmentFilter,

  firstName,
  setFirstName,
  lastName,
  setLastName,
  type,
  setType,
  birthdate,
  setBirthdate,
  phone,
  setPhone,
  parentName,
  setParentName,
  parentPhone,
  setParentPhone,
  selectedDepartment,
  setSelectedDepartment,
  message,
  createMember,
  editingMember,
  setEditingMember,
  updateMember,
  restoreMember,
permanentlyDelete,
showDeleted
}) {

  const [showArchive, setShowArchive] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const aktiveMitglieder = members.filter(m => m.active);
  const archivMitglieder = members.filter(m => !m.active);

  async function toggleActive(member) {
    await supabase
      .from("members")
      .update({ active: !member.active })
      .eq("id", member.id);

    reload();
  }

  

  return (
    <div className="space-y-10">

      {/* ================= NEUES MITGLIED ================= */}

      <div className="bg-[#1e293b] rounded-3xl border border-slate-700 shadow-xl p-8">
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setShowCreate(!showCreate)}
        >
          <h2 className="text-xl font-semibold text-[#d9ff00]">
            Neues Mitglied
          </h2>
          <span className="text-[#d9ff00] text-xl font-bold">
            {showCreate ? "−" : "+"}
          </span>
        </div>

        {showCreate && (
          <div className="mt-8 space-y-6">

            <div className="grid grid-cols-2 gap-6">
              <input
                placeholder="Vorname"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3"
              />

              <input
                placeholder="Nachname"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3"
              >
                <option value="child">Jugendlicher</option>
                <option value="supervisor">Betreuer</option>
              </select>

              <input
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                className="bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3"
              />
            </div>

            <input
              placeholder="Telefon"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 w-full"
            />

            {type === "child" && (
              <div className="grid grid-cols-2 gap-6">
                <input
                  placeholder="Erziehungsberechtigte"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3"
                />
                <input
                  placeholder="Telefon Eltern"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3"
                />
              </div>
            )}

            {role === "city_admin" && (
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 w-full"
              >
                <option value="">Ortswehr wählen</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            )}

            <button
              onClick={createMember}
              className="bg-[#d9ff00] text-black px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition"
            >
              Speichern
            </button>

            {message && (
              <div className="text-sm text-[#d9ff00]">{message}</div>
            )}
          </div>
        )}
      </div>

      {/* ================= FILTER + SUCHE ================= */}

<div className="bg-[#1e293b] rounded-3xl border border-slate-700 shadow-xl p-8">
  <div
    className="flex justify-between items-center cursor-pointer"
    onClick={() => setShowFilter(!showFilter)}
  >
    <h2 className="text-xl font-semibold text-[#d9ff00]">
      Filter
    </h2>
    <span className="text-[#d9ff00] text-xl font-bold">
      {showFilter ? "−" : "+"}
    </span>
  </div>

  {showFilter && (
    <div className="mt-8 space-y-6">

      {/* 🔎 Name + Typ nebeneinander */}
      <div className="grid grid-cols-2 gap-6">

        <input
          type="text"
          placeholder="🔍 Name suchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="
            w-full
            bg-[#0f172a]
            border border-slate-700
            rounded-xl
            px-4
            h-[48px]
            text-white
          "
        />

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="
            w-full
            bg-[#0f172a]
            border border-slate-700
            rounded-xl
            px-4
            h-[48px]
            text-white
          "
        >
          <option value="all">Alle</option>
          <option value="child">Jugendliche</option>
          <option value="supervisor">Betreuer</option>
        </select>

      </div>

      {/* 🏙 Ortswehr Filter nur für City Admin darunter */}
      {role === "city_admin" && (
        <div>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="
              w-full
              bg-[#0f172a]
              border border-slate-700
              rounded-xl
              px-4
              h-[48px]
              text-white
            "
          >
            <option value="all">Alle Ortswehren</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      )}

    </div>
  )}
</div>
      


      {/* ================= TABELLE ================= */}

      <div className="bg-[#1e293b] rounded-3xl border border-slate-700 overflow-hidden shadow-xl">

        <div className="px-8 py-6 border-b border-slate-700 text-lg font-semibold text-[#d9ff00]">
          Aktive Mitglieder ({aktiveMitglieder.length})
        </div>

        <table className="w-full text-left">
          <thead className="bg-[#0f172a] text-slate-400 text-sm">
            <tr>
              <th className="px-6 py-4">Vorname</th>
              <th className="px-6 py-4">Nachname</th>
              <th className="px-6 py-4">Typ</th>
              <th className="px-6 py-4">Geburtsdatum</th>
              {role === "city_admin" && <th className="px-6 py-4">Ortswehr</th>}
              <th className="px-6 py-4">Aktion</th>
            </tr>
          </thead>
          <tbody>
            {aktiveMitglieder.map(m => (
              <tr key={m.id} className="border-t border-slate-700 hover:bg-[#0f172a] transition">
                <td className="px-6 py-4">{m.first_name}</td>
                <td className="px-6 py-4">{m.last_name}</td>
                <td className="px-6 py-4">
                  {m.type === "child" ? "Jugendlicher" : "Betreuer"}
                </td>
                <td className="px-6 py-4">
                      {m.birthdate ? new Date(m.birthdate).toLocaleDateString(): "—"}
                  </td>

                  {role === "city_admin" && (
        <td className="px-6 py-4 text-slate-300">
          {m.departments?.name ?? "—"}
        </td>
      )}
                
                <td className="px-6 py-4 flex gap-3">

  <button
    onClick={() => setEditingMember(m)}
    className="bg-slate-700 hover:bg-slate-600 transition py-3 rounded-lg text-[#d9ff00]"
  >
    Bearbeiten
  </button>

  <button
    onClick={() => toggleActive(m)}
    className="bg-slate-700 hover:bg-slate-600 transition py-3 rounded-lg text-[#d9ff00]"
  >
    Deaktivieren
  </button>

</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= ARCHIV ================= */}

<div className="bg-[#1e293b] rounded-3xl border border-slate-700 overflow-hidden shadow-xl">

  {/* HEADER */}
  <div
    onClick={() => setShowArchive(!showArchive)}
    className="px-8 py-6 border-b border-slate-700 text-lg font-semibold text-[#d9ff00] flex justify-between items-center cursor-pointer"
  >
    <span>Archivierte Mitglieder ({archivMitglieder.length})</span>
    <span className="text-xl font-bold">
      {showArchive ? "−" : "+"}
    </span>
  </div>

  {/* CONTENT */}
  {showArchive && (
    <table className="w-full text-left">
      <thead className="bg-[#0f172a] text-slate-400 text-sm">
        <tr>
          <th className="px-6 py-4">Vorname</th>
          <th className="px-6 py-4">Nachname</th>
          <th className="px-6 py-4">Typ</th>
          <th className="px-6 py-4">Geburtsdatum</th>
          {role === "city_admin" && <th className="px-6 py-4">Ortswehr</th>}
          <th className="px-6 py-4">Aktion</th>
        </tr>
      </thead>
      <tbody>
        {archivMitglieder.map(m => (
          <tr
            key={m.id}
            className="border-t border-slate-700 hover:bg-[#0f172a] transition"
          >
            <td className="px-6 py-4">{m.first_name}</td>
            <td className="px-6 py-4">{m.last_name}</td>
            <td className="px-6 py-4">
              {m.type === "child" ? "Jugendlicher" : "Betreuer"}
            </td>
            <td className="px-6 py-4">
              {m.birthdate
                ? new Date(m.birthdate).toLocaleDateString()
                : "—"}
            </td>

            {role === "city_admin" && (
              <td className="px-6 py-4 text-slate-300">
                {m.departments?.name ?? "—"}
              </td>
            )}

            <td className="px-6 py-4 flex gap-3">

  {/* ================= AKTIVE ANSICHT ================= */}
  {!showDeleted && role === "city_admin" && (
    <>
      {/* Wieder öffnen (active = true) */}
      <button
        onClick={() => toggleActive(m)}
        className="bg-slate-700 hover:bg-slate-600 transition py-3 rounded-lg text-[#d9ff00]"
      >
        Wieder öffnen
      </button>

      {/* Soft Delete */}
      <button
        onClick={async () => {
          if (!confirm("Mitglied ins System-Archiv verschieben?")) return;

          await supabase
            .from("members")
            .update({ deleted_at: new Date().toISOString() })
            .eq("id", m.id);

          reload();
        }}
        className="bg-red-900 py-3 rounded-lg text-white min-h-[48px]"
      >
        Löschen
      </button>
    </>
  )}

  {/* ================= ARCHIV ANSICHT ================= */}
  {showDeleted && role === "city_admin" && (
    <>
      <button
        onClick={() => restoreMember(m.id)}
        className="bg-green-700 py-3 rounded-lg text-white min-h-[48px]"
      >
        Reaktivieren
      </button>

      <button
        onClick={() => permanentlyDelete(m.id)}
        className="bg-red-900 py-3 rounded-lg text-white min-h-[48px]"
      >
        Endgültig löschen
      </button>
    </>
  )}

</td>
          </tr>
        ))}
      </tbody>
    </table>
  )}

</div>

    </div>
  );
}