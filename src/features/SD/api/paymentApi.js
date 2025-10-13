import axios from "axios";

const API_BASE = "http://localhost:8080/api";

export const createPayment = async (data) => {
  const response = await axios.post(`${API_BASE}/payments`, data);
  return response.data;
};