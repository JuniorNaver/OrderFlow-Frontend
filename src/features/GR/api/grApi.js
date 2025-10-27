// ============================================================================
// 📁 src/features/GR/api/grApi.js
// ============================================================================

import ApiClient from "/src/common/authorities/api/ApiClient"; // ✅ 공통 ApiClient 사용

// ✅ ApiClient가 이미 baseURL=http://localhost:8080/api 임
const BASE_URL = "/gr";

/**
 * ✅ 1. 입고 등록
 * - 신규 입고 데이터를 등록 (초기 상태: PENDING)
 * - 백엔드: POST /api/gr
 */
export const createGoodsReceipt = async (receiptData) => {
  return ApiClient.post(`${BASE_URL}`, receiptData); // GoodsReceiptHeaderDTO 반환
};

/**
 * ✅ 2. 입고 단건 조회
 * - 특정 입고내역 상세 조회
 * - 백엔드: GET /api/gr/{id}
 */
export const getGoodsReceiptById = async (id) => {
  return ApiClient.get(`${BASE_URL}/${id}`); // GoodsReceiptHeaderDTO
};

/**
 * ✅ 3. 입고 확정
 * - GR이 이미 존재할 때 상태를 RECEIVED로 변경
 * - 백엔드: POST /api/gr/{grId}/confirm
 */
export const confirmGoodsReceipt = async (grId) => {
  return ApiClient.post(`${BASE_URL}/${grId}/confirm`);
};

/**
 * ✅ 4. 입고 확정 취소
 * - 상태를 CANCELED로 변경 (reason은 선택적)
 * - 백엔드: PUT /api/gr/{grId}/cancel?reason=...
 */
export const cancelGoodsReceipt = async (poId, reason = "no reason") => {
  return ApiClient.put(`${BASE_URL}/${poId}/cancel`, null, {
    params: { reason },
  });
};

/**
 * ✅ 5. 입고 목록 조회
 * - 전체 입고 목록 또는 검색조건 조회
 * - 백엔드: GET /api/gr
 */
export const fetchGoodsReceipts = async () => {
  return ApiClient.get(`${BASE_URL}`); // List<GoodsReceiptHeaderDTO> 예상
};

/**
 * ✅ 6. 바코드 기반 발주 검색
 * - 바코드로 관련 발주 조회 후 입고 등록에 활용
 * - 백엔드: GET /api/gr/po-search?barcode=...
 */
export const searchPOByBarcode = async (barcode) => {
  return ApiClient.get(`${BASE_URL}/po-search`, { params: { barcode } });
};

/**
 * ✅ 7. 바코드 기반 입고 생성 + 확정
 * - GR이 없는 발주를 스캔했을 때 자동 생성 및 확정 처리
 * - 백엔드: POST /api/gr/scan-confirm { poId }
 */
export const createAndConfirmGR = async (poId) => {
  return ApiClient.post(`${BASE_URL}/scan-confirm`, { poId });
};

export const searchGoodsReceipts = async (query, startDate, endDate) => {
  const params = new URLSearchParams();
  if (query) params.append("query", query);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  return ApiClient.get(`${BASE_URL}/search?${params.toString()}`);
};

