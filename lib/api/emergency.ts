"use client";

import api from "@/lib/api/apiClient";

// This type now correctly reflects the nested structure of your API response.
type EmergencyApiResponse = {
  status: string;
  message: string;
  data: {
    robot_emergency: boolean;
  };
};

// Fetch current emergency status
export async function fetchEmergencyStatus(): Promise<boolean> {
  try {
    const res = await api.get<EmergencyApiResponse>(
      "robot_management/getup/robot/robot_emergency/"
    );
    // The boolean value is nested inside a 'data' object.
    return res.data.data.robot_emergency;
  } catch (error) {
    console.error("Failed to fetch emergency status:", error);
    throw new Error("Unable to fetch emergency status");
  }
}

// Toggle emergency state
export async function toggleEmergencyAPI(active: boolean): Promise<boolean> {
  try {
    const form = new FormData();
    form.append("robot_emergency", String(!active));

    // Assuming the PUT response might also be nested
    const res = await api.put<EmergencyApiResponse>(
      "robot_management/getup/robot/robot_emergency/",
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    return res.data.data.robot_emergency;
  } catch (err) {
    try {
      // fallback to JSON
      const res = await api.put<EmergencyApiResponse>(
        "robot_management/getup/robot/robot_emergency/",
        { robot_emergency: !active }
      );
      // Corrected the path here as well for the JSON fallback.
      return res.data.data.robot_emergency;
    } catch (jsonError) {
      console.error("Failed to toggle emergency:", jsonError);
      throw new Error("Unable to toggle emergency status");
    }
  }
}
