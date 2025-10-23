// ============================================================================
// 📁 /src/features/SD/api/sdApi.js
// ============================================================================

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api/sd",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  console.log("📡 JWT 토큰 확인:", token);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 주문 생성
export const createOrder = async () => {
  const storeId = localStorage.getItem("storeId") || "S001"; // 기본값 S001
  const res = await api.post(`/create?storeId=${storeId}`);
  return res.data;
};


// 상품 추가
export const addItemToOrder = async (orderId, product) => {
  const payload = {
    gtin: product.gtin,
    quantity: 1,
    price: product.price,
  };

   const res = await api.post(`/${orderId}/add-item`, payload);
  return res.data; // SalesItemDTO 반환됨
};

export const updateItemQuantity = async (itemId, quantity) => {
  const res = await api.patch(`/items/${itemId}/quantity`, { quantity });
  return res.data;
};

// 결제 완료
export const completeOrder = async (orderId) => {
  await api.post(`/${orderId}/complete`);
};

// 삭제 완료
export const deleteItemFromOrder = async (orderId, itemId) => {
  const res = await api.delete(`/${orderId}/delete-item/${itemId}`);
  return res.data; // SalesHeaderDTO 반환됨
};