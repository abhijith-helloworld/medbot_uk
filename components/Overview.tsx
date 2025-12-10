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
  id: number;
  room: string;
  bed: string;
  reason?: string;
  created_at: string;
  is_timed_out?: boolean;
  is_help?: boolean;
  is_cancelled?: boolean;
  not_me?: boolean;
  is_patient_pop?: boolean;
};

type FailedSchedule = {
  id: number;
  reason?: string;
  room_name: string;
  bed_name: string;
  created_at: string;
  responded: boolean;
};

export function NurseOverview({ title }: { title: string }) {
  const { data: alerts } = useAlerts();
  const { data: telemetry } = useRobotTelemetry();
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
    <div className="w-full mx-auto space-y-4 sm:space-y-6 px-3 sm:px-4 md:px-6 lg:px-10 py-3 sm:py-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {title}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Your patients and tasks for today
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Robot
            </CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="text-lg sm:text-2xl font-bold truncate">
              {telemetry?.robot_name || "Unknown"}
            </div>
            <p className="text-xs text-muted-foreground">Assigned to you</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Battery
            </CardTitle>
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="text-lg sm:text-2xl font-bold">
              {telemetry?.robot_battery || 0}%
            </div>
            <p className="text-xs text-muted-foreground">Current battery</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Alerts
            </CardTitle>
            <Bell className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="text-lg sm:text-2xl font-bold">
              {alerts?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card className="col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Latest position
            </CardTitle>
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="text-lg sm:text-2xl font-bold capitalize truncate">
              {telemetry?.latest_room_reached || "Unknown"}
            </div>
            <p className="text-xs text-muted-foreground capitalize">
              Bed: {telemetry?.latest_bed_reached || "Unknown"}
            </p>
            {telemetry?.robot_door_opening && (
              <div className="mt-2 flex items-center">
                <Badge
                  variant="outline"
                  className="border-blue-500 text-blue-500 flex items-center gap-1 text-xs"
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
                  className="border-red-500 text-red-500 flex items-center gap-1 text-xs"
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
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Urgent Alerts Section */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Urgent Alerts</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Patients requiring immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="space-y-3 sm:space-y-4 max-h-[300px] sm:max-h-[350px] overflow-y-auto pr-2 sm:pr-3 p-4 pt-0 sm:p-6 sm:pt-0"
          >
            {Object.entries(groupedAlerts).map(([groupName, alertsList]) =>
              alertsList.length > 0 ? (
                <div key={groupName}>
                  <h3 className="text-sm sm:text-md font-semibold mb-2 capitalize">
                    {groupName.replace(/([A-Z])/g, " $1")}
                  </h3>
                  {alertsList.slice(0, visibleAlertsCount).map((alert) => (
                    <div
                      key={alert.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg gap-3 mb-2"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div
                          className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${
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
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm break-words">
                            Room: {alert.room} • Bed: {alert.bed}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground break-words">
                            {alert.reason || "No reason provided yet"}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Clock className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">
                              {new Date(alert.created_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="default"
                        className="w-full sm:w-auto flex-shrink-0"
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
            {sortedAlerts.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No alerts at this time.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Failed Schedules Section */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">
              Failed Schedules
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Schedules that require manual confirmation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 max-h-[300px] sm:max-h-[350px] overflow-y-auto pr-2 sm:pr-3 p-4 pt-0 sm:p-6 sm:pt-0">
            {isLoadingSchedules && (
              <p className="text-sm text-center py-4">Loading schedules...</p>
            )}
            {!isLoadingSchedules && unrespondedSchedules.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No failed schedules to review.
              </p>
            )}
            {unrespondedSchedules.map((schedule: FailedSchedule) => {
              const isUpdatingThisSchedule =
                respondToScheduleMutation.isPending &&
                String(respondToScheduleMutation.variables) === String(schedule.id);

              return (
                <div
                  key={schedule.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg gap-3"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ClipboardCheck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm break-words">
                        {schedule.reason || "Reason not specified"}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">
                          {schedule.room_name} • {schedule.bed_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">
                          {new Date(schedule.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full sm:w-auto flex-shrink-0"
                    onClick={() =>
                      respondToScheduleMutation.mutate(schedule.id)
                    }
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
        <DialogContent className="sm:max-w-md mx-4">
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
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRespond}
              disabled={
                respondToAlertMutation.isPending || !responseReason.trim()
              }
              className="w-full sm:w-auto"
            >
              {respondToAlertMutation.isPending ? "Updating..." : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}