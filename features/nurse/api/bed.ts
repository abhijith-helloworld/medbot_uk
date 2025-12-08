import api from "@/lib/api/apiClient";


export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface Bed {
  id: number;
  bed_name: string;
  is_active: boolean;
  is_booked: boolean; 
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by: number | null;
}

export const createBeds = async (count: number): Promise<ApiResponse<Bed[]>> => {
  const { data } = await api.post(`bed/data/bed/create/`, { count });
  return data;
};

export const getAllBeds = async (): Promise<ApiResponse<Bed[]>> => {
  const { data } = await api.get(`bed/data/bed/all/`);
  return data;
};

export const checkBookedBeds = async () => {
  const response = await getAllBeds();
  const beds = response.data;

  const bookedBeds = beds.filter((bed) => bed.is_booked);
  const freeBeds = beds.filter((bed) => !bed.is_booked);

  return { bookedBeds, freeBeds };
  };