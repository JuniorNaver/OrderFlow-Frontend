import ApiClient from "../../../common/authorities/api/ApiClient";

/**
 * ✅ 영수증 번호로 환불 대상 조회
 */
export const fetchRefundItems = (receiptNo) =>
  ApiClient.get(`/refunds/receipt/${receiptNo}`);

/**
 * ✅ 환불 요청
 */
export const requestRefund = (data) =>
  ApiClient.post(`/refunds/process`, data);

/**
 * ✅ 결제정보 검증 (카드번호 / 간편결제)
 */
export const verifyRefundInfo = (data) =>
  ApiClient.post(`/refunds/verify`, data);

/**
 * ✅ 간편결제 PG 검증 함수
 */
export const verifyEasyPayRefund = (impUid) =>
  ApiClient.get(`/refunds/verify/${impUid}`);