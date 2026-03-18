"use client";

import { CommandPalette } from "@/components/backOffice/navigation/CommandPallete";
import { Header } from "@/components/backOffice/navigation/header";
import { ProfileDropdown } from "@/components/backOffice/navigation/profile-dropdown";
import { AppSidebar } from "@/components/backOffice/navigation/sidebar";
import { ThemeSwitch } from "@/components/backOffice/navigation/theme-switch";
import { TopNav } from "@/components/backOffice/navigation/top-nav";
import { AbilityProvider } from "@/components/providers/AbilityContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function DashboardLayout({ children }) {
  const { userData, status, update, isLoading } = useCurrentUser();
  const hasRefreshed = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDark =
        localStorage.theme === "dark" || !("theme" in localStorage);
      document.documentElement.classList.toggle("dark", isDark);
      document.documentElement.style.colorScheme = isDark ? "dark" : "light";

      const isSidebarExpanded =
        localStorage.getItem("sidebar-expanded") === "true";
      document.body.classList.toggle("sidebar-expanded", isSidebarExpanded);
    }
  }, []);

  // Force session refresh if role is missing after login
  useEffect(() => {
    if (
      status === "authenticated" &&
      !userData?.user?.role &&
      !hasRefreshed.current
    ) {
      hasRefreshed.current = true;
      update();
    }
    if (status === "unauthenticated") {
      hasRefreshed.current = false;
    }
  }, [status, userData?.user?.role]);

  // Wait until session is fully resolved
  if (isLoading)
    return <div className="w-full text-center p-10">Loading...</div>;
  if (status === "unauthenticated") router.refresh(); // or redirect

  const defaultOpen = Cookies.get("sidebar_state") !== "false";
  const role = userData?.user?.role ?? "guest";

  return (
    <div className="flex overflow-hidden">
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          <Header>
            <TopNav links={topNav} />
            <div className="ml-auto flex items-center space-x-4">
              <CommandPalette />
              <ThemeSwitch />
              <ProfileDropdown />
            </div>
          </Header>
          <main>
            <div className="w-full min-h-screen mx-auto p-6 bg-slate-200">
              <AbilityProvider role={role}>{children}</AbilityProvider>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}

const topNav = [
  {
    title: "Overview",
    href: "/dashboard",
    isActive: true,
    disabled: false,
  },
];
