import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
  withCredentials: true, // JWT 쿠키 전송 등 필요한 경우
});

// ✅ 관리자용 API
export const adminStoreApi = {
  getAllStores: () => api.get("/admin/stores"),
  createStore: (storeData) => api.post("/admin/stores", storeData),
  deactivateStore: (storeId) => api.delete(`/admin/stores/${storeId}`),
};

// ✅ 사용자용 API
export const userStoreApi = {
  getStoreById: (storeId) => api.get(`/stores/${storeId}`),
  updateStore: (storeId, data) => api.put(`/stores/${storeId}`, data),
};
