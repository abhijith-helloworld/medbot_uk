import api, { webhookApi } from "@/lib/api/apiClient";

export interface Room {
  id: number;
  room_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by: number | null;
}

export interface Bed {
  id: number;
  bed_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by: number | null;
}

export interface Slot {
  id: number;
  is_active: boolean;
  room_name: Room | null; 
  bed_name: Bed;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string | null;
  x: number;
  y: number;
  yaw: number;
}

// Response type for paginated or wrapped data
export interface ApiResponse<T> {
    status: string;
    message: string;
    data: T;
}
// Interface for the creation payload
interface CreateSlotPayload {
  room_name_id: number;
  bed_name_id: number;
}

// Corrected API paths
export const createSlot = async (payload: CreateSlotPayload): Promise<ApiResponse<number>> => {
  const { data } = await api.post(`bed/data/slot/create/`, payload);
  return data;
};


export const getAllSlots = async (): Promise<ApiResponse<Slot[]> & { count: number }> => {
  const { data } = await api.get(`bed/data/slot/not_booked/`);
  return data;
};


export const toggleSlotStatus = async (id: number): Promise<ApiResponse<null>> => {
  const { data } = await api.delete(`bed/data/slot/deactivate/${id}/`);
  return data;
};

export const triggerSlotPosition = async (slotId: number) => {
  const { data } = await webhookApi.post(`/webhook/trigger-slot-position/`, {
    slot_id: slotId,
  });
  return data;
};
