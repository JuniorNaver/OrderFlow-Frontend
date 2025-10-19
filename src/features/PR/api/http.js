import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8080";

/** 공용 클라이언트: /api/... 같은 전역 엔드포인트 */
export const coreClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

/** PR 전용 클라이언트: /api/v1/pr/... 엔드포인트 */
export const prClient = axios.create({
  baseURL: `${API_BASE}/api/v1/pr`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

/* ---- 에러 메시지 표준화 ---- */
const normalizeError = (e) =>
  new Error(
    e?.response?.data?.message ||
    e?.response?.data?.error ||
    e?.response?.statusText ||
    e?.message ||
    "Network error"
  );

  coreClient.interceptors.response.use(
  (r) => r,
  (e) => Promise.reject(normalizeError(e))
);

prClient.interceptors.response.use(
  (r) => r,
  (e) => Promise.reject(normalizeError(e))
);

export { coreGet as get, corePost as post, corePut as put, coreDel as del };

/* ---- 얇은 래퍼: core(공용) ---- */
export const coreGet  = (path, config)       => coreClient.get(pathTrim(path), config).then(r => r.data);
export const corePost = (path, body, config) => coreClient.post(pathTrim(path), body, config).then(r => r.data);
export const corePut  = (path, body, config) => coreClient.put(pathTrim(path), body, config).then(r => r.data);
export const coreDel  = (path, config)       => coreClient.delete(pathTrim(path), config).then(r => r.data);

/* ---- 얇은 래퍼: pr 전용 ---- */
export const prGet  = (path, config)        => prClient.get(pathTrim(path), config).then(r => r.data);
export const prPost = (path, body, config)  => prClient.post(pathTrim(path), body, config).then(r => r.data);
export const prPut  = (path, body, config)  => prClient.put(pathTrim(path), body, config).then(r => r.data);
export const prDel  = (path, config)        => prClient.delete(pathTrim(path), config).then(r => r.data);

/* ---- 유틸 ---- */
function pathTrim(p) {
  return p.startsWith("/") ? p.slice(1) : p;
}