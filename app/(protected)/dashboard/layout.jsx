"use client";

import { Header } from "@/components/backOffice/navigation/header";
import { ProfileDropdown } from "@/components/backOffice/navigation/profile-dropdown";
import { Search } from "@/components/backOffice/navigation/search";
import { AppSidebar } from "@/components/backOffice/navigation/sidebar";
import { ThemeSwitch } from "@/components/backOffice/navigation/theme-switch";
import { TopNav } from "@/components/backOffice/navigation/top-nav";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useCurrentUser } from "@/hooks/use-current-user";
import Cookies from "js-cookie";
import { useEffect } from "react";

export default function DashboardLayout({ children }) {
  const { status } = useCurrentUser();

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

  if (status === "unauthenticated") return;

  const defaultOpen = Cookies.get("sidebar_state") !== "false";

  return (
    <div className="flex overflow-hidden">
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />

        {/* Content area */}
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {/* ===== Top Heading ===== */}
          <Header>
            <TopNav links={topNav} />
            <div className="ml-auto flex items-center space-x-4">
              <Search />
              <ThemeSwitch />
              <ProfileDropdown />
            </div>
          </Header>
          {/* Main content */}
          <main>
            <div className="w-full min-h-screen mx-auto bg-gray-300 p-6">
              {children}
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
    href: "dashboard/",
    isActive: true,
    disabled: false,
  },
];
