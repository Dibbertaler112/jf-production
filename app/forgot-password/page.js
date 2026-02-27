"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

/* ============================================================
   ForgotPassword – Passwort-Reset anfordern
============================================================ */

export default function ForgotPassword() {

  /* ----------------------------------------------------------
     1️⃣ State
  ---------------------------------------------------------- */

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  /* ----------------------------------------------------------
     2️⃣ Reset-Mail senden
  ---------------------------------------------------------- */

  async function sendReset() {

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo:
            "http://localhost:3000/reset-password"
        }
      );

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(
        "E-Mail zum Zurücksetzen wurde gesendet."
      );
    }
  }

  /* ----------------------------------------------------------
     3️⃣ UI
  ---------------------------------------------------------- */

  return (
    <div style={{ padding: 40 }}>

      <h2>Passwort vergessen</h2>

      <input
        placeholder="E-Mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br /><br />

      <button onClick={sendReset}>
        Reset-Mail senden
      </button>

      <p>{message}</p>

    </div>
  );
}