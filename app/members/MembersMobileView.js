"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function MembersMobileView({
  members,
  role,
  departments,
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
  restoreMember,
permanentlyDelete,
showDeleted
}) {

  const [showArchive, setShowArchive] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const aktiveMitglieder = members.filter(m => m.active && !m.deleted_at);
const archivMitglieder = showDeleted
  ? members.filter(m => m.deleted_at)
  : members.filter(m => !m.active && !m.deleted_at);
  const [expandedMember, setExpandedMember] = useState(null);

  async function toggleActive(member) {
    await supabase
      .from("members")
      .update({ active: !member.active })
      .eq("id", member.id);

    reload();
  }

 

  return (
    <div className="min-h-screen bg-[#0f172a] text-white px-3 pt-4 pb-28 space-y-6">

      {/* ================= FILTER ================= */}
      <div className="bg-[#1e293b] rounded-2xl border border-slate-700 p-5">

        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setShowFilter(!showFilter)}
        >
          <h2 className="text-lg font-semibold text-[#d9ff00]">
            Filter
          </h2>
          <span className="text-[#d9ff00] text-lg font-bold">
            {showFilter ? "−" : "+"}
          </span>
        </div>

        {showFilter && (
          <div className="mt-4 space-y-4">

            <input
              type="text"
              placeholder="🔍 Name suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-2 text-sm"
            />

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-2 text-sm"
            >
              <option value="all">Alle Typen</option>
              <option value="child">Jugendliche</option>
              <option value="supervisor">Betreuer</option>
            </select>

            {(role === "city_admin" || role === "admin") && (
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-2 text-sm"
              >
                <option value="all">Alle Ortswehren</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            )}

          </div>
        )}
      </div>

      {/* ================= AKTIVE ================= */}
<div className="space-y-4">
  <h2 className="text-lg font-semibold text-[#d9ff00]">
    Aktive Mitglieder ({aktiveMitglieder.length})
  </h2>

  {aktiveMitglieder.map(m => {

    const isOpen = expandedMember === m.id;

    return (
      <div
        key={m.id}
        className="bg-[#1e293b] rounded-xl border border-slate-700 overflow-hidden"
      >

        {/* ===== Header ===== */}
        <div className="flex justify-between items-center p-4">

          <div className="font-semibold text-[#d9ff00]">
            {m.first_name} {m.last_name}
          </div>

          <button
            onClick={() =>
              setExpandedMember(isOpen ? null : m.id)
            }
            className="bg-slate-700 px-4 py-2 rounded-lg text-sm"
          >
            {isOpen ? "Schließen" : "Details"}
          </button>

        </div>

        {/* ===== DETAILS ===== */}
        {isOpen && (
          <div className="bg-[#0f172a] p-4 space-y-3 border-t border-slate-700">

            <div className="text-sm text-slate-400">
              Typ: {m.type === "child" ? "Jugendlicher" : "Betreuer"}
            </div>

            {m.birthdate && (
              <div className="text-sm text-slate-400">
                Geburtstag: {new Date(m.birthdate).toLocaleDateString("de-DE")}
              </div>
            )}

            {m.phone && (
              <div className="text-sm text-slate-400">
                Telefon: {m.phone}
              </div>
            )}

            {m.parent_name && (
              <div className="text-sm text-slate-400">
                Erziehungsberechtigte: {m.parent_name}
              </div>
            )}

            {m.parent_phone && (
              <div className="text-sm text-slate-400">
                Telefon Eltern: {m.parent_phone}
              </div>
            )}

            {(role === "city_admin" || role === "admin") && (
              <div className="text-sm text-slate-400">
                Ortswehr: {m.departments?.name ?? "—"}
              </div>
            )}

            {/* ===== ACTIONS ===== */}
            <div className="flex gap-3 pt-3">

              <button
                onClick={() => setEditingMember(m)}
                className="flex-1 bg-slate-700 py-3 rounded-lg text-[#d9ff00]"
              >
                Bearbeiten
              </button>

              <button
                onClick={() => toggleActive(m)}
                className="flex-1 bg-slate-700 py-3 rounded-lg text-[#d9ff00]"
              >
                Deaktivieren
              </button>

            </div>

          </div>
        )}

      </div>
    );
  })}
</div>

      {/* ================= ARCHIV ================= */}
      <div className="space-y-4">

        <div
          onClick={() => setShowArchive(!showArchive)}
          className="flex justify-between items-center cursor-pointer"
        >
          <h2 className="text-lg font-semibold text-[#d9ff00]">
            Archivierte Mitglieder ({archivMitglieder.length})
          </h2>
          <span className="text-[#d9ff00] text-lg font-bold">
            {showArchive ? "−" : "+"}
          </span>
        </div>

        {showArchive && (
  <div className="space-y-4">
    {archivMitglieder.map(m => (
      <div
        key={m.id}
        className="bg-[#0f172a] rounded-xl border border-slate-700 p-5 space-y-3"
      >
        <div className="font-semibold">
          {m.first_name} {m.last_name}
        </div>

        {/* ================= AKTIVE ANSICHT ================= */}
        {!showDeleted && role === "city_admin" && (
          <>
            {/* Wieder öffnen */}
            <button
              onClick={() => toggleActive(m)}
              className="w-full bg-slate-700 py-3 rounded-lg text-[#d9ff00]"
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
              className="w-full bg-red-900 py-3 rounded-lg text-white"
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
              className="w-full bg-green-700 py-3 rounded-lg text-white"
            >
              Reaktivieren
            </button>

            <button
              onClick={() => permanentlyDelete(m.id)}
              className="w-full bg-red-900 py-3 rounded-lg text-white"
            >
              Endgültig löschen
            </button>
          </>
        )}
      </div>
    ))}
  </div>
)}
      </div>

      {/* ================= FLOATING PLUS ================= */}
      <button
        onClick={() => setShowCreate(true)}
        className="fixed bottom-5 right-5 w-14 h-14 rounded-full bg-[#d9ff00] text-black text-2xl font-bold shadow-xl"
      >
        +
      </button>

      {/* ================= CREATE PANEL ================= */}
{showCreate && (
  <div className="fixed inset-0 bg-black/70 flex items-end z-50">

    <div className="w-full bg-[#0f172a] rounded-t-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">

      <h2 className="text-lg font-semibold text-[#d9ff00]">
        Neues Mitglied
      </h2>

      {/* Vorname */}
      <input
        placeholder="Vorname"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-4 py-3"
      />

      {/* Nachname */}
      <input
        placeholder="Nachname"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-4 py-3"
      />

      {/* Typ */}
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-4 py-3"
      >
        <option value="child">Jugendlicher</option>
        <option value="supervisor">Betreuer</option>
      </select>

      {/* Geburtsdatum */}
      <input
  type="date"
  value={birthdate}
  onChange={(e) => setBirthdate(e.target.value)}
  className="w-full h-[48px] bg-[#1e293b] border border-slate-700 rounded-xl px-4 text-white appearance-none"
/>

      {/* Telefon */}
      <input
        placeholder="Telefon"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full h-[48px] bg-[#1e293b] border border-slate-700 rounded-xl px-4 text-white"
      />

      {/* Elternfelder nur bei Jugendlicher */}
      {type === "child" && (
        <>
          <input
            placeholder="Erziehungsberechtigte"
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
            className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-4 py-3"
          />

          <input
            placeholder="Telefon Eltern"
            value={parentPhone}
            onChange={(e) => setParentPhone(e.target.value)}
            className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-4 py-3"
          />
        </>
      )}

      {/* Ortswehr nur für Stadt Admin */}
      {(role === "city_admin" || role === "admin") && (
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-4 py-3"
        >
          <option value="">Ortswehr wählen</option>
          {departments.map(d => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      )}

      {/* Buttons */}
      <button
        onClick={() => {
          createMember();
          setShowCreate(false);
        }}
        className="w-full bg-[#d9ff00] text-black py-4 rounded-xl font-semibold"
      >
        Speichern
      </button>

      <button
        onClick={() => setShowCreate(false)}
        className="w-full bg-slate-700 text-white py-3 rounded-xl"
      >
        Abbrechen
      </button>

      {message && (
        <div className="text-sm text-[#d9ff00]">
          {message}
        </div>
      )}

    </div>
  </div>
)}

    </div>
  );
}