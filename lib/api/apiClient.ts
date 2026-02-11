// src/lib/api/apiClient.ts

import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true", // ✅ Skip ngrok interstitial page
  },
  timeout: 30000, // 30 seconds
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const storedAuth = localStorage.getItem("auth");
    if (storedAuth) {
      try {
        const { access_token } = JSON.parse(storedAuth);
        if (access_token) {
          config.headers.Authorization = `Bearer ${access_token}`;
        }
      } catch {
        localStorage.removeItem("auth");
      }
    }
  }
  return config;
});


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth");
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// 👇 Webhook client with ngrok header
export const webhookApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_WEBHOOK_API_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true", // ✅ Skip ngrok interstitial page
  },
  timeout: 30000,
});

// Optional: Add interceptors to webhook client if needed
webhookApi.interceptors.request.use((config) => {
  const storedAuth = localStorage.getItem("auth");
  if (storedAuth) {
    try {
      const { access_token } = JSON.parse(storedAuth);
      if (access_token) {
        config.headers.Authorization = `Bearer ${access_token}`;
      }
    } catch {
      localStorage.removeItem("auth");
    }
  }
  return config;
});