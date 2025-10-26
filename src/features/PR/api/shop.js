import ApiClient from "../../../common/authorities/api/ApiClient";

/** @returns {Promise<{id:string, name:string}[]>} */
export const listCategories = () =>
  ApiClient.get("/api/categories").then(r => r.data);

/** @param {{ q?:string, categoryId?:string, page?:number, size?:number }} params */
export const listProducts = (params={}) =>
  ApiClient.get("/api/products", { params }).then(r => r.data);

// 아주 단순한 모듈 전역 상태 (임시용)
let currentStoreId = null;

export function setCurrentStoreId(id) {
  currentStoreId = id || null;
}

export function getCurrentStoreId() {
  return currentStoreId;
}
