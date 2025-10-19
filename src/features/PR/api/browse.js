import { prGet as get, prPost as post } from "./http";
// inventory (GET만 쓸 거면 reserve/release/commit 삭제 가능)
export const fetchAvailable  = (gtin) => get("/inventory", { params: { gtin } });
export const reserve         = (gtin, qty=1) => post("/inventory/reserve", { gtin, qty });
export const release         = (gtin, qty=1) => post("/inventory/release", { gtin, qty });
export const commit          = (gtin, qty=1) => post("/inventory/commit",  { gtin, qty });

// browse
export const fetchCorners    = (zone) => get("/browse/corners", { params: { zone } });
export const fetchCategories = (zone, cornerId) => get("/browse/categories", { params: { zone, cornerId } });
export const fetchProducts   = (kan, page=0, size=20) => get("/browse/products", { params: { kan, page, size } });