import "./globals.css";
import AppShell from "./AppShell";
import { APP_VERSION, BUILD_DATE } from "@/lib/config/version";
import VersionInfo from "@/components/VersionInfo";

/* 🔎 Debug im Terminal */
console.log("APP_VERSION:", APP_VERSION);
console.log("BUILD_DATE:", BUILD_DATE);

export const metadata = {
  title: "Jugendfeuerwehr App",
  description: "Verwaltungs-App für Jugendfeuerwehren",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body className="bg-[#0f172a] overflow-x-hidden flex flex-col min-h-screen border-4 border-red-600">

        <AppShell>{children}</AppShell>

        <footer className="fixed bottom-0 left-0 right-0 py-2 text-center text-xs text-slate-500 bg-[#0f172a] border-t border-slate-800">
  <VersionInfo />
</footer>

      </body>
    </html>
  );
}