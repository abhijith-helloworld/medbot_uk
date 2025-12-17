"use client"

import { Bot, LayoutDashboard, Users, UserIcon as UserNurse, LogOut, Activity, MapPin, Shield, Hospital, Settings } from "lucide-react"
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

interface AdminSidebarProps {
  user: { name: string; role?: string }
  onLogout: () => void
  activeView: string
  setActiveView: (view: string) => void
}

const menuGroups = [
  {
    title: "Dashboard",
    items: [
      { id: "overview", title: "Overview", icon: LayoutDashboard, description: "System analytics" },
    ]
  },
  {
    title: "Management",
    items: [
      { id: "robots", title: "Robot Fleet", icon: Bot, description: "Monitor & control", badge: 12 },
      { id: "patients", title: "Patients", icon: Users, description: "Manage patient data" },
      { id: "nurses", title: "Nursing Staff", icon: UserNurse, description: "Staff management" },
    ]
  },
  {
    title: "System",
    items: [
      { id: "management", title: "Infrastructure", icon: Hospital, description: "Facility setup" },
      { id: "map", title: "Map Layout", icon: MapPin, description: "Floor management" },
      // { id: "security", title: "Security", icon: Shield, description: "Access controls" },
      // { id: "settings", title: "Settings", icon: Settings, description: "System configuration" },
    ]
  }
]

export function AdminSidebar({ user, onLogout, activeView, setActiveView }: AdminSidebarProps) {
  return (
    <Sidebar className="border-r border-purple-200/50 dark:border-slate-700/50 bg-gradient-to-b from-purple-50 to-purple-100/30 dark:from-slate-900 dark:to-slate-950 ">
      <SidebarHeader>
        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></div>
              </div>
              <div>
                <h1 className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                  MedBot
                  <span className="block text-xs font-normal text-purple-600 dark:text-purple-400 mt-0.5 capitalize">
                    {user.name} Console
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
          <SidebarGroup key={groupIndex} className="mb-5 last:mb-0">
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
                          "w-full justify-start px-4 py-3 my-0.5 rounded-xl transition-all duration-200",
                          " dark:hover:bg-slate-800/80 active:scale-[0.98] hover:shadow-sm py-5",
                          isActive && "border border-purple-300/50 dark:border-purple-700/50 shadow-md bg-white dark:bg-slate-800 py-8"
                        )}
                      >
                        <div className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center mr-3 transition-colors shadow-sm",
                          isActive 
                            ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-md selection:" 
                            : "bg-white/80 dark:bg-slate-800/80 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-slate-700 "
                        )}>
                          <Icon className={cn(
                            "w-4 h-4",
                            isActive && "text-white"
                          )} />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "font-medium text-slate-900 dark:text-slate-100",
                              isActive && "text-purple-700 dark:text-purple-300 font-semibold"
                            )}>
                              {item.title}
                            </span>
                
                          </div>
                          <p className={cn(
                            "text-xs mt-0.5",
                            isActive 
                              ? "text-purple-600 dark:text-purple-400" 
                              : "text-slate-600 dark:text-slate-400"
                          )}>
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

      <SidebarFooter className="p-4 dark:border-slate-700/40">
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={onLogout}
            className="w-full justify-start px-4 py-3 rounded-lg hover:bg-red-50/80 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors group border border-transparent  dark:hover:border-red-900/30"
          >
            <div className="w-9 h-9 rounded-lg bg-red-50/50 dark:bg-red-900/10 flex items-center justify-center mr-3 group-hover:bg-red-100 dark:group-hover:bg-red-900/20 transition-colors">
              <LogOut className="w-4 h-4 text-red-500/70 dark:text-red-400/70 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
            </div>
            <div className="flex-1 text-left">
              <span className="font-medium text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-red-400">
                Sign Out
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {user.name} • End Session
              </p>
            </div>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}