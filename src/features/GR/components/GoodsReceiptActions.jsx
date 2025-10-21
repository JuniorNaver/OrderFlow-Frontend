import { useState } from "react";
import ScanModal from "./ScanModal";

export default function GoodsReceiptActions({ selected }) {
  const [showScan, setShowScan] = useState(false);

  return (
    <>
      <div className="flex justify-between items-center border-b pb-3 mb-2">
        {/* 🔹 왼쪽 버튼 그룹 */}
        <div className="flex space-x-2">
          <button
            onClick={() => setShowScan(true)} // ✅ 스캔 모달 열기 연결
            className="px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600 shadow-sm transition"
          >
            스캔
          </button>
          <button className="px-4 py-2 bg-blue-400 text-white rounded hover:bg-blue-500 shadow-sm transition">
            내보내기
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow-sm transition">
            수정 중
          </button>
        </div>

        {/* 🔹 오른쪽 버튼 그룹 */}
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 shadow-sm transition">
            발주 취소
          </button>
          <button className="px-4 py-2 bg-orange-400 text-white rounded hover:bg-orange-500 shadow-sm transition">
            삭제
          </button>
          <button className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 shadow-sm transition">
            초기화
          </button>
          <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 shadow-sm transition">
            저장
          </button>
        </div>
      </div>

      {/* 🔸 스캔 모달 */}
      {showScan && (
        <ScanModal
          onClose={() => setShowScan(false)}
          onSuccess={() => window.location.reload()}
        />
      )}
    </>
  );
}
