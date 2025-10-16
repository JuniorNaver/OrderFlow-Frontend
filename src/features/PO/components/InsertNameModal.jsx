import React, { useState } from "react";

export default function InsertNameModal({ isOpen, onClose, onConfirm }) {
  const [cartName, setCartName] = useState("");

  if (!isOpen) return null; // 닫혀있으면 렌더링 안 함

  const handleConfirm = () => {
    if (!cartName.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    onConfirm(cartName); // 부모에 전달
    setCartName(""); // 입력 초기화
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-80">
        <h2 className="text-xl font-bold mb-4">제목을 입력하세요</h2>
        <input
          type="text"
          value={cartName}
          onChange={(e) => setCartName(e.target.value)}
          className="border border-gray-300 rounded w-full px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="예: 10월 발주 목록"
        />
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
