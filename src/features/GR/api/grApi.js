import axios from "axios";

const BASE_URL = "/api/gr";

/** ✅ 1. 입고 등록 */
export const createGoodsReceipt = async (receiptData) => {
  const res = await axios.post(`${BASE_URL}`, receiptData);
  return res.data; // GoodsReceiptHeaderDTO 반환
};

/** ✅ 2. 입고 단건 조회 */
export const getGoodsReceiptById = async (id) => {
  const res = await axios.get(`${BASE_URL}/${id}`);
  return res.data; // GoodsReceiptHeaderDTO
};

/** ✅ 3. 입고 확정 */
export const confirmGoodsReceipt = async (id) => {
  await axios.post(`${BASE_URL}/${id}/confirm`);
};

/** ✅ 4. 입고 확정 취소 (reason 선택적) */
export const cancelGoodsReceipt = async (id, reason) => {
  const res = await axios.post(`${BASE_URL}/${id}/cancel`, null, {
    params: { reason: reason || "no reason" },
  });
  return res.data;
};

/** ✅ 5. 입고 목록 조회 */
export const fetchGoodsReceipts = async () => {
  const res = await axios.get(`${BASE_URL}`);
  return res.data; // List<GoodsReceiptHeaderDTO> 예상
};

//바코드 검색
export const searchPOByBarcode = async (barcode) => {
  const res = await axios.get(`/api/po/search`, { params: { barcode } });
  return res.data;
};

/** ✅ 6. 바코드 기반 입고 확정 (PO에서 자동 생성 및 확정) */
export const createAndConfirmGR = async (poId) => {
  const res = await axios.post(`${BASE_URL}/scan-confirm`, { poId });
  return res.data;
};
