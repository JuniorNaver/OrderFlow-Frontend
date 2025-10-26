// ============================================================================
// 📁 src/common/storeconfigs/api/storeApi.js
// ============================================================================

// ✅ 공통 ApiClient (JWT 자동 포함)
import ApiClient from "../../authorities/api/ApiClient";

const storeApi = {
  /** ✅ 1️⃣ 지점 등록 (관리자 전용) */
  create: (data) => ApiClient.post("/store", data),

  /** ✅ 2️⃣ 지점 전체 조회 */
  getAll: () => ApiClient.get("/store"),

  /** ✅ 3️⃣ 지점 단일 조회 */
  getById: (storeId) => ApiClient.get(`/store/${storeId}`),

  /** ✅ 4️⃣ 지점 전체 수정 (관리자 전용) */
  update: (storeId, dto) => ApiClient.put(`/store/${storeId}`, dto),

  /** ✅ 5️⃣ 지점 삭제 */
  delete: (storeId) => ApiClient.delete(`/store/${storeId}`),

  /** ✅ 6️⃣ 점포 운영환경 조회 (관리자 or ENVIRONMENT_EDIT) */
  getEnv: (storeId) => ApiClient.get(`/store/${storeId}/env`),

  /** ✅ 7️⃣ 점포 운영환경 수정 (관리자 or ENVIRONMENT_EDIT) */
  updateEnv: (storeId, dto) => ApiClient.put(`/store/${storeId}/env`, dto),
};

export default storeApi;