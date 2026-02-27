"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function ResetPassword() {

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  // 🔥 Wichtig: Session aus URL setzen
  useEffect(() => {

    async function handleSession() {

      const { data, error } =
        await supabase.auth.getSession();

      if (error) {
        console.log("Session Error:", error);
      }

      setLoading(false);
    }

    handleSession();

  }, []);

  async function updatePassword() {

    const { error } =
      await supabase.auth.updateUser({
        password
      });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Passwort erfolgreich geändert.");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
  }

  if (loading) return <p style={{ padding: 40 }}>Lade...</p>;

  return (
    <div style={{ padding: 40 }}>
      <h2>Neues Passwort setzen</h2>

      <input
        type="password"
        placeholder="Neues Passwort"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={updatePassword}>
        Passwort speichern
      </button>

      <p>{message}</p>
    </div>
  );
}
