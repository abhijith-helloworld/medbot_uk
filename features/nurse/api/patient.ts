// src/features/patient/api/patient.ts

import api from "@/lib/api/apiClient";

export interface Patient {
  id: number;
  patient_id: string;
  name: string;
  gender: "male" | "female" | "transgender";
  age: number;
  is_active: boolean;
  slot_assigned: {
    room_name: string;
    bed_name: string;
  } | null;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  updated_by: number | null;
}

export interface PatientsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    data: Patient[];
  };
}

export interface Batch {
  id: number;
  batch_name: string;
  time_slot: string;
  trigger_time: string;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

export interface Slot {
  id: number;
  patient: Patient;
  batch: Batch;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  row_number: number;
  schedule_order: number; 
  bed_name: string;
}
export interface SlotGroup {
  row_number: number;
  slots: Slot[];
}

export interface SlotsResponse {
  status: "success" | "error";
  message: string;
  data: SlotGroup[];
}

export interface CheckBatchResponse {
  status: "success" | "warning" | "error";
  message: string;
  data?: {
    current_batch: number;
    requested_batch: number;
    patient_id: number;
  };
}



export async function fetchPatients(page = 1, pageSize = 5): Promise<PatientsResponse> {
  const { data } = await api.get(`/main/view-all-patient/?page=${page}&page_size=${pageSize}`);
  return data;
}

export interface CreatePatientDto {
  name: string;
  gender: "male" | "female" | "transgender";
  age: number;
  patient_id: string;
  id?: number;
}
export async function createPatient(payload: CreatePatientDto) {
  const { data } = await api.post("/main/create-patient/", payload);
  return data;
}

export async function deletePatient(id: number) {
  const { data } = await api.delete(`/main/deactivate-patient/${id}/`);
  return data;
}


export async function fetchSlots(): Promise<SlotGroup[]> {
  const { data } = await api.get<SlotsResponse>("schedule/view-all-scheduled-slots/");
  return data.data;
}

export async function fetchActivePatients(): Promise<PatientsResponse> {
  const { data } = await api.get(`/schedule/view-active-slot-patient/`);
  return data;
}

export const assignSlotToPatient = async (patientId: number, slotId: number) => {
  const { data } = await api.post("/main/assign-bed-room/", {
    slot_assigned: slotId,
    patient_id: patientId,
  });
  return data;
};

export const assignPatientToBatch = async (patientId: number, batchId: number) => {
  const formData = new FormData();
  formData.append("patient", String(patientId));
  formData.append("batch", String(batchId));

  const { data } = await api.put("schedule/schedule-slots/", formData);
  return data;
};

export const checkPatientScheduled = async (patientId: number, batchId: number): Promise<CheckBatchResponse> => {
  const formData = new FormData();
  formData.append("patient", String(patientId));
  formData.append("batch", String(batchId));

  const { data } = await api.post("schedule/check-scheduled-slot/", formData);
  return data;
};


export async function deleteSlot(slotId: number) {
  const { data } = await api.delete(`/schedule/remove/scheduled-slot/`, {
    data: { slot_id: slotId },
  });
  return data;
}



export const uploadPatientsExcel = async (file: Blob) => {
  const formData = new FormData();
  formData.append("file", file, "patients_data.xlsx");
  const { data } = await api.post("main/import_patients_excel/", formData);
  return data;
};

export const downloadPatientsExcel = async (): Promise<Blob> => {
  const response = await api.get("main/export_patients_excel/", {
    responseType: "blob",
  });
  return response.data;
};