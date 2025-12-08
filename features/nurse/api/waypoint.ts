import Api ,{ webhookApi } from "@/lib/api/apiClient";

export interface ApiResponse {
    status: string;
    message: string;
    data: Room[];
}

export interface Room {
  id: number;
  room_name: string;
  entry_point: Point;
  exit_point: Point;
  is_active: boolean;
  created_at: string; 
  created_by: number;
  updated_at: string; 
  updated_by: number;
}

export interface Point {
  x: number | null;
  y: number | null;
  yaw: number | null;
}

export const getAllWaypoints = async (): Promise<ApiResponse> => {
  const { data } = await Api.get("bed/data/room/position/view/");
  return data;
}

export interface createWaypointDto {
    "room_pos_id"?: number;
}
export const createWaypointEntry = async (payload: createWaypointDto): Promise<ApiResponse> => {
  const { data } = await webhookApi.post("webhook/create-room-entry-position/", payload);
  return data;
}

export const createWaypointExit = async (payload: createWaypointDto): Promise<ApiResponse> => {
    const { data } = await webhookApi.post("webhook/create-room-exit-position/", payload);
    return data;
  }