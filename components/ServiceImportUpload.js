"use client"

import { useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function ServiceImportUpload() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
    setResult(null)
    setError(null)
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Bitte eine Datei auswählen.")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        setError("Nicht eingeloggt.")
        setLoading(false)
        return
      }

      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/import-services", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Import fehlgeschlagen")
      } else {
        setResult(data)
      }
    } catch (err) {
      setError("Fehler beim Upload.")
    }

    setLoading(false)
  }

  return (
    <div className="bg-[#1e293b] p-6 rounded-xl text-white space-y-4">
      <h2 className="text-xl font-semibold text-[#d9ff00]">
      </h2>

      <input
        type="file"
        accept=".xlsx"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-300"
      />

      <button
        onClick={handleUpload}
        disabled={loading}
        style={{ marginTop: "20px" }}
        className="bg-[#d9ff00] text-black px-4 py-2 rounded-lg font-semibold hover:opacity-80 disabled:opacity-50"
      >
        {loading ? "Import läuft..." : "Import starten"}
      </button>

      {error && (
        <div className="bg-red-600 p-3 rounded-lg">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-green-700 p-4 rounded-lg space-y-2">
          <p><strong>Importiert:</strong> {result.imported}</p>
          <p><strong>Übersprungen:</strong> {result.skipped}</p>

          {result.errors.length > 0 && (
            <div>
              <p className="font-semibold">Fehler:</p>
              <ul className="list-disc list-inside text-sm">
                {result.errors.map((err, index) => (
                  <li key={index}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
