// 📁 src/features/SD/api/receiptApi.js
import ApiClient from "../../../common/authorities/api/ApiClient";

// ✅ named export
export const getReceiptsByDate = (date) => 
  ApiClient.get(`/receipts/date/${date}`);

export const reissueReceipt = (receiptNo) => 
  ApiClient.get(`/receipts/${receiptNo}/reissue`);