import api from "@/lib/api/apiClient";

export interface Apparatus {
  id: number;
  patient: number;
  patient_name: string;
  sys: string;
  dia: string | null;
  map: string;
  pulse_rate_note: string;
  image_file: string;
  image_url: string;
  is_active: boolean;
  data_time: string;
  created_at: string;
  created_by: number;
  created_by_username: string;
  updated_at: string;
  updated_by: number | null;
}

export interface ApparatusResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    status: string;
    message: string;
    data: Apparatus[];
  };
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export const fetchApparatus = async (page = 1, pageSize = 9): Promise<ApparatusResponse> => {
  const { data } = await api.get(`vitals_management/bp2checkme/all/?page=${page}&page_size=${pageSize}`);
  return data;
};

// Toggle active/inactive
export const toggleApparatusStatus = async (id: number): Promise<ApiResponse<Apparatus>> => {
  const { data } = await api.patch(`vitals_management/bp2checkme/toggle-active/`, { pk: id });
  return data;
};

// Update apparatus fields (sys, dia, etc.)
export const editApparatusValues = async (
  id: number,
  updates: Partial<Apparatus>
): Promise<ApiResponse<Apparatus>> => {
  const { data } = await api.post(`vitals_management/bp2checkme/upsert/`, {
    id,
    ...updates,
  });
  return data;
};