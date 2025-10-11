import apiClient from "../../../services/apiClient";

/**
 * @typedef {{productCode:string, productName:string, suggestedQty:number, marginRate?:number, reason?:string}} RecommendItem
 * @typedef {{storeId:string, generatedAt:string, items:RecommendItem[]}} RecommendDto
 * @typedef {{productCode:string, qty:number, unitPrice?:number}} PurchaseRequestLine
 * @typedef {{storeId:string, lines:PurchaseRequestLine[], note?:string}} PurchaseRequestCreateDto
 * @typedef {{id:string, storeId:string, lines:PurchaseRequestLine[], createdAt:string, status:"CREATED"|"APPROVED"|"REJECTED"}} PurchaseRequestDto
 */

/** @param {string} storeId @returns {Promise<RecommendDto>} */
export const getRecommend = (storeId) =>
  apiClient.get(`/api/pr/stores/${storeId}/recommend`).then(r => r.data);

/** @param {string} storeId @param {PurchaseRequestCreateDto} dto @returns {Promise<PurchaseRequestDto>} */
export const createPurchaseRequest = (storeId, dto) =>
  apiClient.post(`/api/pr/stores/${storeId}/orders`, dto).then(r => r.data);

/** @param {string} storeId @param {{page?:number, size?:number}} [params] @returns {Promise<{content:PurchaseRequestDto[], total:number}>} */
export const listPurchaseRequests = (storeId, params) =>
  apiClient.get(`/api/pr/stores/${storeId}/orders`, { params }).then(r => r.data);
