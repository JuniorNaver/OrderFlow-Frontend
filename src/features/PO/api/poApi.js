import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: { "Content-Type": "application/json"},
});
export default api;




//'담기' 버튼 클릭시 POHeader, POItem 추가 
export const createPO = async (gtin, poItemRequestDTO) => {
  try {
    // 1️⃣ POHeader 생성
    const headerRes = await api.post("/po");
    const poId = headerRes.data.poId;

    // 2️⃣ 생성된 POHeader에 POItem 추가
    const itemRes = await api.post(`/po/${poId}/items`, poItemRequestDTO, {
      params: { gtin },
    });

    

    return itemRes.data; // 최종 결과 (POItemResponseDTO)
  } catch (err) {
    console.error("PO 생성 실패:", err);
    throw err;
  }
};





//'장바구니로 가기' 눌렀을 때 장바구니 조회 
export const getCartItems = async (poId, status) => {
  const res = await api.get(`/po/items`, { params: { poId, status } }); // ✅ 쿼리는 params로
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
  const res = await api.delete("/po/delete", { params: { itemIds } });  
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
  const res = await api.post(`/confirm/${poId}`);
  return res.data;
};


