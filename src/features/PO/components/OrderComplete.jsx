import React from "react";
import { CheckCircle } from "lucide-react";

export default function OrderComplete({ handleViewOrders }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-gray-700 bg-white">
      {/* ✅ 완료 아이콘 */}
      <CheckCircle size={80} className="text-blue-500 mb-6" />

      {/* ✅ 메시지 */}
      <h2 className="text-2xl font-semibold mb-2">발주가 완료되었습니다</h2>
      <p className="text-gray-500 mb-5">주문이 성공적으로 처리되었습니다.</p>

      {/* ✅ 버튼 영역 */}
      <div className="flex gap-3">
        <button
          onClick={handleViewOrders}
          className="border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium px-6 py-1 rounded-lg"
        >
          발주 내역 보기
        </button>
      </div>
    </div>
  );
}