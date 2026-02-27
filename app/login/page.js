"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { APP_VERSION } from "@/lib/config/version";

export default function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const router = useRouter();

  async function login() {

    setMessage("");

    /* 🔐 Login */
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      setMessage(error.message);
      return;
    }

    const user = data?.user;

    if (!user) {
      setMessage("Fehler beim Laden des Users.");
      return;
    }

    /* 🔍 Profil laden */
    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profileError || !profile) {
      setMessage("Profil nicht gefunden.");
      await supabase.auth.signOut();
      return;
    }

    /* ==========================================
       🔔 VERSION CHECK (stabil)
    ========================================== */

    try {
      const seenVersion = localStorage.getItem("seenVersion");

      if (APP_VERSION && seenVersion !== APP_VERSION) {
        localStorage.setItem("seenVersion", APP_VERSION);
        router.replace("/update");
        return;
      }
    } catch (err) {
      console.error("Version Check Fehler:", err);
    }

    /* ==========================================
       Rollenbasierte Weiterleitung
    ========================================== */

    switch (profile.role) {

      case "department_youth_representative":
        router.replace("/youth/dashboard");
        break;

      case "city_admin":
      case "department_admin":
      case "department_deputy":
        router.replace("/dashboard");
        break;

      default:
        setMessage("Keine gültige Rolle.");
        await supabase.auth.signOut();
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>Login</h2>

      <input
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Passwort"
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={login}>
        Einloggen
      </button>

      <br /><br />

      <a href="/forgot-password">
        Passwort vergessen?
      </a>

      <p>{message}</p>

      <p style={{ fontSize: 12, opacity: 0.5 }}>
        Version {APP_VERSION || "?"}
      </p>
    </div>
  );
}