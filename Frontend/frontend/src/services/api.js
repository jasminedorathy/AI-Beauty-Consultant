import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE,
});

// SIGNUP → JSON (this is fine)
export const signup = (data) => {
  return api.post("/auth/signup", data);
};

// ✅ LOGIN → FORM DATA (THIS FIXES 422)
// export const login = async ({ username, password }) => {
//   const formData = new URLSearchParams();
//   formData.append("email", username);  // ← Changed to "email"
//   formData.append("password", password);

//   return axios.post(`${API_BASE}/auth/login`, formData, {
//     headers: {
//       "Content-Type": "application/x-www-form-urlencoded",
//     },
//   });
// };
export const login = (data) => {
  return api.post("/auth/login", data);
};

// ANALYZE
export const analyzeImage = async (imageFile, token) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  const res = await api.post("/analyze", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};



// HISTORY
export const fetchHistory = (token) => {
  return api.get("/history", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
