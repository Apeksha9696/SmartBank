import axios from "axios";

// Separate instance (own token key) so a banker session and a customer
// session can't clobber each other if both are open in the same browser.
const bankerApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

bankerApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("smartbank_banker_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default bankerApi;
