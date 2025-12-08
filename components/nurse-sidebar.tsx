"use client"

import { LayoutDashboard, Users, Calendar, Bell, Video, LogOut, Activity , MapPin,Grid3x3,CircleUser,Bot } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

interface NurseSidebarProps {
  user: { name: string }
  onLogout: () => void
  activeView: string
  setActiveView: (view: string) => void
}

const menuItems = [
  { id: "overview", title: "Overview", icon: LayoutDashboard },
  { id: "robots", title: "Robot Status", icon: Bot },
  // { id: "tasks", title: "Task Schedule", icon: Calendar },
  { id: "patients", title: "My Patients", icon: CircleUser },
  { id: "management", title: "Management", icon: Users },
  { id: "waypoints", title: "Waypoints", icon: MapPin },
  // { id: "alerts", title: "Alerts", icon: Bell, badge: 3 },
  { id: "videos", title: "Tutorials", icon: Video },
  { id: "apparatus", title: "Apparatus", icon: Activity },
  { id: "scheduler", title: "Scheduler", icon: Grid3x3 },
    { id: "map", title: "Map Management", icon: MapPin },

]

export function NurseSidebar({ user, onLogout, activeView, setActiveView }: NurseSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-between px-2 py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#9d4ec3]/10 dark:bg-[#9d4ec3]/20 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-[#9d4ec3]" />
            </div>
            <div>
              <h2 className="font-semibold dark:text-white">MedBot Nurse</h2>
              <p className="text-sm text-muted-foreground">Welcome, {user.name}</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => setActiveView(item.id)}
                    isActive={activeView === item.id}
                    className="w-full justify-start"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                  {/* {item.badge && <SidebarMenuBadge className="bg-[#9d4ec3] text-white">{item.badge}</SidebarMenuBadge>} */}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Button
          variant="ghost"
          onClick={onLogout}
          className="w-full justify-start text-muted-foreground hover:text-foreground"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
