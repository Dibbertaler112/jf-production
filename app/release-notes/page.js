"use client";

import { useState } from "react";
import { VERSION_HISTORY } from "@/lib/versionHistory";

export default function ReleaseNotes() {
  const [openMajor, setOpenMajor] = useState("1"); // 1.x standardmäßig offen

  // Gruppiert Versionen nach Major
  const grouped = VERSION_HISTORY.reduce((acc, version) => {
    const major = version.version.split(".")[0];

    if (!acc[major]) {
      acc[major] = [];
    }

    acc[major].push(version);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#0f172a] text-white px-6 sm:px-12 py-16">

      <div className="max-w-4xl mx-auto space-y-12">

        <h1 className="text-3xl font-bold text-[#d9ff00]">
          Release Notes
        </h1>

        {Object.keys(grouped)
          .sort((a, b) => b - a) // höchste Major zuerst
          .map((major) => {

            const isOpen = openMajor === major;

            return (
              <div
                key={major}
                className="bg-[#1e293b] border border-slate-700 rounded-3xl overflow-hidden" 
              >
                {/* ===== MAJOR HEADER ===== */}
                <button
                  onClick={() =>
                    setOpenMajor(isOpen ? null : major)
                  }
                  className="w-full flex justify-between items-center px-8 py-6 text-left hover:bg-[#0f172a] transition"
                >
                  <span className="text-xl font-semibold text-[#d9ff00]">
  Version {major}.0
</span>

                  <span className="text-slate-400 text-xl">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>

                {/* ===== MAJOR CONTENT ===== */}
                {isOpen && (
                  <div className="px-8 pb-8 space-y-6 border-t border-slate-700">

                    {grouped[major]
                      .sort((a, b) =>
                        b.version.localeCompare(a.version)
                      )
                      .map((v) => (
                        <div
                          key={v.version}
                          className="bg-[#0f172a] border border-slate-700 rounded-2xl p-6"
                        >
                          <div className="flex items-center gap-3 mb-3">

                            <span className="font-semibold text-white">
                              {v.version}
                            </span>

                            <span className="text-xs text-slate-400">
                              {v.date}
                            </span>

                          </div>

                          {v.summary && (
                            <div className="text-sm text-slate-400 mb-3">
                              {v.summary}
                            </div>
                          )}

                          {v.changes && (
                            <ul className="text-sm text-slate-300 list-disc list-inside space-y-1">
                              {v.changes.map((change, i) => (
                                <li key={i}>{change}</li>
                              ))}
                            </ul>
                          )}

                        </div>
                      ))}

                  </div>
                )}
              </div>
            );
          })}

      </div>
    </div>
  );
}