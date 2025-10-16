import React from "react";

export default function SavedCartModal({ carts, onSelect, onClose }) {
  if (!carts) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[400px] p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">저장된 장바구니</h2>
        <ul className="space-y-3 max-h-[400px] overflow-y-auto">
          {carts.map((cart) => (
            <li
              key={cart.id}
              onClick={() => onSelect(cart)}
              className="p-4 border rounded-lg hover:bg-blue-50 cursor-pointer transition"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold text-lg">{cart.name}</div>
                  <div className="text-gray-500 text-sm">{cart.date}</div>
                  <div className="text-gray-400 text-xs mt-1">
                    {cart.items.length}개 품목
                  </div>
                </div>
                <button
                  className="text-red-500 underline hover:text-red-600 font-medium text-sm"
                  onClick={(e) => {
                    e.stopPropagation(); // 리스트 클릭 이벤트와 분리
                    alert(`${cart.name} 삭제 클릭됨`);
                  }}
                >
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
        <button
          onClick={onClose}
          className="mt-6 w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded"
        >
          닫기
        </button>
      </div>
    </div>
  );
}