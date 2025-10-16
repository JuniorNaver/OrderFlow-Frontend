import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api/po"
});
export default api;

//장바구니 POHeader 생성 
export const createPOHeader = async () => {
  const res = await api.post(`/api/po`);
  return res.data.poId; 
};

//장바구니 출력 (장바구니로 가기 버튼 눌렀을 때)
export const getCartItems = async (poId, status) => {
  const res = await api.get(`/items?poId=${poId}&status=${status}`);
  return res.data;
};

//수량변경
export const updateQuantity = async (itemNo, orderQty) => {
  const res = await api.put(`/update/${itemNo}`, { orderQty });
  return res.data;
};

//상품삭제
export const deleteCartItems = async (itemIds) => {
  // axios는 'params'에 배열을 전달하면 자동으로 'itemIds=1&itemIds=2...' 형태로 직렬화하여 전송합니다.
  const res = await api.delete("/delete", { params: { itemIds: itemIds } });  
  return res.data;
};

//장바구니 저장
export const saveCart = async (poId) => {
  const res = await api.post(`/${poId}/save`); // ✅ api 사용
  return res.data;
};

//저장된 장바구니 목록 불러오기 (Status = S)
export const getSavedCartList = async () => {
  const res = await api.get(`/saved`); // ✅ /api/po/saved 로 요청
  return res.data;
};

//특정 장바구니(헤더 ID)의 아이템 불러오기
export const getSavedCartItems = async (poId) => {
  try {
    const res = await api.get(`/${poId}/savedCart`);
    return res.data;
  } catch (error) {
    console.error("저장된 장바구니 아이템 불러오기 API 오류:", error);
    throw error;
  }
};

//발주확정
export const confirmOrder = async (poId) => {
  const res = await api.post(`/confirm/${poId}`);
  return res.data;
};


