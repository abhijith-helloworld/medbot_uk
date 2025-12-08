import api from "@/lib/api/apiClient";

export interface Scheduler {
  id: number;
  batch_name: string;
  time_slot: string;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
  trigger_time: string;
  is_stopped: boolean;
  is_notified: boolean;
  completed_time: string | null;
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by: number;
}

// A type for the data payload sent to the API
export type SchedulerPayload = {
  pk?: number; // Primary key for updates
  batch_name?: string;
  time_slot?: string;
  trigger_time?: string;
  monday?: boolean;
  tuesday?: boolean;
  wednesday?: boolean;
  thursday?: boolean;
  friday?: boolean;
  saturday?: boolean;
  sunday?: boolean;
  is_stopped?: boolean;
};

export const fetchSchedulers = async (): Promise<Scheduler[]> => {
  const { data } = await api.get("schedule/view-all-batch-schedule/");
  return data.data;
};

export const fetchSchedulersActive = async (): Promise<Scheduler[]> => {
  const { data } = await api.get("schedule/view-all-active-batch-schedule/");
  return data.data;
};

// New function to handle both creating and updating schedulers
export const addOrUpdateScheduler = async (payload: SchedulerPayload) => {
  // Your API expects 'form-data', so we build it dynamically
  const formData = new FormData();
  // Append each key-value pair from the payload to the form data
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });
  const { data } = await api.post(
    "schedule/add-batch-schedule/",
    formData
  );
  return data;
};

export const uploadSchedulersExcel = async (file: Blob) => {
  const formData = new FormData();
  formData.append("file", file, "patients_data.xlsx");
  const { data } = await api.post("schedule/import_batch_schedules_excel/", formData);
  return data;
};

// Download Excel file from backend
export const downloadSchedulersExcel = async (): Promise<Blob> => {
  const response = await api.get("schedule/export_batch_schedules_excel/", {
    responseType: "blob",
  });
  return response.data;
};

export const swapPatientScheduler = async (payload: {
  pk1: number;
  pk2: number;
}) => {
  const { data } = await api.post("schedule/swap/scheduled/slots/", payload);
  return data;
};


// Define the payload type for swapping rooms
export type SwapRoomOrderPayload = {
  room_pos_a: number;
  room_pos_b: number;
  batch_id: number;
};

// Swap rooms API (CORRECTED to include batch_id and send as FormData)
export const swapRoomOrder = async (payload: SwapRoomOrderPayload) => {
  const formData = new FormData();
  formData.append("room_pos_a", String(payload.room_pos_a));
  formData.append("room_pos_b", String(payload.room_pos_b));
  formData.append("batch_id", String(payload.batch_id));

  const { data } = await api.post(
    "schedule/swap-room-order-scheduled-slot/",
    formData // Send as FormData
  );
  return data;
};