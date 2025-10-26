// ============================================================================
// 📁 src/features/GR/api/grApi.js
// ============================================================================

import ApiClient from "/src/common/authorities/api/ApiClient"; // ✅ 공통 ApiClient 사용

const BASE_URL = "/gr"; // ✅ ApiClient가 이미 baseURL=http://localhost:8080/api 임

/** ✅ 1. 입고 등록 */
export const createGoodsReceipt = async (receiptData) => {
  return ApiClient.post(`${BASE_URL}`, receiptData); // GoodsReceiptHeaderDTO 반환
};

/** ✅ 2. 입고 단건 조회 */
export const getGoodsReceiptById = async (id) => {
  return ApiClient.get(`${BASE_URL}/${id}`); // GoodsReceiptHeaderDTO
};

/** ✅ 3. 입고 확정 */
export const confirmGoodsReceipt = async (id) => {
  return ApiClient.post(`${BASE_URL}/${id}/confirm`);
};

/** ✅ 4. 입고 확정 취소 (reason 선택적) */
export const cancelGoodsReceipt = async (id, reason = "no reason") => {
  return ApiClient.post(`${BASE_URL}/${id}/cancel`, null, {
    params: { reason },
  });
};

/** ✅ 5. 입고 목록 조회 */
export const fetchGoodsReceipts = async () => {
  return ApiClient.get(`${BASE_URL}`); // List<GoodsReceiptHeaderDTO> 예상
};

/** ✅ 6. 바코드 검색 (발주 조회) */
export const searchPOByBarcode = async (barcode) => {
  return ApiClient.get(`${BASE_URL}/po-search`, { params: { barcode } });
};

/** ✅ 7. 바코드 기반 입고 생성 + 확정 */
export const createAndConfirmGR = async (poId) => {
  return ApiClient.post(`${BASE_URL}/scan-confirm`, { poId });
};
