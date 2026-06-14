import axios from "axios";

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ No token interceptors — simple and clean
export default api;