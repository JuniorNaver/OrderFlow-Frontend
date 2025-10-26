// ============================================================================
// 📁 /src/common/storeconfigs/api/warehouseApi.js
// ----------------------------------------------------------------------------
// 창고(Warehouse) 관련 API
// ============================================================================
import ApiClient from "../../authorities/api/ApiClient";


const BASE_URL = "/warehouse";

/**
 * 🔹 점포별 창고 목록 조회
 * @param {string} storeId - 점포 ID (예: "S001")
 * @returns {Promise<Array>} WarehouseResponseDTO[]
 */
export const getWarehousesByStore = async (storeId) => {
  if (!storeId) throw new Error("storeId is required");

  const res = await ApiClient.get(`${BASE_URL}/store/${storeId}`);
  return res ?? []; // ⚠️ undefined 방지
};

/**
 * 🔹 전체 창고 목록 조회 (ADMIN 전용)
 */
export const getAllWarehouses = async () => {
  const res = await ApiClient.get(BASE_URL);
  return res.data ?? [];
};

/**
 * 🔹 창고 생성
 */
export const createWarehouse = async (payload) => {
  const res = await ApiClient.post(BASE_URL, payload);
  return res.data;
};

/**
 * 🔹 창고 수정
 */
export const updateWarehouse = async (warehouseId, payload) => {
  const res = await ApiClient.put(`${BASE_URL}/${warehouseId}`, payload);
  return res.data;
};

/**
 * 🔹 창고 삭제
 */
export const deleteWarehouse = async (warehouseId) => {
  await ApiClient.delete(`${BASE_URL}/${warehouseId}`);
  return true;
};

export default {
  getWarehousesByStore,
  getAllWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
};
