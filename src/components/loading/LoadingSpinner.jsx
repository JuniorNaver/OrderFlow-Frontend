// eslint-disable-next-line no-unused-vars
// ========================================================================
// ⚙️ Loading 전역 로딩 시스템 — 활용법 요약
// ------------------------------------------------------------------------
// ✅ 1️⃣ import
// import { useLoading } from "/src/components/providers/LoadingProvider";
//
// ✅ 2️⃣ useLoading() 훅 선언
// const { showLoading, hideLoading } = useLoading();
//
// ✅ 3️⃣ showLoading() / hideLoading() 호출
// showLoading("데이터를 불러오는 중입니다...");
// ... (API 호출 등 비동기 작업 수행)
// hideLoading();
//
// ✅ 동작 설명
// - showLoading("문구") : 로딩 스피너 표시 + 메시지 출력
// - hideLoading()       : 로딩 스피너 숨김
//
// ✅ Provider 등록
// - RootProvider.jsx 내부에 이미 <LoadingProvider>가 포함되어 있으므로
//   별도의 Provider 감싸기 없이 전역에서 바로 사용 가능합니다.
// ------------------------------------------------------------------------
// 💡 사용 예시 (예: StoreUpdateUserTab.jsx)
// ------------------------------------------------------------------------
// import { useLoading } from "/src/components/providers/LoadingProvider";
// import storeApi from "../api/storeApi";
//
// const StoreUpdateUserTab = () => {
//   const { showLoading, hideLoading } = useLoading();
//
//   const handleSave = async () => {
//     try {
//       showLoading("저장 중입니다...");
//       await storeApi.updateEnv();
//       showToast("저장 완료 ✅", "success"); // 토스트와 함께 사용 가능
//     } catch (err) {
//       showToast("저장 중 오류 발생 ❌", "error");
//     } finally {
//       hideLoading(); // 반드시 호출
//     }
//   };
// };
// ------------------------------------------------------------------------
// 📌 추가 옵션 (선택)
// - showLoading() 호출 시 message 인자를 생략하면
//   기본 메시지 "로딩 중입니다..."가 표시됩니다.
//
// 💡 예시
// showLoading();          // 기본 메시지
// showLoading("처리 중");  // 커스텀 메시지
//
// ------------------------------------------------------------------------
// 🧩 관련 파일 구조 예시
// src/
// ├── components/
// │   ├── common/
// │   │   └── LoadingSpinner.jsx
// │   └── providers/
// │       └── LoadingProvider.jsx
// └── common/
//     └── providers/
//         └── RootProvider.jsx  ← 여기에 LoadingProvider 등록 완료
// ========================================================================


import { motion } from "framer-motion";

export default function LoadingSpinner({ message = "로딩 중입니다..." }) {
  const colors = ["bg-red-500", "bg-blue-500", "bg-green-500"];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center z-[9999]">
      <div className="flex gap-4">
        {colors.map((color, i) => (
          <motion.span
            key={i}
            className={`w-8 h-8 rounded-full ${color}`}
            animate={{
              opacity: [0, 1, 0],
              scale: [0.5, 1.2, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
      <p className="text-white text-lg font-medium mt-6 animate-pulse">{message}</p>
    </div>
  );
}
