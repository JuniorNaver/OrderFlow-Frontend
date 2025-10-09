import axios from "axios";
const API_BASE = "http://localhost:8080/api";

export const getEligibleRefundItems = async ({ receiptId, paymentId }) => {
  const params = {};
  if (receiptId) params.receiptId = receiptId;
  if (paymentId) params.paymentId = paymentId;
  const { data } = await axios.get(`${API_BASE}/refunds/eligibles`, { params });
  return data; // { paymentId, items: [{paymentItemId, productName, unitPrice, paidQty, refundedQty, refundableQty, method, transactionNo}], currency, paidAt }
};

export const previewRefund = async (payload) => {
  // { paymentId, reason, items: [{ paymentItemId, refundQty }] }
  const { data } = await axios.post(`${API_BASE}/refunds/preview`, payload);
  return data; // { refundTotal, fee, finalRefund, items:[{...}] }
};

export const createRefund = async (payload) => {
  const { data } = await axios.post(`${API_BASE}/refunds`, payload);
  return data; // { refundId, status, approvedAt, finalRefund }
};