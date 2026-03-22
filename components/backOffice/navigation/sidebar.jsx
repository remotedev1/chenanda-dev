import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { baseSidebarData } from "./data/sidebar-data";
import { NavGroup } from "./nav-group";
import { NavUser } from "./nav-user";
import { SidebarClose } from "lucide-react";

export function AppSidebar({ ...props }) {
  const sidebarData = baseSidebarData;

  return (
    <Sidebar collapsible="icon" variant="floating" {...props}>
      <div className="bg-white min-h-screen ">
        <SidebarHeader>
          <div className="flex justify-between">
            <h1 className="text-lg font-semibold relative left-2 overflow-hidden">
              {process.env.NEXT_PUBLIC_COMPANY_NAME}
            </h1>
            <SidebarClose>X</SidebarClose>
          </div>
        </SidebarHeader>
        <SidebarContent>
          {sidebarData.navGroups.map((props) => (
            <NavGroup key={props.title} {...props} />
          ))}
        </SidebarContent>
        <SidebarFooter>
          <NavUser />
        </SidebarFooter>
        <SidebarRail />
      </div>
    </Sidebar>
  );
}
