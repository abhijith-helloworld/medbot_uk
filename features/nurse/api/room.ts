import api from "@/lib/api/apiClient";
export interface Room {
  id: number;
  room_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by: number | null;
}
export interface ApiResponse<T> {
    status: string;
    message: string;
    data: T;
}
export const createRooms = async (count: number): Promise<ApiResponse<Room[]>> => {
  const { data } = await api.post(`bed/data/room/create/`, { count });
  return data;
};

export const getAllRooms = async (): Promise<ApiResponse<Room[]>> => {
  const { data } = await api.get(`bed/data/room/all/`);
  return data;
};