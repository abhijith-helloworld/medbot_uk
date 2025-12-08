"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar, Clock, User, MapPin, Plus } from "lucide-react"

export function TaskScheduler() {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      time: "2:30 PM",
      task: "Medicine Administration",
      patient: "John Smith",
      room: "Room 101",
      completed: false,
      priority: "high",
    },
    {
      id: 2,
      time: "3:00 PM",
      task: "Vitals Check",
      patient: "Mary Johnson",
      room: "Room 105",
      completed: false,
      priority: "high",
    },
    {
      id: 3,
      time: "3:30 PM",
      task: "Physical Therapy",
      patient: "Robert Davis",
      room: "Room 108",
      completed: false,
      priority: "normal",
    },
    {
      id: 4,
      time: "4:00 PM",
      task: "Medicine Administration",
      patient: "Lisa Wilson",
      room: "Room 110",
      completed: false,
      priority: "normal",
    },
    {
      id: 5,
      time: "4:30 PM",
      task: "Wound Dressing",
      patient: "John Smith",
      room: "Room 101",
      completed: false,
      priority: "normal",
    },
    {
      id: 6,
      time: "5:00 PM",
      task: "Discharge Preparation",
      patient: "Robert Davis",
      room: "Room 108",
      completed: false,
      priority: "low",
    },
  ])

  const toggleTask = (id: number) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "normal":
        return "default"
      case "low":
        return "secondary"
      default:
        return "outline"
    }
  }

  const completedTasks = tasks.filter((task) => task.completed).length
  const totalTasks = tasks.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Schedule</h1>
          <p className="text-muted-foreground">Manage your daily tasks and appointments</p>
        </div>
        <Button className="bg-[#9d4ec3] hover:bg-[#8a42b8]">
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Today's Progress
          </CardTitle>
          <CardDescription>
            {completedTasks} of {totalTasks} tasks completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#9d4ec3] h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {Math.round((completedTasks / totalTasks) * 100)}% complete
          </p>
        </CardContent>
      </Card>

      {/* Task List */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <Card key={task.id} className={`transition-all ${task.completed ? "opacity-60" : "hover:shadow-md"}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(task.id)}
                  className="data-[state=checked]:bg-[#9d4ec3] data-[state=checked]:border-[#9d4ec3]"
                />

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                      {task.task}
                    </h3>
                    <Badge variant={getPriorityColor(task.priority)}>{task.priority}</Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {task.time}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {task.patient}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {task.room}
                    </div>
                  </div>
                </div>

                {!task.completed && (
                  <Button size="sm" variant="outline">
                    Start Task
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
