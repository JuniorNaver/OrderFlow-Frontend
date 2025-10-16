import axios from "axios";

const API_BASE = "http://localhost:8080/api/refunds";

// ✅ 영수증 번호로 환불 대상 조회
export const fetchRefundItems = async (receiptNo) => {
  const res = await axios.get(`${API_BASE}/receipt/${receiptNo}`);
  return res.data;
};

// ✅ 환불 요청
export const requestRefund = async (data) => {
  const res = await axios.post(`${API_BASE}/process`, data);
  return res.data;
};

// ✅ 결제정보 검증 (카드번호 / 간편결제)
export const verifyRefundInfo = async (data) => {
  const res = await axios.post(`${API_BASE}/verify`, data);
  return res.data;
};