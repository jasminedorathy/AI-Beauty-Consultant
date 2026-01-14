import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE,
});

// ✅ Add Interceptor to automatically add Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// SIGNUP
export const signup = (data) => {
  return api.post("/auth/signup", data);
};

// LOGIN
export const login = (data) => {
  return api.post("/auth/login", data);
};

// ANALYZE
// We don't need to pass token explicitly anymore
export const analyzeImage = async (formData) => {
  const res = await api.post("/analyze", formData);
  return res.data;
};

// HISTORY
export const getHistory = () => {
  return api.get("/history");
};

// CHAT
export const sendChat = async (message) => {
  const res = await api.post("/chat", { message });
  return res.data;
};

export default api;
