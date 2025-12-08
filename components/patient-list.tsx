"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, MapPin, Clock, Phone, AlertCircle } from "lucide-react"

export function PatientList() {
  const patients = [
    {
      id: 1,
      name: "John Smith",
      age: 65,
      room: "Room 101",
      bed: "A",
      condition: "Stable",
      lastVisit: "2 hours ago",
      nextTask: "Medicine - 2:30 PM",
      priority: "normal",
    },
    {
      id: 2,
      name: "Mary Johnson",
      age: 72,
      room: "Room 105",
      bed: "B",
      condition: "Critical",
      lastVisit: "30 min ago",
      nextTask: "Vitals Check - 3:00 PM",
      priority: "high",
    },
    {
      id: 3,
      name: "Robert Davis",
      age: 58,
      room: "Room 108",
      bed: "A",
      condition: "Recovering",
      lastVisit: "1 hour ago",
      nextTask: "Physical Therapy - 3:30 PM",
      priority: "normal",
    },
    {
      id: 4,
      name: "Lisa Wilson",
      age: 45,
      room: "Room 110",
      bed: "B",
      condition: "Stable",
      lastVisit: "45 min ago",
      nextTask: "Medicine - 4:00 PM",
      priority: "normal",
    },
  ]

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "Critical":
        return "destructive"
      case "Stable":
        return "default"
      case "Recovering":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getPriorityColor = (priority: string) => {
    return priority === "high" ? "border-red-200 bg-red-50" : "border-gray-200"
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Patients</h1>
        <p className="text-muted-foreground">Patients assigned to your care</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {patients.map((patient) => (
          <Card key={patient.id} className={`${getPriorityColor(patient.priority)} transition-all hover:shadow-md`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-lg">{patient.name}</CardTitle>
                    <CardDescription>Age {patient.age}</CardDescription>
                  </div>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <Badge variant={getConditionColor(patient.condition)}>{patient.condition}</Badge>
                  {patient.priority === "high" && (
                    <div className="flex items-center gap-1 text-red-600">
                      <AlertCircle className="w-3 h-3" />
                      <span className="text-xs">High Priority</span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {patient.room} - Bed {patient.bed}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>Last visit: {patient.lastVisit}</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="w-4 h-4 text-[#9d4ec3]" />
                  <span className="text-[#9d4ec3]">Next: {patient.nextTask}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Phone className="w-3 h-3 mr-1" />
                  Call
                </Button>
                <Button size="sm" className="flex-1 bg-[#9d4ec3] hover:bg-[#8a42b8]">
                  Visit Patient
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
