"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, Users, UserIcon as UserNurse, AlertTriangle, Battery } from "lucide-react"

export function AdminOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
        <p className="text-muted-foreground">Monitor and manage your medical robot system</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Robots</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">+2 from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+3 from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Nurses</CardTitle>
            <UserNurse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">On duty now</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Robot Status Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Robot Status Summary</CardTitle>
            <CardDescription>Current status of all medical robots</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { id: "MR-001", room: "Room 101", battery: 85, status: "active" },
              { id: "MR-002", room: "Room 102", battery: 92, status: "active" },
              { id: "MR-003", room: "Room 103", battery: 23, status: "low-battery" },
              { id: "MR-004", room: "Room 104", battery: 78, status: "active" },
            ].map((robot) => (
              <div key={robot.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Bot className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{robot.id}</p>
                    <p className="text-sm text-muted-foreground">{robot.room}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Battery className="w-4 h-4" />
                    <span className="text-sm">{robot.battery}%</span>
                  </div>
                  <Badge variant={robot.status === "active" ? "default" : "destructive"}>
                    {robot.status === "active" ? "Active" : "Low Battery"}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system events and notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { time: "2 min ago", event: "Patient help request - Room 102", type: "alert" },
              { time: "5 min ago", event: "Robot MR-003 battery low", type: "warning" },
              { time: "10 min ago", event: "New patient assigned - Room 105", type: "info" },
              { time: "15 min ago", event: "Nurse Sarah logged in", type: "info" },
            ].map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === "alert"
                      ? "bg-red-500"
                      : activity.type === "warning"
                        ? "bg-yellow-500"
                        : "bg-blue-500"
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm">{activity.event}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
