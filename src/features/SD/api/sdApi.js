import axios from "axios";

const API_BASE = "http://localhost:8080/api/sd";

// ✅ 공통 axios 인스턴스 (JWT 자동 포함)
const api = axios.create({
  baseURL: API_BASE,
});

// ✅ 요청 인터셉터 (JWT 자동 추가)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ 주문 생성
export const createOrder = async () => {
  const res = await api.post("/create"); // ✅ 여기 중요
  return res.data;
};

// ✅ 상품 추가 API (백엔드 연결)
export const addItemToOrder = async (orderId, itemData) => {
  const res = await api.post(`/${orderId}/add-item`, itemData);
  return res.data;
};

// ✅ 주문 완료(결제 완료)
export const completeOrder = async (orderId) => {
  await api.post(`/${orderId}/complete`); // ✅ api로 변경
};

// ✅ 보류 처리
export const holdOrder = async (orderId) => {
  await api.post(`/${orderId}/hold`);
};

// ✅ 보류 목록 조회
export const getHoldOrders = async () => {
  const res = await api.get("/hold");
  return res.data;
};

// ✅ 보류 재개
export const resumeOrder = async (orderId) => {
  const res = await api.post(`/${orderId}/resume`);
  return res.data;
};

// ✅ 보류 취소
export const cancelOrder = async (orderId) => {
  await api.delete(`/${orderId}/cancel`);
};