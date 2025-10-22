// ========================================================================
// ⚙️ MiniLoader 내부 로딩 애니메이션 — 활용법 요약
// ------------------------------------------------------------------------
// ✅ 1️⃣ import
// import MiniLoader from "/src/components/loading/MiniLoader";
//
// ✅ 2️⃣ 사용 예시 (간단)
// if (isLoading)
//   return (
//     <div className="flex justify-center items-center min-h-[150px]">
//       <MiniLoader message="지점 정보를 불러오는 중..." />
//     </div>
//   );
//
// ✅ 3️⃣ props 옵션
// - message : 표시할 문구 (기본값 "로딩 중...")
// - size    : 점의 크기 (Tailwind 단위, 기본값 6)
//
// ✅ 4️⃣ 활용 예시
// <MiniLoader />                                // 기본 형태
// <MiniLoader message="데이터를 불러오는 중..." />   // 문구 커스텀
// <MiniLoader message="저장 중..." size={4} />       // 작게 표시
//
// ✅ 5️⃣ 사용 위치 예시
// - 탭 내부 (예: StoreAdminTab, FinanceManageTab 등)
// - 테이블 / 카드 / 모달 내 로딩 상태 표현
// - 전역 스피너 대신 부분 UI 로딩 시 사용
// ------------------------------------------------------------------------
// 💡 전역 스피너(LoadingProvider)와 함께 병행 가능
//   → 전역은 전체 페이지 오버레이, MiniLoader는 부분 컴포넌트 로딩용
// ========================================================================


import { motion } from "framer-motion";

export default function MiniLoader({ message = "로딩 중...", size = 6 }) {
  const colors = ["bg-blue-500", "bg-teal-500", "bg-indigo-500"];

  return (
    <div className="flex flex-col items-center justify-center py-4">
      {/* 점 3개 애니메이션 */}
      <div className="flex gap-2 mb-2">
        {colors.map((color, i) => (
          <motion.span
            key={i}
            className={`${color} w-${size} h-${size} rounded-full`}
            animate={{
              y: [0, -6, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>

      {/* 메시지 */}
      <motion.p
        className="text-gray-600 text-sm font-medium tracking-wide text-center"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.2, repeat: Infinity }}
      >
        {message}
      </motion.p>
    </div>
  );
}
