// src/hooks/useAlerts.ts (or your hooks file path)

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchAlerts,
  Alert,
  respondToAlert,
  fetchRobotTelemetry,
  RobotTelemetry,
  // ADDED: Import new types and functions
  fetchFailedSchedules,
  FailedSchedule,
  respondToFailedSchedule,
} from "../api/Alert";
import { Over } from "@dnd-kit/core";

export function useAlerts() {
  return useQuery<Alert[]>({
    queryKey: ["alerts"],
    queryFn: fetchAlerts,
    refetchInterval: 60000,
  });
}

export function useRobotTelemetry() {
  return useQuery<RobotTelemetry>({
    queryKey: ["robot-telemetry"],
    queryFn: fetchRobotTelemetry,
    refetchInterval: 2000,
  });
}

export function useRespondToAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ alertId, reason }: { alertId: number; reason: string }) =>
      respondToAlert(alertId, reason),

    onSuccess: (data) => {
      toast.success("Alert reason updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update alert reason."
      );
    },
  });
}

// ADDED: Hook to fetch failed schedules data
export function useFailedSchedules() {
  return useQuery<FailedSchedule[]>({
    queryKey: ["failedSchedules"],
    queryFn: fetchFailedSchedules,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

// ADDED: Hook for the mutation to acknowledge a failed schedule
export function useRespondToFailedSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (scheduleId: number) => respondToFailedSchedule(scheduleId),
    onSuccess: () => {
      toast.success("Schedule acknowledged successfully!");
      // This will refetch the data and remove the item from the list
      queryClient.invalidateQueries({ queryKey: ["failedSchedules"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to acknowledge schedule."
      );
    },
  });
}