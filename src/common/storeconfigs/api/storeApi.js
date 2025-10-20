// src/api/storeApi.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
  withCredentials: true,
});

const storeApi = {
  /** ✅ 1️⃣ 지점 등록 (관리자 전용) */
  create: (data) => api.post("/store", data).then((r) => r.data),

  /** ✅ 2️⃣ 지점 전체 조회 */
  getAll: () => api.get("/store").then((r) => r.data),

  /** ✅ 3️⃣ 지점 단일 조회 */
  getById: (storeId) => api.get(`/store/${storeId}`).then((r) => r.data),

  /** ✅ 4️⃣ 지점 전체 수정 (관리자 전용) */
  update: (storeId, dto) => api.put(`/store/${storeId}`, dto).then((r) => r.data),

  /** ✅ 5️⃣ 지점 삭제 */
  delete: (storeId) => api.delete(`/store/${storeId}`).then((r) => r.data),

  /** ✅ 6️⃣ 점포 운영환경 조회 (관리자 or ENVIRONMENT_EDIT) */
  getEnv: (storeId) => api.get(`/store/${storeId}/env`).then((r) => r.data),

  /** ✅ 7️⃣ 점포 운영환경 수정 (관리자 or ENVIRONMENT_EDIT) */
  updateEnv: (storeId, dto) => api.put(`/store/${storeId}/env`, dto).then((r) => r.data),
};
export default storeApi;
