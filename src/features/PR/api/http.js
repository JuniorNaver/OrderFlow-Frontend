// ============================================================================
// 📁 /src/features/PR/api/http.js
// ============================================================================

// ✅ 공통 ApiClient (JWT 자동 부착 + 401 처리 포함)
import ApiClient from "../../../common/authorities/api/ApiClient";

/**
 * PR 모듈 공용 HTTP 유틸
 * - 기존 구조와 주석, 함수 이름 유지
 * - axios 개별 인스턴스 제거 → ApiClient 재활용
 * - /api/v1/pr/ 하위 경로를 위한 전용 함수 제공
 */

/* ---- 에러 메시지 표준화 ---- */
const normalizeError = (e) =>
  new Error(
    e?.response?.data?.message ||
      e?.response?.data?.error ||
      e?.response?.statusText ||
      e?.message ||
      "Network error"
  );

/* ---- 공용 요청 래퍼(core) ---- */
/** 공용 클라이언트: /api/... 같은 전역 엔드포인트 */
export const coreGet = (path, config) =>
  ApiClient.get(pathTrim(path), config).catch((e) => {
    throw normalizeError(e);
  });

export const corePost = (path, body, config) =>
  ApiClient.post(pathTrim(path), body, config).catch((e) => {
    throw normalizeError(e);
  });

export const corePut = (path, body, config) =>
  ApiClient.put(pathTrim(path), body, config).catch((e) => {
    throw normalizeError(e);
  });

export const coreDel = (path, config) =>
  ApiClient.delete(pathTrim(path), config).catch((e) => {
    throw normalizeError(e);
  });

/* ---- PR 전용 요청 래퍼(prClient) ---- */
/** PR 전용 클라이언트: /api/v1/pr/... 엔드포인트 */
export const prGet = (path, config) =>
  ApiClient.get(`/v1/pr/${pathTrim(path)}`, config).catch((e) => {
    throw normalizeError(e);
  });

export const prPost = (path, body, config) =>
  ApiClient.post(`/v1/pr/${pathTrim(path)}`, body, config).catch((e) => {
    throw normalizeError(e);
  });

export const prPut = (path, body, config) =>
  ApiClient.put(`/v1/pr/${pathTrim(path)}`, body, config).catch((e) => {
    throw normalizeError(e);
  });

export const prDel = (path, config) =>
  ApiClient.delete(`/v1/pr/${pathTrim(path)}`, config).catch((e) => {
    throw normalizeError(e);
  });

export { coreGet as get, corePost as post, corePut as put, coreDel as del };

/* ---- 유틸 ---- */
function pathTrim(p) {
  return p.startsWith("/") ? p.slice(1) : p;
}
