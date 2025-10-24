// src/components/providers/ToastProvider.jsx

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toastBus } from "../../common/utils/ToastBus";

const ToastContext = createContext();
export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const DURATION = 1500; // 표시 시간(ms)

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now();
    const newToast = { id, message, type };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, DURATION);
  }, []);

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

      <div className="fixed bottom-6 inset-x-0 flex flex-col-reverse items-center gap-2 z-[9999]">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className={`relative inline-flex items-center justify-center px-4 py-2.5
                text-white text-sm font-medium rounded-full shadow-lg overflow-hidden
                backdrop-blur-md bg-opacity-90 w-max pointer-events-none
                ${colors[toast.type]}`}
            >
              {/* ✨ 빛이 뒤에서 앞으로 채워지는 배경 */}
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
              {/* 메시지 */}
              <span className="relative z-10">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
