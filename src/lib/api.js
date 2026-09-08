import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "/api";

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("gharkhoj-owner-token");
  if (token && !config.headers.Authorization) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const adminRequestConfig = () => {
  const token = localStorage.getItem("gharkhoj-admin-token");
  return { headers: token ? { Authorization: `Bearer ${token}` } : {} };
};

export const getErrorMessage = (error, fallback = "Something went wrong") =>
  error?.response?.data?.message || error?.message || fallback;
