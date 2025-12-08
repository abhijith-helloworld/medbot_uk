"use client";

import { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Users,
  Calendar,
  Bell,
  Clock,
  MapPin,
  DoorOpen,
  ClipboardCheck,
} from "lucide-react";
import {
  useAlerts,
  useRespondToAlert,
  useRobotTelemetry,
  useFailedSchedules,
  useRespondToFailedSchedule,
} from "./nurseOverview/hooks/useAlerts";

type Alert = {
  id: string;
  room: string;
  bed: string;
  reason?: string;
  created_at: string;
};

export function NurseOverview({ title }: { title: string }) {
  const { data: alerts, isLoading, isError } = useAlerts();
  const { data: telemetry, isLoading: isTelemetryLoading } =
    useRobotTelemetry();
  const respondToAlertMutation = useRespondToAlert();

  const { data: failedSchedules, isLoading: isLoadingSchedules } =
    useFailedSchedules();
  const respondToScheduleMutation = useRespondToFailedSchedule();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [responseReason, setResponseReason] = useState("");

  const [visibleAlertsCount, setVisibleAlertsCount] = useState(5);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleRespond = async () => {
    if (!selectedAlert || !responseReason.trim()) return;
    try {
      await respondToAlertMutation.mutateAsync({
        alertId: selectedAlert.id,
        reason: responseReason,
      });
      setIsModalOpen(false);
      setResponseReason("");
      setSelectedAlert(null);
    } catch (error) {
      console.error("Failed to respond to alert:", error);
    }
  };

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (container && alerts) {
      const isAtBottom =
        container.scrollHeight - container.scrollTop <=
        container.clientHeight + 5;

      if (isAtBottom && visibleAlertsCount < alerts.length) {
        setVisibleAlertsCount((prevCount) => prevCount + 5);
      }
    }
  };

  const sortedAlerts =
    alerts?.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ) || [];

  const groupedAlerts = {
    timedOut: sortedAlerts.filter((a) => a.is_timed_out),
    help: sortedAlerts.filter((a) => a.is_help),
    cancelled: sortedAlerts.filter((a) => a.is_cancelled),
    notMe: sortedAlerts.filter((a) => a.not_me),
    patientPop: sortedAlerts.filter((a) => a.is_patient_pop),
    others: sortedAlerts.filter(
      (a) =>
        !a.is_timed_out &&
        !a.is_help &&
        !a.is_cancelled &&
        !a.not_me &&
        !a.is_patient_pop
    ),
  };

  const unrespondedSchedules =
    failedSchedules?.filter((schedule) => !schedule.responded) || [];

  return (
    <div className="mx-auto space-y-6 px-4 md:px-6 lg:px-10 py-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">
          Your patients and tasks for today
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Robot</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {telemetry?.robot_name || "Unknown"}
            </div>
            <p className="text-xs text-muted-foreground">Assigned to you</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Battery</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {telemetry?.robot_battery || 0}%
            </div>
            <p className="text-xs text-muted-foreground">Current battery</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Latest position
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {telemetry?.latest_room_reached || "Unknown"}
            </div>
            <p className="text-xs text-muted-foreground">
              Bed: {telemetry?.latest_bed_reached || "Unknown"}
            </p>
            {telemetry?.robot_door_opening && (
              <div className="mt-2 flex items-center">
                <Badge
                  variant="outline"
                  className="border-blue-500 text-blue-500 flex items-center gap-1"
                >
                  <DoorOpen className="h-3 w-3" />
                  Door Opening
                </Badge>
              </div>
            )}
            {telemetry?.robot_door_closing && (
              <div className="mt-2 flex items-center">
                <Badge
                  variant="outline"
                  className="border-red-500 text-red-500 flex items-center gap-1"
                >
                  <DoorOpen className="h-3 w-3" />
                  Door closing
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Urgent Items */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Urgent Alerts Section */}
        <Card>
          <CardHeader>
            <CardTitle>Urgent Alerts</CardTitle>
            <CardDescription>
              Patients requiring immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="space-y-4 max-h-[350px] overflow-y-auto pr-3"
          >
            {Object.entries(groupedAlerts).map(([groupName, alerts]) =>
              alerts.length > 0 ? (
                <div key={groupName}>
                  <h3 className="text-md font-semibold mb-2 capitalize">
                    {groupName.replace(/([A-Z])/g, " $1")}
                  </h3>
                  {alerts.slice(0, visibleAlertsCount).map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            groupName === "timedOut"
                              ? "bg-yellow-500"
                              : groupName === "help"
                              ? "bg-red-500"
                              : groupName === "cancelled"
                              ? "bg-gray-400"
                              : groupName === "notMe"
                              ? "bg-blue-400"
                              : groupName === "patientPop"
                              ? "bg-purple-500"
                              : "bg-green-500"
                          }`}
                        />
                        <div>
                          <p className="font-medium">
                            Room: {alert.room} • Bed: {alert.bed}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {alert.reason || "No reason provided yet"}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {new Date(alert.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => {
                          setSelectedAlert(alert);
                          setResponseReason("");
                          setIsModalOpen(true);
                        }}
                      >
                        Respond
                      </Button>
                    </div>
                  ))}
                </div>
              ) : null
            )}
          </CardContent>
        </Card>

        {/* Failed Schedules Section */}
        <Card>
          <CardHeader>
            <CardTitle>Failed Schedules</CardTitle>
            <CardDescription>
              Schedules that require manual confirmation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[350px] overflow-y-auto pr-3">
            {isLoadingSchedules && <p>Loading schedules...</p>}
            {!isLoadingSchedules && unrespondedSchedules.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No failed schedules to review.
              </p>
            )}
            {unrespondedSchedules.map((schedule) => {
              // --- START OF FIX ---
              const isUpdatingThisSchedule =
                respondToScheduleMutation.isPending &&
                respondToScheduleMutation.variables === schedule.id;
              // --- END OF FIX ---

              return (
                <div
                  key={schedule.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <ClipboardCheck className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {schedule.reason || "Reason not specified"}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {schedule.room_name} • {schedule.bed_name}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Clock className="w-3 h-3" />
                        {new Date(schedule.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      respondToScheduleMutation.mutate(schedule.id)
                    }
                    // Disable all buttons if any mutation is running,
                    // but only the clicked one will show the loading text.
                    disabled={respondToScheduleMutation.isPending}
                  >
                    {isUpdatingThisSchedule ? "Updating..." : "Acknowledge"}
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Modal for Responding */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Respond to Alert</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {selectedAlert && (
              <p className="text-sm text-muted-foreground">
                Room: {selectedAlert.room} • Bed: {selectedAlert.bed}
              </p>
            )}
            <Input
              placeholder="Enter response reason..."
              value={responseReason}
              onChange={(e) => setResponseReason(e.target.value)}
            />
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRespond}
              disabled={
                respondToAlertMutation.isPending || !responseReason.trim()
              }
            >
              {respondToAlertMutation.isPending ? "Updating..." : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
