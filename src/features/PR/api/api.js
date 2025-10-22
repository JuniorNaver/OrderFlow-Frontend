import apiClient from "../../../services/apiClient";
import { getCurrentStoreId } from "./shop";
/**
 * @typedef {{productCode:string, productName:string, suggestedQty:number, marginRate?:number, reason?:string, unitPrice?:number, zone?:string, category?:string}} RecommendItem
 * @typedef {{storeId?:string, generatedAt?:string, items:RecommendItem[]}} RecommendDto
 * @typedef {{productCode:string, qty:number, unitPrice?:number}} PurchaseRequestLine
 * @typedef {{storeId:string, lines:PurchaseRequestLine[], note?:string}} PurchaseRequestCreateDto
 * @typedef {{id:string, storeId:string, lines:PurchaseRequestLine[], createdAt:string, status:"CREATED"|"APPROVED"|"REJECTED"}} PurchaseRequestDto
 */

/** 응답 정규화: items | content | list | array → 항상 { items, storeId?, generatedAt? } */
function normalizeRecommend(data) {
  const items = Array.isArray(data)
    ? data
    : (data?.items ?? data?.content ?? data?.list ?? []);
  return {
    items,
    storeId: data?.storeId,
    generatedAt: data?.generatedAt,
  };
}

/** 
 *  @param {string=} storeId
 *  @param {{categories?:string[]; zone?: "room"|"chilled"|"frozen"|"other"; limitPerCategory?:number}} [params]
 *  @returns {Promise<RecommendDto>}
 */
export const getRecommend = async (storeId, params = {}) => {
  // 없으면 기본 점포 ID 사용 (임시용)
  const sid = storeId ?? getCurrentStoreId() ?? "S001"; 

  const qp = {...params };
  if (Array.isArray(qp.categories)) {
    qp.categories = qp.categories.join(","); // "음료,스낵,즉석식품"
  }

  const { data } = await apiClient.get(
    `/api/pr/stores/${encodeURIComponent(sid)}/recommendations`,
    { params: qp } // ← 추후 Top3 서버필터용 파라미터 지원
  );
  return normalizeRecommend(data);
};

export const createPurchaseRequest = (storeId, dto) =>
  apiClient
    .post(`/api/pr/stores/${encodeURIComponent(storeId)}/orders`, dto)
    .then(r => r.data);

export const listPurchaseRequests = (storeId, params) =>
  apiClient
    .get(`/api/pr/stores/${encodeURIComponent(storeId)}/orders`, { params })
    .then(r => r.data);
