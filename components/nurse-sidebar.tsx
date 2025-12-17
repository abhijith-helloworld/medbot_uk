"use client"

import { LayoutDashboard, Users, Calendar, Bell, Video, LogOut, Activity, MapPin, Grid3x3, CircleUser, Bot, Shield, ClipboardCheck, Stethoscope, Clock } from "lucide-react"
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
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface NurseSidebarProps {
  user: { name: string; role?: string }
  onLogout: () => void
  activeView: string
  setActiveView: (view: string) => void
}

const menuGroups = [
  {
    title: "Dashboard",
    items: [
      { id: "overview", title: "Overview", icon: LayoutDashboard, description: "Daily summary" },
    ]
  },
  {
    title: "Patient Care",
    items: [
      { id: "patients", title: "My Patients", icon: CircleUser, description: "Patient list" },
      { id: "management", title: "Task Schedule", icon: ClipboardCheck, description: "Assignments"},
      { id: "apparatus", title: "Medical Equipment", icon: Stethoscope, description: "Device status" },
    ]
  },
  {
    title: "Robot System",
    items: [
      { id: "robots", title: "Robot Status", icon: Bot, description: "Fleet monitoring" },
      { id: "waypoints", title: "Waypoints", icon: MapPin, description: "Navigation points" },
      { id: "map", title: "Facility Map", icon: MapPin, description: "Floor layout" },
    ]
  },
  {
    title: "Management",
    items: [
      // { id: "management", title: "Team", icon: Users, description: "Staff directory" },
      { id: "scheduler", title: "Schedule", icon: Clock, description: "Shift planning" },
      { id: "videos", title: "Tutorials", icon: Video, description: "Training videos" },
      // { id: "security", title: "Security", icon: Shield, description: "Access control" },
    ]
  }
]

export function NurseSidebar({ user, onLogout, activeView, setActiveView }: NurseSidebarProps) {
  return (
    <Sidebar className="border-r border-border/40 bg-purple-50 dark:bg-slate-900 no-scrollbar">
      <SidebarHeader>
        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-[#9d4ec3] to-[#7b2cbf] rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-pulse"></div>
              </div>
              <div>
                <h1 className="font-bold text-lg tracking-tight dark:text-white text-slate-900">
                  MedBot
                  <span className="block text-xs font-normal text-purple-600 dark:text-purple-400 mt-0.5">
                    Nurse Station , {user.name}
                  </span>
                </h1>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 no-scrollbar">
        {menuGroups.map((group, groupIndex) => (
          <SidebarGroup key={groupIndex} className="mb-3 last:mb-0">
            <h3 className="text-xs font-semibold text-purple-700/70 dark:text-purple-400/70 uppercase tracking-wider px-2 mb-2">
              {group.title}
            </h3>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = activeView === item.id
                  
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setActiveView(item.id)}
                        isActive={isActive}
                        className={cn(
                          "w-full justify-start px-3 py-3 my-0.5 rounded-xl transition-all duration-200",
                          "hover:bg-white/80 dark:hover:bg-slate-800/80 active:scale-[0.98] py-6",
                          isActive && "border border-purple-300/50 dark:border-purple-700/50 shadow-sm bg-white dark:bg-slate-800 py-8"
                        )}
                      >
                        <div className={cn(
                          "w-9 h-9 rounded-lg flex items-center justify-center mr-3 transition-colors",
                          isActive 
                            ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-sm" 
                            : "bg-white/60 dark:bg-slate-800/60 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-slate-700"
                        )}>
                          <Icon className={cn(
                            "w-4 h-4",
                            isActive && "text-white"
                          )} />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "font-medium text-slate-800 dark:text-slate-200",
                              isActive && "text-purple-700 dark:text-purple-300 font-semibold"
                            )}>
                              {item.title}
                            </span>
                            {/* {item.badge && (
                              <Badge 
                                variant={isActive ? "default" : "secondary"} 
                                className="h-5 px-1.5 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                              >
                                {item.badge}
                              </Badge>
                            )} */}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                            {item.description}
                          </p>
                        </div>
                        {isActive && (
                          <div className="w-2 h-2 rounded-full bg-purple-500 ml-2 animate-pulse"></div>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-purple-200/50 dark:border-slate-700/40">
        <div className="space-y-3">          
          {/* Logout Button */}
          <Button
            variant="ghost"
            onClick={onLogout}
            className="w-full justify-start px-3 py-3 rounded-lg hover:bg-red-50/80 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors group border border-transparent dark:hover:border-red-900/30"
          >
            <div className="w-8 h-8 rounded-lg bg-red-50/50 dark:bg-red-900/10 flex items-center justify-center mr-3 group-hover:bg-red-100 dark:group-hover:bg-red-900/20 transition-colors">
              <LogOut className="w-4 h-4 text-red-500/70 dark:text-red-400/70 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
            </div>
            <div className="flex-1 text-left">
              <span className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-red-600 dark:group-hover:text-red-400">
                End Shift
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {user.name} • Sign out
              </p>
            </div>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}