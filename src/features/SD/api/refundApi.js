import ApiClient from "../../../common/authorities/api/ApiClient";

/**
 * ✅ 영수증 번호로 환불 대상 조회
 */
export const fetchRefundItems = (receiptNo) =>
  ApiClient.get(`/refunds/receipt/${receiptNo}`);

/**
 * ✅ 환불 요청
 */
export const requestRefund = async (payload, onRefundComplete, onClose) => {
  try {
    const response = await ApiClient.post(`/refunds`, payload); // ✅ 경로 수정 완료
    console.log("💰 환불 완료 응답:", response.data);

    alert("✅ 환불 완료: " + response.refundStatus);

    // 콜백 실행 (선택적)
    onRefundComplete?.(response.data);
    onClose?.();
  } catch (e) {
    console.error("❌ 환불 실패:", e);

    const message =
      e.response?.data?.reason ||
      e.response?.data?.message ||
      "환불 처리 중 오류가 발생했습니다.";

    if (message.includes("이미 환불된")) {
      alert("⚠️ 이미 환불이 완료된 거래입니다.");
    } else if (message.includes("결제 내역이 존재하지 않습니다")) {
      alert("결제 내역을 찾을 수 없습니다.");
    } else {
      alert(message);
    }
  }
};

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
