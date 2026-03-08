// hooks/useSidebarData.js
import { HelpCircle, LayoutDashboard, Settings, UserCog } from "lucide-react";

export const baseSidebarData = {
  navGroups: [
    {
      title: "General",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "Management",
      items: [
        {
          title: "Tournament settings",
          icon: Settings,
          items: [
            {
              title: "Tournament List",
              url: "/dashboard/tournaments",
              icon: UserCog,
            },

            {
              title: "Families List",
              url: "/dashboard/families",
              icon: UserCog,
            },
            {
              title: "Players List",
              url: "/dashboard/families/players",
              icon: UserCog,
            },
            {
              title: "Payments List",
              url: "/dashboard/tournaments/payments",
              icon: UserCog,
            },
            {
              title: "Sponsor List",
              url: "/dashboard/tournaments/sponsors",
              icon: UserCog,
            },
          ],
        },
      ],
    },
    {
      title: "Other",
      items: [
        {
          title: "Settings",
          icon: Settings,
          items: [
            {
              title: "Profile",
              url: "/dashboard",
              icon: UserCog,
            },
          ],
        },
        {
          title: "Help Center",
          url: "/dashboard",
          icon: HelpCircle,
        },
      ],
    },
  ],
};
