import axios from "axios";
const API_BASE = "http://localhost:8080/api/receipts";

// 날짜별 조회
export const getReceiptsByDate = async (date) => {
  const res = await axios.get(`${API_BASE}/date/${date}`);
  return res.data;
};

// 영수증 재발행
export const reissueReceipt = async (receiptNo) => {
  const res = await axios.get(`${API_BASE}/${receiptNo}/reissue`);
  return res.data;
};