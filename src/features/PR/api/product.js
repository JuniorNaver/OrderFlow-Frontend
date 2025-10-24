// src/api/products.js
import { coreGet,corePost,corePut,coreDel } from "./http";

/** 단건 상세 */
export function getProduct(gtin) {
  return coreGet(`/products/${encodeURIComponent(gtin)}`);
}

/** 카테고리/이름/GTIN 검색 */
export function listProducts({
  name,
  gtin,
  category,                 // 컨트롤러 @RequestParam(name="category")
  page = 0,
  size = 20,
  sort = "productName,asc",
} = {}) {
  const qs = new URLSearchParams();
  if (name) qs.set("name", name);
  if (gtin) qs.set("gtin", gtin);
  if (category) qs.set("category", category);
  qs.set("page", String(page));
  qs.set("size", String(size));
  qs.set("sort", sort);
  return coreGet(`/products?${qs.toString()}`); // Page<ProductResponseDTO>
}

/** 연관 상품 (카테고리 기준, 현재 상품 제외는 컴포넌트에서 필터) */
export async function getRelated(category, { page = 0, size = 8 } = {}) {
  const qs = new URLSearchParams({ category, page, size });
  const pageResp = await coreGet(`/products?${qs.toString()}`);
  return pageResp?.content ?? []; // Page 보호
}

/** 생성/수정/삭제 */
export function createProduct(payload) {
  return corePost(`/products`, payload);
}
export function updateProduct(gtin, payload) {
  return corePut(`/products/${encodeURIComponent(gtin)}`, payload);
}
export function deleteProduct(gtin) {
  return coreDel(`/products/${encodeURIComponent(gtin)}`);
}