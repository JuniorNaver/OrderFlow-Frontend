import axios from "axios";

export const addToCart = async (productId, quantity = 1) => {
  const res = await axios.post("/api/orders/cart", { productId, quantity });
  return res.data;
};

export const getCart = async () => {
  const res = await axios.get("/api/orders/cart");
  return res.data;
};