import axios from "axios";

// ✅ 재고 기준 상품 검색
export const searchProductsByName = async (query) => {
  if (!query || query.trim() === "") return [];
  try {
    const res = await axios.get(`/api/stk/search`, {
      params: { name: query },
    });
    return res.data; // [{gtin, productName, price, quantity}]
  } catch (err) {
    console.error("상품 검색 중 오류:", err);
    return [];
  }
};