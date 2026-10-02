import axios from "axios";

// Separate instance (own token key) so an admin session and a customer/
// banker session can't clobber each other if more than one is open in the
// same browser.
const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("smartbank_admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default adminApi;
