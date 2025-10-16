import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
  withCredentials: true,
});

export const storeAdminApi = {
  /** 지점 등록 (init) */
  createStore: (data) => api.post("/master/store/init", data).then((r) => r.data),

  /** 전체 조회 */
  getAllStores: () => api.get("/master/store").then((r) => r.data),

  /** 단일 조회 */
  getStoreById: (storeId) => api.get(`/master/store/${storeId}`).then((r) => r.data),

  /** 삭제 */
  deleteStore: (storeId) => api.delete(`/master/store/${storeId}`).then((r) => r.data),
};
