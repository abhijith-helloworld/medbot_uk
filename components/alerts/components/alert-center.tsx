"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, AlertTriangle, User, MapPin, Clock, CheckCircle } from "lucide-react"

export function AlertCenter() {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: "help",
      patient: "John Smith",
      room: "Room 102",
      message: "Patient pressed help button",
      time: "2 min ago",
      priority: "high",
      status: "active",
    },
    {
      id: 2,
      type: "medicine",
      patient: "Mary Johnson",
      room: "Room 105",
      message: "Medicine administration overdue",
      time: "5 min ago",
      priority: "high",
      status: "active",
    },
    {
      id: 3,
      type: "vitals",
      patient: "Robert Davis",
      room: "Room 108",
      message: "Vitals check reminder",
      time: "10 min ago",
      priority: "medium",
      status: "active",
    },
    {
      id: 4,
      type: "system",
      patient: "Robot MR-003",
      room: "Room 103",
      message: "Low battery warning",
      time: "15 min ago",
      priority: "medium",
      status: "active",
    },
    {
      id: 5,
      type: "help",
      patient: "Lisa Wilson",
      room: "Room 110",
      message: "Patient assistance request",
      time: "1 hour ago",
      priority: "low",
      status: "resolved",
    },
  ])

  const resolveAlert = (id: number) => {
    setAlerts(alerts.map((alert) => (alert.id === id ? { ...alert, status: "resolved" } : alert)))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "help":
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      case "medicine":
        return <Clock className="w-5 h-5 text-orange-500" />
      case "vitals":
        return <User className="w-5 h-5 text-blue-500" />
      case "system":
        return <Bell className="w-5 h-5 text-purple-500" />
      default:
        return <Bell className="w-5 h-5" />
    }
  }

  const activeAlerts = alerts.filter((alert) => alert.status === "active")
  const resolvedAlerts = alerts.filter((alert) => alert.status === "resolved")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Alert Center</h1>
        <p className="text-muted-foreground">Monitor and respond to patient alerts and system notifications</p>
      </div>

      {/* Alert Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{activeAlerts.length}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <Bell className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {activeAlerts.filter((alert) => alert.priority === "high").length}
            </div>
            <p className="text-xs text-muted-foreground">Urgent response needed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{resolvedAlerts.length}</div>
            <p className="text-xs text-muted-foreground">Successfully handled</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Active Alerts</h2>
        {activeAlerts.map((alert) => (
          <Card key={alert.id} className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getAlertIcon(alert.type)}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{alert.message}</h3>
                      <Badge variant={getPriorityColor(alert.priority)}>{alert.priority}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {alert.patient}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {alert.room}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {alert.time}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => resolveAlert(alert.id)}>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Resolve
                  </Button>
                  <Button size="sm" className="bg-[#9d4ec3] hover:bg-[#8a42b8]">
                    Respond
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Resolved Alerts */}
      {resolvedAlerts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recently Resolved</h2>
          {resolvedAlerts.map((alert) => (
            <Card key={alert.id} className="opacity-60">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div className="space-y-1">
                    <h3 className="font-medium line-through">{alert.message}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {alert.patient}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {alert.room}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {alert.time}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
