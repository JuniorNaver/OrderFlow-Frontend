import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: { "Content-Type": "application/json"},
});
export default api;


// '담기'버튼 눌렀을 때 
export const createPO = async (gtin, poItemRequestDTO, poId = null) => {
  try {
    // ✅ poId가 없으면 새로 생성
    const currentPoId = poId
      ? poId : (await api.post(`/po`)).data.poId;

    // ✅ 기존 또는 새 헤더에 상품 추가
    const itemRes = await api.post(`/po/${currentPoId}/items`, poItemRequestDTO, {
      params: { gtin },
    });

    // ✅ poId도 함께 반환해서 다음 호출 때 재사용 가능
    return { ...itemRes.data, poId: currentPoId };

  } catch (err) {
    console.error("PO 생성 실패:", err);
    throw err;
  }
};





//'장바구니로 가기' 눌렀을 때 장바구니 조회 
export const getCartItems = async (poId) => {
  const res = await api.get(`/po/items`, { params: { poId } }); // ✅ 쿼리는 params로
  return res.data;
};






//수량변경
export const updateQuantity = async (itemNo, orderQty) => {
  const res = await api.put(`/po/update/${itemNo}`, { orderQty });
  return res.data;
};

//상품삭제
export const deleteCartItems = async (itemIds) => {
  // axios는 'params'에 배열을 전달하면 자동으로 'itemIds=1&itemIds=2...' 형태로 직렬화하여 전송합니다.
  const res = await api.delete(`/po/delete`, { params: { itemIds } });  
  return res.data;
};





//장바구니 저장
export const saveCart = async (poId, body) => {
   const res = await api.post(`/po/save/${poId}`, body); // ✅ 슬래시 추가
  return res.data;
};

//장바구니 목록 불러오기 
export const getSavedCartList = async () => {
  const res = await api.get(`/po/saved`); 
  return res.data;
};

//특정 장바구니 불러오기 
export const getSavedCartItems = async (poId) => {
  const res = await api.get(`/po/savedCart/${poId}`);
  return res.data;
};

//저장된 장바구니 삭제 
export const deleteSavedCart = async (poId) => {
  const res = await api.delete(`/po/delete/${poId}`);
  return res.data;
};





//발주확정
export const confirmOrder = async (poId) => {
  const res = await api.post(`/po/confirm/${poId}`);
  return res.data;
};


