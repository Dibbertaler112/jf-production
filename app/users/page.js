"use client";

import { useEffect, useState } from "react";
import UsersDesktopView from "./UsersDesktopView";
import UsersMobileView from "./UsersMobileView";

export default function UsersPage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024); // Breakpoint wie bei Members
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile ? <UsersMobileView /> : <UsersDesktopView />;
}