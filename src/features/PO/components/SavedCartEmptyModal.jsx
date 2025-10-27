import React from "react";

export default function SavedCartEmptyModal({ onClose }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-2xl shadow-lg w-[400px] p-8 flex flex-col items-center">
       
        {/* 본문 */}
        <p className="text-gray-700 text-lg mb-10">
          저장된 장바구니가 없습니다.
        </p>

        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="w-full bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-300 transition"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
