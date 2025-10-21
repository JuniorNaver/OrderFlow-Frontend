// ========================================================================
// 🧭 Toast 전역 알림 시스템 — 활용법 요약
// ------------------------------------------------------------------------
// ✅ 1️⃣ import
// import { useToast } from "/src/components/providers/ToastProvider";
//
// ✅ 2️⃣ useToast() 훅 선언
// const { showToast } = useToast();
//
// ✅ 3️⃣ showToast() 호출
// showToast("저장되었습니다 ✅", "success");
// showToast("삭제 중 오류가 발생했습니다 ❌", "error");
// showToast("정보가 업데이트되었습니다 ℹ️", "info");
// 
// ✅ 타입 (type 인자)
// - "success"  : 초록색 (성공)
// - "error"    : 빨간색 (오류)
// - "info"     : 파란색 (안내)
//
// 📌 Provider는 이미 RootProvider.jsx 내부에 등록되어 있으므로
// 별도의 Provider 감싸기 없이 전역에서 바로 사용 가능합니다.
// ------------------------------------------------------------------------
// 💡 사용 예시 (예: StoreAdminTab.jsx)
// ------------------------------------------------------------------------
// import { useToast } from "/src/components/providers/ToastProvider";
//
// const StoreAdminTab = () => {
//   const { showToast } = useToast();
//
//   const handleSave = async () => {
//     try {
//       await saveData(); // API 호출
//       showToast("저장되었습니다 ✅", "success");
//     } catch (err) {
//       showToast("저장 중 오류가 발생했습니다 ❌", "error");
//     }
//   };
// };
//
// 📌 Provider는 이미 RootProvider.jsx 내부에 등록되어 있으므로
// 별도의 Provider 감싸기 없이 전역에서 바로 사용 가능합니다.
// ========================================================================

import { motion, AnimatePresence } from "framer-motion";

const Toast = ({ message, type = "success" }) => {
  const colors = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  };

  if (!message) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="toast"
        initial={{ opacity: 0, y: 60, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 60, scale: 0.95 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={`
          fixed bottom-6 inset-x-0 mx-auto w-max
          inline-flex items-center justify-center
          px-4 py-2.5 text-white text-sm font-medium text-center
          rounded-full shadow-lg z-[9999]
          ${colors[type]} backdrop-blur-md bg-opacity-90
          max-w-[85%] min-w-[160px]
        `}
        style={{ pointerEvents: "none" }}
      >
        {message}
      </motion.div>
    </AnimatePresence>
  );
};

export default Toast;