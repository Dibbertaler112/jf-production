"use client";

import { useState, useEffect } from "react";

export default function EditMemberModal({ member, onClose, onSave }) {

  const [isMobile, setIsMobile] = useState(false);

  const [formData, setFormData] = useState({
    id: "",
    first_name: "",
    last_name: "",
    type: "child",
    birthdate: "",
    phone: "",
    parent_name: "",
    parent_phone: "",
    active: true
  });

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 1024);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (member) {
      setFormData({
        id: member.id,
        first_name: member.first_name || "",
        last_name: member.last_name || "",
        type: member.type || "child",
        birthdate: member.birthdate || "",
        phone: member.phone || "",
        parent_name: member.parent_name || "",
        parent_phone: member.parent_phone || "",
        active: member.active
      });
    }
  }, [member]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(formData);
  }

  const containerClasses = isMobile
    ? "fixed bottom-0 left-0 right-0 bg-[#0f172a] rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto animate-slideUp"
    : "bg-[#0f172a] rounded-3xl p-8 w-full max-w-2xl";

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

      <div className={containerClasses}>

        <h2 className="text-xl font-bold text-[#d9ff00] mb-6">
          Mitglied bearbeiten
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Vorname */}
          <div>
            <label className="text-sm text-slate-400">Vorname</label>
            <input
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-3 mt-1 text-white"
            />
          </div>

          {/* Nachname */}
          <div>
            <label className="text-sm text-slate-400">Nachname</label>
            <input
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-3 mt-1 text-white"
            />
          </div>

          {/* Typ */}
          <div>
            <label className="text-sm text-slate-400">Typ</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-3 mt-1 text-white"
            >
              <option value="child">Jugendlicher</option>
              <option value="supervisor">Betreuer</option>
            </select>
          </div>

          {/* Geburtsdatum */}
          <div>
            <label className="text-sm text-slate-400">Geburtsdatum</label>
            <input
              type="date"
              name="birthdate"
              value={formData.birthdate || ""}
              onChange={handleChange}
              className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-3 mt-1 text-white appearance-none"
            />
          </div>

          {/* Telefon */}
          <div>
            <label className="text-sm text-slate-400">Telefon</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-3 mt-1 text-white"
            />
          </div>

          {/* Elternfelder nur bei child */}
          {formData.type === "child" && (
            <>
              <div>
                <label className="text-sm text-slate-400">Eltern Name</label>
                <input
                  name="parent_name"
                  value={formData.parent_name}
                  onChange={handleChange}
                  className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-3 mt-1 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400">Eltern Telefon</label>
                <input
                  name="parent_phone"
                  value={formData.parent_phone}
                  onChange={handleChange}
                  className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-3 mt-1 text-white"
                />
              </div>
            </>
          )}

          {/* Aktiv Toggle */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-slate-400">Aktiv</span>
            <input
              type="checkbox"
              name="active"
              checked={formData.active}
              onChange={handleChange}
              className="w-5 h-5 accent-[#d9ff00]"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-6">

            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-700 text-white py-3 rounded-xl"
            >
              Abbrechen
            </button>

            <button
              type="submit"
              className="flex-1 bg-[#d9ff00] text-black py-3 rounded-xl font-semibold"
            >
              Speichern
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}