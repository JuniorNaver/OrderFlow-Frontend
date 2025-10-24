// ============================================================================
// 📁 /src/features/SD/api/sdApi.js
// ============================================================================
import ApiClient from "../../../common/authorities/api/ApiClient";

const SD_BASE = "/sd";

// 주문 생성
export const createOrder = async () => {
  const storeId = localStorage.getItem("storeId") || "S001"; // 기본값 S001
  const res = await ApiClient.post(`${SD_BASE}/create`, null, { params: { storeId } });
  return res;
};
//자동 주문 생성
export const getOrderById = async (orderId) => {
  const res = await ApiClient.get(`${SD_BASE}/${orderId}`);
  return res; // SalesHeaderDTO 반환
};

// 상품 추가
export const addItemToOrder = async (orderId, product) => {
  const payload = {
    gtin: product.gtin,
    quantity: 1,
    price: product.price,
  };

  const res = await ApiClient.post(`${SD_BASE}/${orderId}/add-item`, payload);
  return res; // SalesItemDTO 반환됨
};

export const updateItemQuantity = async (itemId, quantity) => {
  const res = await ApiClient.patch(`${SD_BASE}/items/${itemId}/quantity`, { quantity });
  return res;
};

// 결제 완료
export const completeOrder = async (orderId) => {
  await ApiClient.post(`${SD_BASE}/${orderId}/complete`);
};

// 삭제 완료
export const deleteItem = async (id) => {
  const res = await ApiClient.delete(`${SD_BASE}/items/${id}`);
  return res;
};

export const deleteItemFromOrder = async (orderId, itemId) => {
  const res = await ApiClient.delete(`/${orderId}/delete-item/${itemId}`);
  return res.data; // SalesHeaderDTO 반환됨
};
