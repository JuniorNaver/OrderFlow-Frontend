import ApiClient from "../../../common/authorities/api/ApiClient";

const PAYMENT_BASE = "/payments";

// ✅ named export로 변경
export const createPayment = (data) => ApiClient.post(`${PAYMENT_BASE}`, data);

// ✅ 다른 결제 관련 함수도 추가 가능
export const cancelPayment = (itemId) =>
  ApiClient.post(`${PAYMENT_BASE}/${itemId}/cancel`);

export const getPaymentById = (id) => ApiClient.get(`${PAYMENT_BASE}/${id}`);