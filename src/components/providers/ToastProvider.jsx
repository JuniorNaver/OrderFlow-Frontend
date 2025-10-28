// src/components/providers/ToastProvider.jsx
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toastBus } from "../../common/utils/ToastBus";
import { useNavigate } from "react-router-dom";

const ToastContext = createContext();
export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const navigate = useNavigate();
  const DURATION = 1500; // 표시 시간(ms)

  /**
   * showToast(message, type, navigateButtonActive, path, navigateText)
   */
  const showToast = useCallback(
    (message, type = "success", navigateButtonActive = false, path = "", navigateText = "이동") => {
      const id = Date.now();
      const newToast = { id, message, type, navigateButtonActive, path, navigateText };
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, DURATION);
    },
    []
  );

  // toastBus 전역 구독 (기존 로직 그대로 유지)
  useEffect(() => {
    const unsubscribe = toastBus.subscribe(({ message, type }) => {
      showToast(message, type);
    });
    return () => unsubscribe();
  }, [showToast]);

  const colors = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* ✅ 기존 스택형 구조 유지 */}
      <div className="fixed bottom-6 inset-x-0 flex flex-col-reverse items-center gap-2 z-[9999]">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className={`relative inline-flex items-center justify-center gap-3 px-4 py-2.5
        text-white text-sm font-medium rounded-full shadow-lg overflow-hidden
        backdrop-blur-md bg-opacity-90 w-max
        ${colors[toast.type]}
      `}
              style={{ pointerEvents: toast.navigateButtonActive ? "auto" : "none" }}
            >
              {/* ✨ 배경 빛 채워짐 */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/40 to-transparent"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: DURATION / 1000, ease: "linear" }}
                style={{
                  zIndex: 0,
                  borderRadius: "9999px",
                }}
              />

              {/* 💬 메시지 */}
              <span className="relative z-10">{toast.message}</span>

              {/* 🧭 네비게이션 버튼 (옵션) */}
              {toast.navigateButtonActive && toast.path && (
                <button
                  onClick={() => navigate(toast.path)}
                  className="relative z-10 bg-white text-gray-800 text-xs font-semibold px-3 py-1 rounded-full hover:bg-gray-100 transition"
                >
                  {toast.navigateText || "이동"}
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

      </div>
    </ToastContext.Provider>
  );
};
