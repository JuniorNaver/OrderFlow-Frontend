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

// ✅ 주문 생성
export const createOrder = async () => {
  const res = await api.post("/create");
  return res.data;
};

// ✅ 상품 추가
export const addItemToOrder = async (orderId, itemData) => {
  const res = await api.post(`/${orderId}/add-item`, itemData);
  return res.data;
};

// ✅ 주문 완료
export const completeOrder = async (orderId) => {
  await api.post(`/${orderId}/complete`);
};

// ✅ 보류 저장 (FIFO 차감은 서버에서 처리)
export const holdOrder = async (orderId) => {
  try {
    console.log("🟢 온라인 모드: 서버에 보류 저장");
    const res = await api.post(`/${orderId}/hold`);
    return { ok: true, mode: "online", data: res.data };
  } catch (e) {
    throw new Error(`보류 저장 실패: ${e.message}`);
  }
};

// ✅ 보류 목록 조회
export const getHoldOrders = async () => {
  try {
    const res = await api.get("/holds");
    return res.data;
  } catch (e) {
    console.warn("서버 보류 목록 조회 실패 → 로컬 fallback");
    return JSON.parse(localStorage.getItem("holds") || "[]");
  }
};

// ✅ 보류 재개
export const resumeOrder = async (orderId) => {
  try {
    const res = await api.post(`/${orderId}/resume`);
    return res.data; // { orderId, orderNo, salesItems: [...] }
  } catch (e) {
    const holds = JSON.parse(localStorage.getItem("holds") || "[]");
    const found = holds.find((h) => h.orderId === orderId);
    if (!found) throw new Error("로컬 보류 데이터가 없습니다.");
    return { orderId, orderNo: `LOCAL-${orderId}`, salesItems: found.items };
  }
};

// ✅ 보류 취소
export const cancelOrder = async (orderId) => {
  await api.post(`/${orderId}/cancel`);
};

// =======================
// 💾 오프라인 (localStorage 저장)
// =======================

export const saveHoldOffline = (holdData) => {
  const holds = JSON.parse(localStorage.getItem("holds") || "[]");
  const newHold = {
    id: Date.now(),
    orderId: holdData?.orderId || Date.now(),
    createdAt: new Date().toISOString(),
    items: Array.isArray(holdData?.items) ? holdData.items : holdData,
  };
  holds.push(newHold);
  localStorage.setItem("holds", JSON.stringify(holds));
  console.log("📦 오프라인 보류 저장 완료:", newHold);
  return newHold;
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
    try {
      const result = await holdOrder(orderId);
      return { ok: true, mode: "online", result };
    } catch (err) {
      console.warn("🟡 서버 오류 → 오프라인 모드로 저장");
      const offlineResult = saveHoldOffline({ orderId, items });
      return { ok: true, mode: "offline", result: offlineResult };
    }
  } else {
    console.log("🔴 오프라인 모드: 로컬에 임시 저장");
    const offlineResult = saveHoldOffline({ orderId, items });
    return { ok: true, mode: "offline", result: offlineResult };
  }
};

/**
 * ✅ 보류 목록 가져오기
 */
export const getHolds = async () => {
  if (isOnline()) {
    try {
      const list = await getHoldOrders();
      return list;
    } catch (err) {
      console.warn("서버 실패 → 로컬 fallback");
      return getHoldsOffline();
    }
  } else {
    return getHoldsOffline();
  }
};

/**
 * ✅ 보류 주문 재개
 */
export const resumeHold = async (orderId) => {
  if (isOnline()) {
    try {
      const result = await resumeOrder(orderId);
      return result;
    } catch (err) {
      console.warn("서버 실패 → 로컬 fallback");
      return getHoldByIdOffline(orderId);
    }
  } else {
    return getHoldByIdOffline(orderId);
  }
};
