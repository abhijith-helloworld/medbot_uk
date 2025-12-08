// src/lib/api/auth.ts
import api from "./apiClient";

export type LoginPayload = {
  username: string;
  password: string;
};

export type LoginResponse = {
  status: string;
  message: string;
  data: {
    user_id: number;
    email: string;
    name: string;
    role: "admin" | "nurse";
    access_token: string;
    refresh_token: string;
    registered_date: string;
  };
};

export async function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/main/login/", payload);
  return data;
}
