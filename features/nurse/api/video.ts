// src/api/video.ts
import api from "@/lib/api/apiClient";

export interface ApiListResponse<T> {
  status: string;
  message: string;
  data: T[];
}

export interface ApiItemResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface Video {
  id: number;
  video_url: string | null;
  video_name: string;
  video_image_url: string | null;
  video_image_file: string | null; 
  is_image: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by: number | null;
}




export const getAllVideos = async (): Promise<ApiListResponse<Video>> => {
  const { data } = await api.get(`video_management/view-all-video/`);
  return data;
};


export const createVideo = async (
  payload: FormData
): Promise<ApiItemResponse<Video>> => {
  const { data } = await api.post(`video_management/add-video/`, payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};



export const swapVideos = async (
  pk1: number,
  pk2: number
): Promise<ApiItemResponse<{ video1: Video; video2: Video }>> => {
  const formData = new FormData();
  formData.append("pk1", String(pk1));
  formData.append("pk2", String(pk2));

  const { data } = await api.post(`video_management/swap-video/`, formData);
  return data;
};


export const softDelete = async ( pk: number ): Promise<ApiItemResponse<Video>> => {
  const { data } = await api.delete(`video_management/delete-video/`, {
    data: { pk }, 
  });
  return data;
};

