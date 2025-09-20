import { refreshTokenAndRetry } from "@/lib/refreshHelper";
import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_BACKEND_URL;

export const apiClient = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Prevent infinite loop
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshed = await refreshTokenAndRetry();
      if (refreshed) {
        return apiClient(originalRequest); // Retry original request
      }
    }

    return Promise.reject(error);
  }
);

export const authClient = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});

export const uploadClient = axios.create({
  baseURL: `${baseURL}`,
  headers: {
    "Content-Type": "multipart/form-data",
  },
  withCredentials: true,
});
