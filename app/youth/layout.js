"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function YouthLayout({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "department_youth_representative") {
        router.replace("/dashboard");
        return;
      }

      setLoading(false);
    };

    checkAccess();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (loading) {
    return (
      <div style={{ padding: 40, color: "white" }}>
        Lade...
      </div>
    );
  }

  return (
    <div className="youth-wrapper">

      <header className="youth-header">
  <div className="youth-title">
    Dienstbuch
  </div>

  <button
    onClick={handleLogout}
    className="youth-logout-icon"
  >
    ⎋
  </button>
</header>

      <main className="youth-main">
        {children}
      </main>

    </div>
  );
}
