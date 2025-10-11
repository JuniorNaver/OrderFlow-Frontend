import apiClient from "../../../services/apiClient";



/** @returns {Promise<{id:string, name:string}[]>} */
export const listCategories = () =>
  apiClient.get("/api/catalog/categories").then(r => r.data);

/** @param {{ q?:string, categoryId?:string, page?:number, size?:number }} params */
export const listProducts = (params={}) =>
  apiClient.get("/api/catalog/products", { params }).then(r => r.data);
/*
  기대 응답 예:
  { content: [{ productCode, name, imageUrl, unitPrice }], total: 123 }
*/
