import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
  withCredentials: true,
});

export const storeConfigApi = {
  /** 운영환경 조회 */
  getConfig: (storeId) => api.get(`/settings/store/${storeId}`).then((r) => r.data),

  /** 운영환경 수정 */
  updateConfig: (storeId, dto) => api.put(`/settings/store/${storeId}`, dto).then((r) => r.data),
};
