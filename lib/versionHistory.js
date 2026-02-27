export const VERSION_HISTORY = [
  {
    version: "1.0.0",
    date: "28.02.2026",
    summary: "Offizieller Release der Jugendfeuerwehr Verwaltungs-App",
    changes: [
      "Vollständige Mitgliederverwaltung mit Rollen-System",
      "Dienstplanung inkl. Abschluss-Logik und Teilnehmerverwaltung",
      "Statistik-Modul mit Auswertung von Stunden und Teilnahmequote",
      "Archiv-System (Soft Delete) für Mitglieder und Dienste",
      "Performance-Optimierungen und UI-Finalisierung"
    ]
  },
  {
    version: "0.9.0",
    date: "24.02.2026",
    summary: "Feature-Freeze & Stabilitätsphase",
    changes: [
      "Statistik-Modul integriert",
      "Top-3 Auswertung für Jugendliche und Betreuer",
      "Archiv-Funktionen finalisiert",
      "Diverse Bugfixes und UI-Feinschliff"
    ]
  },
  {
    version: "0.8.0",
    date: "20.02.2026",
    summary: "Archiv- und Rollenlogik erweitert",
    changes: [
      "Soft Delete System eingeführt",
      "City Admin und Department Admin Rollenlogik verbessert",
      "System-Archiv für endgültig gelöschte Einträge ergänzt",
      "Berechtigungsprüfung verschärft"
    ]
  },
  {
    version: "0.7.0",
    date: "16.02.2026",
    summary: "Dienstabschluss & Teilnehmerlogik",
    changes: [
      "Dienst kann nur abgeschlossen werden, wenn alle Teilnehmer zugeordnet sind",
      "Fehlermeldungen bei unvollständiger Zuordnung ergänzt",
      "Closed-Status und Zeitlogik implementiert"
    ]
  },
  {
    version: "0.6.0",
    date: "12.02.2026",
    summary: "Mobile Optimierung",
    changes: [
      "Responsive Mobile Views für Mitglieder und Dienste",
      "Smooth Slide Animationen im Mobile Bereich",
      "UI-Verbesserungen für kleinere Displays"
    ]
  },
  {
    version: "0.5.0",
    date: "09.02.2026",
    summary: "Import-Funktion für Dienstpläne",
    changes: [
      "Excel Import für Dienste integriert",
      "Validierungslogik für Importdaten ergänzt",
      "Feedback-System während Importprozess"
    ]
  },
  {
    version: "0.4.0",
    date: "06.02.2026",
    summary: "Mitgliederverwaltung erweitert",
    changes: [
      "CRUD Funktionen für Mitglieder finalisiert",
      "Filter- und Sortierfunktionen ergänzt",
      "Rollenbasierte Anzeige umgesetzt"
    ]
  },
  {
    version: "0.3.0",
    date: "04.02.2026",
    summary: "Grundlegende Dienstplanung",
    changes: [
      "Dienste anlegen, bearbeiten und löschen",
      "Zuweisung zu Ortswehren",
      "Zeit- und Datumsverwaltung implementiert"
    ]
  },
  {
    version: "0.2.0",
    date: "02.02.2026",
    summary: "Authentifizierung & Rollenmodell",
    changes: [
      "Login-System mit Supabase Auth",
      "City Admin & Department Admin Rollen",
      "Grundlegende Datenbankstruktur eingerichtet"
    ]
  },
  {
    version: "0.1.0",
    date: "01.02.2026",
    summary: "Projektstart",
    changes: [
      "Next.js Grundgerüst erstellt",
      "Supabase angebunden",
      "Erste Layout-Struktur umgesetzt"
    ]
  }
];