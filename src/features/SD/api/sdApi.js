import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api/sd",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 주문 생성
export const createOrder = async () => {
  const res = await api.post("/create");
  return res.data;
};

// 상품 추가
export const addItemToOrder = async (orderId, itemData) => {
  const res = await api.post(`/${orderId}/add-item`, itemData);
  return res.data;
};

// 결제 완료
export const completeOrder = async (orderId) => {
  await api.post(`/${orderId}/complete`);
};