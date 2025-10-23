// ============================================================================
// 📁 src/features/PO/api/poApi.js
// ============================================================================

// ✅ 공통 ApiClient (JWT 자동 포함)
import ApiClient from "/src/common/authorities/api/ApiClient";

// ✅ baseURL은 ApiClient 내부에서 이미 http://localhost:8080/api 로 설정되어 있음
//    따라서 별도 axios 인스턴스 생성 불필요

// ============================================================================
// 🧾 발주(PO) 관련 API
// ============================================================================
export const createPO = async (gtin, poItemRequestDTO, poId = null) => {
  try {
    // ✅ poId가 없으면 새로 생성
    const currentPoId = poId
      ? poId
      : (await ApiClient.post("/po")).poId;

    // ✅ 기존 또는 새 헤더에 상품 추가
    const itemRes = await ApiClient.post(`/po/${currentPoId}/items`, poItemRequestDTO, {
      params: { gtin },
    });

    // ✅ poId도 함께 반환해서 다음 호출 때 재사용 가능
    return { ...itemRes, poId: currentPoId };
  } catch (err) {
    console.error("PO 생성 실패:", err);
    throw err;
  }
};

// '장바구니로 가기' 눌렀을 때 장바구니 조회 
export const getCartItems = async (poId) => {
  const res = await ApiClient.get(`/po/items`, { params: { poId } }); // ✅ 쿼리는 params로
  return res;
};

// 수량변경
export const updateQuantity = async (itemNo, orderQty) => {
  const res = await ApiClient.put(`/po/update/${itemNo}`, { orderQty });
  return res;
};

// 상품삭제
export const deleteCartItems = async (itemIds) => {
  // axios는 'params'에 배열을 전달하면 자동으로 'itemIds=1&itemIds=2...' 형태로 직렬화하여 전송합니다.
  const res = await ApiClient.delete("/po/delete", { params: { itemIds } });  
  return res;
};

// 장바구니 저장
export const saveCart = async (poId, body) => {
  const res = await ApiClient.post(`/po/save/${poId}`, body); // ✅ 슬래시 추가
  return res;
};

// 장바구니 목록 불러오기 
export const getSavedCartList = async () => {
  const res = await ApiClient.get(`/po/saved`); 
  return res;
};

// 특정 장바구니 불러오기 
export const getSavedCartItems = async (poId) => {
  const res = await ApiClient.get(`/po/savedCart/${poId}`);
  return res;
};

// 저장된 장바구니 삭제 
export const deleteSavedCart = async (poId) => {
  const res = await ApiClient.delete(`/po/delete/${poId}`);
  return res;
};

// 발주확정
export const confirmOrder = async (poId) => {
  const res = await ApiClient.post(`/confirm/${poId}`);
  return res;
};
