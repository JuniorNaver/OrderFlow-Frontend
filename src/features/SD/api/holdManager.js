import axios from "axios";

// =======================
// ⚙️ 기본 설정
// =======================
const API_BASE = "http://localhost:8080/api/sd";

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 온라인 여부 판단
const isOnline = () => window.navigator.onLine;

// =======================
// 🧾 온라인 (Spring 서버 저장)
// =======================

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

// 주문 완료
export const completeOrder = async (orderId) => {
  await api.post(`/${orderId}/complete`);
};

// ✅ 보류 저장 (업데이트 포함)
export const holdOrder = async (orderId, items) => {
    
    const formattedItems = items.map((item) => ({
        productName: item.name || item.productName || "상품명 미등록",
        sdPrice: item.price || item.sdPrice || 0,
        salesQuantity: item.qty || item.salesQuantity || 1,
        stockQuantity: item.stock || item.stockQuantity || 0,
        subtotal:
        (item.price || item.sdPrice || 0) * (item.qty || item.salesQuantity || 1),
    }));

    console.log("📦 서버로 전송할 보류 데이터:", formattedItems);

    const res = await api.post(`/${orderId}/save`, formattedItems);
    if (!res.status || res.status >= 400) throw new Error("보류 저장 실패");
    };

// 보류 목록 조회
export const getHoldOrders = async () => {
  const res = await api.get("/hold");
  return res.data;
};

// 보류 재개
export const resumeOrder = async (orderId) => {
  const res = await api.post(`/${orderId}/resume`);
  return res.data;
};

// 보류 취소
export const cancelOrder = async (orderId) => {
  await api.delete(`/${orderId}/cancel`);
};

// =======================
// 💾 오프라인 (localStorage 저장)
// =======================

export const saveHoldOffline = (holdData) => {
  const holds = JSON.parse(localStorage.getItem("holds") || "[]");
  const newHold = {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    items: holdData,
  };
  holds.push(newHold);
  localStorage.setItem("holds", JSON.stringify(holds));
};

export const getHoldsOffline = () =>
  JSON.parse(localStorage.getItem("holds") || "[]");

export const deleteHoldOffline = (id) => {
  const holds = JSON.parse(localStorage.getItem("holds") || "[]");
  const updated = holds.filter((h) => h.id !== id);
  localStorage.setItem("holds", JSON.stringify(updated));
};

export const getHoldByIdOffline = (id) => {
  const holds = JSON.parse(localStorage.getItem("holds") || "[]");
  return holds.find((h) => h.id === id);
};

// =======================
// 🌐 통합 제어 함수 (실전용)
// =======================

/**
 * ✅ 보류 저장 (온라인/오프라인 자동 판단)
 */
export const saveHold = async (orderId, items) => {
  if (isOnline()) {
    console.log("🟢 온라인 모드: 서버에 보류 저장");
    await holdOrder(orderId, items);
  } else {
    console.log("🔴 오프라인 모드: 로컬에 임시 저장");
    saveHoldOffline(items);
  }
};

/**
 * ✅ 보류 목록 가져오기
 */
export const getHolds = async () => {
  if (isOnline()) {
    console.log("🟢 서버에서 보류 목록 조회");
    return await getHoldOrders();
  } else {
    console.log("🔴 오프라인 로컬 보류 목록 조회");
    return getHoldsOffline();
  }
};

/**
 * ✅ 보류 주문 재개
 */
export const resumeHold = async (orderId) => {
  if (isOnline()) {
    console.log("🟢 서버에서 보류 주문 재개");
    return await resumeOrder(orderId);
  } else {
    console.log("🔴 로컬에서 보류 주문 재개");
    return getHoldByIdOffline(orderId);
  }
};
