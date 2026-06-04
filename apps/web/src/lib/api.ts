import axios from "axios";
import { useAuthStore } from "../store/auth.store";

type ApiErrorDetail = {
  field?: string;
  message?: string;
};

type ApiErrorPayload = {
  message?: string;
  details?: ApiErrorDetail[] | unknown;
};

const apiUrl = import.meta.env.VITE_API_URL;

if (!apiUrl) {
  throw new Error("VITE_API_URL is required");
}

export const api = axios.create({
  baseURL: apiUrl,
  timeout: 15_000
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) useAuthStore.getState().logout();
    return Promise.reject(error);
  }
);

export const unwrap = <T>(response: { data: { data: T } }) => response.data.data;

const getApiErrorPayload = (error: unknown) => {
  if (!axios.isAxiosError<ApiErrorPayload>(error)) return undefined;
  return error.response?.data;
};

export const getApiErrorDetails = (error: unknown) => {
  const details = getApiErrorPayload(error)?.details;
  if (!Array.isArray(details)) return [];
  return details
    .filter((detail): detail is ApiErrorDetail => typeof detail === "object" && detail !== null)
    .map((detail) => ({
      field: detail.field,
      message: detail.message
    }))
    .filter((detail) => detail.message);
};

export const getApiErrorMessage = (error: unknown, fallback = "Request failed") => {
  const payload = getApiErrorPayload(error);
  if (payload?.message) return payload.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};
