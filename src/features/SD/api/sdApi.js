// ============================================================================
// 📁 /src/features/SD/api/sdApi.js
// ============================================================================
import ApiClient from "../../../common/authorities/api/ApiClient";

const SD_BASE = "/sd";

// ✅ 주문 생성
export const createOrder = async (storeId) => {
  const id = storeId || localStorage.getItem("storeId") || "S001";
  const res = await ApiClient.post(`${SD_BASE}/create`, null, {
    params: { storeId: id },
  });
  return res; // ✅ 이미 data-only
};

// ✅ 주문 단건 조회
export const getOrderById = async (orderId) => {
  const res = await ApiClient.get(`${SD_BASE}/${orderId}`);
  return res; // ✅
};

// ✅ 상품 추가
export const addItemToOrder = async (orderId, product) => {
  const payload = {
    gtin: product.gtin,
    quantity: 1,
    unitPrice: product.price,
  };
  const res = await ApiClient.post(`${SD_BASE}/${orderId}/add-item`, payload);
  return res; // ✅
};

// ✅ 수량 수정
export const updateItemQuantity = async (itemId, quantity) => {
  const res = await ApiClient.patch(`${SD_BASE}/items/${itemId}/quantity`, { quantity });
  return res; // ✅
};

// ✅ 주문 확정(결제 완료)
export const completeOrder = async (orderId) => {
  const res = await ApiClient.post(`${SD_BASE}/${orderId}/complete`);
  return res; // ✅
};

// ✅ 상품 삭제
export const deleteItemFromOrder = async (orderId, itemId) => {
  const res = await ApiClient.delete(`${SD_BASE}/${orderId}/delete-item/${itemId}`);
  return res; // ✅
};