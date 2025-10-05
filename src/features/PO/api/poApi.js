// PO/api/poApi.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api/po",
});

export const getCartItems = async () => {
  const res = await api.get("/items");
  return res.data;
};

export const updateQuantity = async (poId, quantity) => {
  const res = await api.put(`/update/${poId}`, { quantity });
  return res.data;
};

export const confirmOrder = async (poId) => {
  const res = await api.post(`/confirm/${poId}`);
  return res.data;
};
