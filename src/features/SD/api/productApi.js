// ============================================================================
// 📁 src/features/STK/api/stockApi.js
// ============================================================================
import ApiClient from "../../../common/authorities/api/ApiClient";

const STK_BASE = "/stk";

// ✅ 재고 기준 상품 검색 (이름으로 검색)
export const searchProductsByName = async (query) => {
  if (!query || query.trim() === "") return [];
  try {
    const res = await ApiClient.get(`${STK_BASE}/search`, {
      params: { name: query },
    });
    return res; // ApiClient는 response.data를 자동 반환함
  } catch (err) {
    console.error("❌ 상품 검색 중 오류:", err);
    return [];
  }
};

// ✅ 바코드로 상품 조회
export const getProductByBarcode = async (barcode) => {
  try {
    const res = await ApiClient.get(`${STK_BASE}/barcode/${barcode}`);
    return res; // StockResponse 객체
  } catch (err) {
    console.error("❌ 바코드 검색 중 오류:", err);
    return null;
  }
};
