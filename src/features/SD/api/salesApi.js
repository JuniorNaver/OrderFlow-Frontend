import axios from "axios";

export const getSalesList = async () => {
  const res = await axios.get("/api/sales");
  return res.data;
};