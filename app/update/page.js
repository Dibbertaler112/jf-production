"use client";

import { useRouter } from "next/navigation";
import { APP_VERSION } from "@/lib/config/version";

export default function UpdatePage() {

  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">

      <div className="bg-[#1e293b] border border-slate-700 rounded-3xl p-6 w-full max-w-md">

        <h2 className="text-[#d9ff00] font-semibold text-lg mb-4">
  Version {APP_VERSION} – Offizieller Release
</h2>

        <ul className="text-slate-300 text-sm space-y-2">
  <li>• Dienstplanung & Archiv</li>
  <li>• Mitgliederverwaltung (Aktiv & Archiv)</li>
  <li>• Anwesenheit mit automatischer Stundenberechnung</li>
  <li>• Statistik & Top-Listen</li>
  <li>• Rollenmodell (City & Ortswehr)</li>
  <li>• Mobile-optimiertes Dark Design</li>
  <li>• Stabil & produktiv einsetzbar</li>
</ul>

        <button
          onClick={() => router.replace("/dashboard")}
          className="mt-6 w-full bg-[#d9ff00] text-black rounded-2xl py-2 font-semibold"
        >
          Verstanden
        </button>

      </div>
    </div>
  );
}