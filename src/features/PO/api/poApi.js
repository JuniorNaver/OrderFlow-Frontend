import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api/po",
});

//상품 불러오기 
export const getCartItems = async () => {
  const res = await api.get("/items");
  return res.data;
};

//수량변경
export const updateQuantity = async (poId, quantity) => {
  const res = await api.put(`/update/${poId}`, { quantity });
  return res.data;
};

//발주확정
export const confirmOrder = async (poId) => {
  const res = await api.post(`/confirm/${poId}`);
  return res.data;
};


