import React from "react";

export default function SavedCartModal({ list, onSelect, onClose, onDelete }) {
  if (!list || list.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[400px] p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">저장된 장바구니</h2>

        <ul className="space-y-3 max-h-[400px] overflow-y-auto">
          {list.map((cart) => (
            <li
              key={cart.poId}
              onClick={() => onSelect(cart)}
              className="p-4 border rounded-lg hover:bg-blue-50 cursor-pointer transition"
            >
              <div className="flex justify-between items-center">
                <div>
                  {/* 장바구니 이름 */}
                  <div className="font-semibold text-lg">{cart.remarks || "(제목 없음)"}</div>
                  {/* 저장 날짜 */}
                  <div className="text-gray-500 text-sm">{cart.actionDate}</div>
                  {/* 총액 */}
                  <div className="text-gray-400 text-xs mt-1">
                    총액: {cart.totalAmount?.toLocaleString()}원
                  </div>
                </div>

                <button
                  className="text-red-500 underline hover:text-red-600 font-medium text-sm"
                  onClick={(e) => onDelete(e, cart)}
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