import axios from "axios";

const API_BASE = "http://localhost:8080/api/stk";

// ✅ 재고 기준 상품 검색
export const searchProductsByName = async (query) => {
  if (!query || query.trim() === "") return [];
  try {
    const res = await axios.get(`${API_BASE}/search`, {
      params: { name: query },
    });
    return res.data;
  } catch (err) {
    console.error("상품 검색 중 오류:", err);
    return [];
  }
};

export const getProductByBarcode = async (barcode) => {
  try {
    const res = await axios.get(`${API_BASE}/barcode/${barcode}`);
    return res.data; // { gtin, productName, price, quantity }
  } catch (err) {
    console.error("바코드 검색 중 오류:", err);
    return null;
  }
};