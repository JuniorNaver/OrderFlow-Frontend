import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8080", // Spring Boot API 서버 주소
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
