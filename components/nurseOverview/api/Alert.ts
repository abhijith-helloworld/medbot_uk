// src/lib/api/Alert.ts (or your API file path)

import api from "@/lib/api/apiClient";

export interface Alert {
  id: number;
  room: string;
  bed: string;
  reason: string;
  responded: boolean;
  created_at: string;
  is_timed_out: boolean;
  is_help: boolean;
  is_cancelled: boolean;
  not_me: boolean;
  is_patient_pop: boolean;
}

export interface RobotTelemetry {
  id: number;
  robot_name: string;
  robot_battery: number;
  robot_break: boolean;
  robot_emergency: boolean;
  robot_in_dock: boolean;
  robot_audio_level: number;
  robot_map_file: string | null;
  robot_map_url: string | null;
  robot_door_opening: boolean;
  robot_door_closing: boolean;
  latest_room_reached: string;
  latest_bed_reached: string;
  maintenance_start_date: string | null;
  maintenance_end_date: string | null;
  maintenance_limit: number | null;
  working_time: number | null;
  status: boolean;
}

// ADDED: Interface for a single failed schedule item
export interface FailedSchedule {
  id: number;
  room_name: string;
  bed_name: string;
  reason: string;
  responded: boolean;
  created_at: string;
  updated_at: string;
}

export async function fetchRobotTelemetry(): Promise<RobotTelemetry> {
  const { data } = await api.get("robot_management/all-robot-telemetry/");
  return data.data[0];
}

export async function fetchAlerts(): Promise<Alert[]> {
  const { data } = await api.get("robot_management/active/alerts/");
  const alerts = data?.data;
  if (Array.isArray(alerts)) return alerts;
  if (alerts == null) return [];
  return [alerts] as unknown as Alert[];
}

export async function respondToAlert(id: number, reason: string) {
  try {
    const { data } = await api.patch(
      `robot_management/alerts/${id}/update-reason/`,
      {
        reason,
      }
    );
    return data.data;
  } catch (error) {
    console.error("Failed to update alert reason:", error);
    throw error;
  }
}

// ADDED: Function to fetch the list of failed schedules
export async function fetchFailedSchedules(): Promise<FailedSchedule[]> {
  const { data } = await api.get("robot_management/failed-schedules/");
  // Based on your screenshot, the data is nested under results.data
  const schedules = data?.results?.data;
  return Array.isArray(schedules) ? schedules : [];
}

// ADDED: Function to update a failed schedule as "responded"
export async function respondToFailedSchedule(id: number): Promise<FailedSchedule> {
  // Using PUT as per your screenshot, sending responded: true in the body
  const { data } = await api.put(
    `robot_management/failed-schedules/${id}/`,
    { responded: true }
  );
  return data.data;
}