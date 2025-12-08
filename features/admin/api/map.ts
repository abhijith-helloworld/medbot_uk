// src/lib/api/map.ts

import api from "@/lib/api/apiClient";

export type MapData = {
  id: number;
  map_name: string;
  robot_map_file: string;
  robot_map_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse {
  status: "success" | "error";
  message: string;
}

export interface MapsResponse extends ApiResponse {
  data: MapData[];
}

export interface ActivateMapResponse extends ApiResponse {
  data: MapData;
}

export const getMaps = async (): Promise<MapsResponse> => {
  // Assuming your apiClient is configured with the base URL http://192.168.1.33:8000/api/medicalbot/
  const res = await api.get("robot_management/maps/getsert/");
  return res.data;
};

// NEW: Function to delete a map
export const deleteMap = async (id: number): Promise<ApiResponse> => {
  const res = await api.delete(`robot_management/maps/${id}/delete/`);
  return res.data;
};

// NEW: Function to activate a map
export const activateMap = async (id: number): Promise<ActivateMapResponse> => {
  const res = await api.put(`robot_management/maps/activate-map/${id}/`);
  return res.data;
};