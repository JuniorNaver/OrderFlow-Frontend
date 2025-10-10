import axios from "axios";

// 실제 배열을 반환하도록 수정
export const getProducts = async () => {
  const res = await axios.get("/api/products"); // 백엔드 엔드포인트
  // 백엔드가 { products: [...] } 형태로 반환하면 res.data.products로
  return Array.isArray(res.data) ? res.data : res.data.products;
};