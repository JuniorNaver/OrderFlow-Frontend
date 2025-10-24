// ============================================================================
// 📁 src/common/utils/ToastBus.js
// ---------------------------------------------------------------------------
// 전역 Toast 이벤트 버스 — 컴포넌트 외부(Axios, Service 등)에서도 토스트 표시 가능
// ============================================================================
const listeners = new Set();

export const toastBus = {
  /** ToastProvider에서 구독 */
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  /** 외부(Axios 등)에서 호출 */
  emit(message, type = "error") {
    listeners.forEach((listener) => listener({ message, type }));
  },
};
