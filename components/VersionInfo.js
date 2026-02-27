"use client";

import { useState, useEffect } from "react";
import { APP_VERSION } from "@/lib/config/version";
import Link from "next/link";

export default function VersionInfo() {
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    const seenVersion = localStorage.getItem("version_seen");

    if (seenVersion !== APP_VERSION) {
      setIsNew(true);
      localStorage.setItem("version_seen", APP_VERSION);
    }
  }, []);

  return (
    <div className="flex items-center justify-center gap-4 text-slate-400">

      {/* VERSION */}
      <span className="flex items-center gap-2 font-medium">
        Version {APP_VERSION}

        {isNew && (
          <span className="bg-[#d9ff00] text-black text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">
            NEU
          </span>
        )}
      </span>

      {/* TRENNER */}
      <span className="text-slate-600">|</span>

      {/* RELEASE NOTES LINK */}
      <Link
        href="/release-notes"
        className="text-xs text-slate-500 hover:text-white transition-colors duration-200"
      >
        Release Notes
      </Link>

    </div>
  );
}