import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

// 👇 new client for webhook
export const webhookApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_WEBHOOK_API_URL,
});
