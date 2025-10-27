// ============================================================================
// 📁 src/features/PO/api/poApi.js (💯 단가 제거 버전 — 서버 단가 기준 유지)
// ============================================================================
import ApiClient from "../../../common/authorities/api/ApiClient";
import { useAuth } from "../../../common/authorities/component/useAuth";

export const usePOApi = () => {
  const { user } = useAuth();
  const userId = user?.userId;

  /**
   * 🧩 장바구니(POHeader) 자동 생성 + 아이템 추가
   * ----------------------------------------------------
   * - 백엔드: POST /api/po/items
   * - 요청 DTO:
   *   {
   *     "userId": "admin01",
   *     "item": { "gtin": "8801234567890", "orderQty": 2 }
   *   }
   * - 응답: POItemResponseDTO
   *   { itemNo, gtin, productName, purchasePrice, orderQty, poId, ... }
   * ----------------------------------------------------
   * 🧠 단가(unitPrice)는 프론트에서 절대 보내지 않음!
   *   백엔드가 PriceMaster 기준으로 최신 매입가를 조회하여 자동 반영.
   */
  const createPO = async (poItemRequestDTO) => {
    try {
      const payload = {
        userId,
        item: {
          gtin : poItemRequestDTO.gtin,
          orderQty: poItemRequestDTO.orderQty ?? 1,
        },
      };

      const res = await ApiClient.post("/po/items", payload);
      return res; // POItemResponseDTO
    } catch (err) {
      console.error("PO 생성 실패:", err);
      throw err;
    }
  };

  /** ✅ 현재 PR 상태 헤더 조회 */
  const getCurrentCartId = async () => {
    try {
      const res = await ApiClient.get("/po/current");
      return res; // Long
    } catch (e) {
      if (e.response?.status === 204) return null;
      throw e;
    }
  };

  /** ✅ 특정 장바구니 아이템 목록 */
  const getCartItems = async (poId) =>
    await ApiClient.get(`/po/items`, { params: { poId } });

  /** ✅ 수량 변경 */
  const updateQuantity = async (itemNo, orderQty) =>
    await ApiClient.put(`/po/update/${itemNo}`, { orderQty });

  /** ✅ 선택 상품 삭제 */
  const deleteCartItems = async (itemIds) =>
    await ApiClient.delete("/po/delete", { params: { itemIds } });

  /** ✅ 장바구니 저장 (PR → S) */
  const saveCart = async (poId, body) =>
    await ApiClient.post(`/po/save/${poId}`, body);

  /** ✅ 저장된 장바구니 목록 조회 */
  const getSavedCartList = async () => {
    const res = await ApiClient.get(`/po/saved`);
    console.log("ApiClient 응답 구조:", res);
    return res;
  }








  /** ✅ 저장된 장바구니 상세 조회 */
  const getSavedCartItems = async (poId) =>{
    const res = await ApiClient.get(`/po/savedCart/${poId}`);
      console.log("서버 응답:", res);
    return res;
  }

  // ✅ 저장된 장바구니 상세조회시 status=PR 1행 복제
  const loadSavedCart = async (poId) => {
    const res = await ApiClient.post(`/po/savedCart/${poId}/load`);
    return res.data; // { poId: 새로 생성된 PR ID }
  };











  /** ✅ 저장된 장바구니 삭제 */
  const deleteSavedCart = async (poId) =>
    await ApiClient.delete(`/po/delete/${poId}`);

  /** ✅ 발주 확정 (S → PO) */
  const confirmOrder = async (poId) =>
    await ApiClient.post(`/po/confirm/${poId}`);

  return {
    createPO,
    getCurrentCartId,
    getCartItems,
    updateQuantity,
    deleteCartItems,
    saveCart,
    getSavedCartList,
    getSavedCartItems,
    deleteSavedCart,
    confirmOrder,
    loadSavedCart
  };
};
