"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import "./globals.css";

export default function AppShell({ children }) {
  const [userName, setUserName] = useState(null);
  const [role, setRole] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    async function loadUser(sessionUser) {
      if (!sessionUser) {
        setUserName(null);
        setRole(null);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name, role, department_id")
        .eq("id", sessionUser.id)
        .single();

      if (!profile) return;

      let roleLabel = "";
      let departmentName = "";

      if (profile.department_id) {
        const { data: department } = await supabase
          .from("departments")
          .select("name")
          .eq("id", profile.department_id)
          .single();

        departmentName = department?.name || "";
      }

      if (profile.role === "city_admin") {
        roleLabel = "Stadtjugendfeuerwehrwart";
      }

      if (profile.role === "department_admin") {
        roleLabel = `Jugendwart ${departmentName}`;
      }

      if (profile.role === "department_deputy") {
        roleLabel = `Stv. Jugendwart ${departmentName}`;
      }

      if (profile.role === "department_youth_representative") {
        roleLabel = `Jugendsprecher ${departmentName}`;
      }

      const fullName =
        profile.first_name && profile.last_name
          ? profile.first_name + " " + profile.last_name
          : sessionUser.email;

      setUserName({
        name: fullName,
        role: roleLabel,
      });

      setRole(profile.role);

      // Youth Redirect
      if (
        profile.role === "department_youth_representative" &&
        !pathname.startsWith("/youth")
      ) {
        router.replace("/youth/dashboard");
      }
    }

    supabase.auth.getUser().then(({ data }) => {
      loadUser(data.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        loadUser(session?.user || null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [pathname, router]);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div style={bodyStyle}>
      {/* HEADER nur wenn NICHT Youth */}
      {role !== "department_youth_representative" && (
        <header className="main-header">

          {/* DESKTOP HEADER */}
          <div className="desktop-header">
            <div style={logoStyle}>
              Jugendfeuerwehren der Stadt Buchholz
            </div>

            <nav className="desktop-nav">
              <NavLink href="/dashboard" pathname={pathname}>
                Dashboard
              </NavLink>

              <NavLink href="/members" pathname={pathname}>
                Mitglieder
              </NavLink>

              <NavLink href="/services" pathname={pathname}>
                Dienstplan
              </NavLink>

              <NavLink href="/statistics" pathname={pathname}>
                Statistik
              </NavLink>

              {role === "city_admin" && (
                <NavLink href="/users" pathname={pathname}>
                  Accountverwaltung
                </NavLink>
              )}
            </nav>

            {userName && (
              <div className="desktop-right">
                <div className="desktop-user">
                  <div>{userName.name}</div>
                  <div style={roleStyle}>{userName.role}</div>
                </div>

                <button onClick={logout} className="desktop-logout">
                  ⎋
                </button>
              </div>
            )}
          </div>

          {/* MOBILE HEADER */}
          <div className="mobile-header">
            <div className="mobile-logo">
              Jugendfeuerwehren der Stadt Buchholz
            </div>

            {userName && (
              <div className="mobile-user-row">
                <div>
                  <div style={{ fontWeight: "bold" }}>
                    {userName.name}
                  </div>
                  <div style={roleStyle}>{userName.role}</div>
                </div>

                <div
                  className="mobile-menu-button"
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  ☰
                </div>
              </div>
            )}
          </div>
        </header>
      )}

      {/* MOBILE MENU */}
      {role !== "department_youth_representative" && menuOpen && (
        <div className="mobile-menu">
          <MobileNavLink href="/dashboard" pathname={pathname} closeMenu={closeMenu}>
            Dashboard
          </MobileNavLink>

          <MobileNavLink href="/members" pathname={pathname} closeMenu={closeMenu}>
            Mitglieder
          </MobileNavLink>

          <MobileNavLink href="/services" pathname={pathname} closeMenu={closeMenu}>
            Dienstplan
          </MobileNavLink>

          <MobileNavLink href="/statistics" pathname={pathname} closeMenu={closeMenu}>
            Statistik
          </MobileNavLink>

          {role === "city_admin" && (
            <MobileNavLink href="/users" pathname={pathname} closeMenu={closeMenu}>
              Accountverwaltung
            </MobileNavLink>
          )}

          <hr style={{ borderColor: "#334155" }} />

          <button onClick={logout} className="mobile-logout">
            ⎋ Abmelden
          </button>
        </div>
      )}

      <main style={contentStyle}>{children}</main>
    </div>
  );
}

/* ---------- NAV HELPERS ---------- */

function NavLink({ href, pathname, children }) {
  return (
    <Link
      href={href}
      style={{
        ...navStyle,
        ...(pathname === href && activeNavStyle),
      }}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ href, pathname, children, closeMenu }) {
  return (
    <Link
      href={href}
      onClick={closeMenu}
      style={{
        ...(pathname === href && mobileActiveStyle),
      }}
    >
      {children}
    </Link>
  );
}

/* ---------- STYLES ---------- */

const bodyStyle = {
  minHeight: "100vh",
  backgroundColor: "#0f172a",
  color: "#f1f5f9",
};

const logoStyle = {
  backgroundColor: "#d9ff00",
  color: "#0f172a",
  fontWeight: "bold",
  padding: "6px 10px",
  borderRadius: 6,
};

const navStyle = {
  marginRight: 20,
  color: "#f1f5f9",
  textDecoration: "none",
  fontWeight: 500,
};

const activeNavStyle = {
  color: "#0f172a",
  backgroundColor: "#d9ff00",
  padding: "6px 10px",
  borderRadius: 6,
};

const mobileActiveStyle = {
  backgroundColor: "#d9ff00",
  color: "#0f172a",
  fontWeight: "bold",
  padding: "6px",
  borderRadius: "4px",
};

const roleStyle = {
  fontSize: 13,
  color: "#d9ff00",
};

const contentStyle = {
  padding: "30px",
};