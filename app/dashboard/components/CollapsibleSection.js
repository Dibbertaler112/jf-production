"use client";

import { useState } from "react"

export default function CollapsibleSection({ title, children }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-[#1e293b] rounded-3xl border border-slate-600 shadow-xl overflow-hidden">

      {/* HEADER BEREICH */}
      <button
        onClick={() => setOpen(!open)}
        className="
  w-full
  flex justify-between items-center
  px-8 py-6
  bg-[#0f172a]
  text-[#d9ff00]
  hover:text-slate-800
  transition-colors duration-200
  text-2xl font-semibold
        "
      >
        {title}
        <span className="text-lg">
          {open ? "▲" : "▼"}
        </span>
      </button>

      {/* INHALT */}
      {open && (
        <div className="p-8">
          {children}
        </div>
      )}

    </div>
  )
}

