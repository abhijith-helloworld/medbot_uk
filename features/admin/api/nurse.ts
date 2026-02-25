import api from "@/lib/api/apiClient";

export type Nurse = {
  id: number;
  username: string;
  name: string;
  email: string;
  role: "admin" | "nurse";
  gender: "male" | "female";
  is_active: boolean;
  created_at: string;
  phone?: string; // Added phone property to match component usage
};

export type CreateNursePayload = {
  username: string;
  password: string;
  name: string;
  email: string;
  role: "admin" | "nurse";
  gender: "male" | "female";
};

// Payload for updating a nurse. ID is required, password is optional.
export type UpdateNursePayload = Omit<CreateNursePayload, "password"> & {
  id: number;
  password?: string;
};

// CREATE nurse
export async function createNurse(payload: CreateNursePayload) {
  const { data } = await api.post("/main/create-admin/", payload);
  return data;
}

// EDIT nurse - uses the same endpoint as create but includes the user ID
export async function updateNurse(payload: UpdateNursePayload) {
  const { data } = await api.post(`/main/create-admin/`, payload);
  return data;
}

// GET all nurses
export async function fetchNurses() {
  const { data } = await api.get("/main/view-all-admin/nurse/");
  // The actual nurse data is nested in the 'data' property of the response
  return data.data as Nurse[];
}

// TOGGLE nurse activation status
export async function toggleNurseStatus(id: number) {
  // This endpoint toggles the is_active status
  const { data } = await api.delete(`/main/deactivate-admin/${id}/`);
  return data;
}