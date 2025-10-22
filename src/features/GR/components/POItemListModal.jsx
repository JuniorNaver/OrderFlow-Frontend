import React from "react";

export default function POItemListModal({ items, onConfirm, onClose }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-[700px] max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          📋 발주 품목 상세
        </h2>

        {/* ✅ 테이블 구조 */}
        <table className="w-full text-sm border border-gray-300">
          <thead className="bg-gray-100 text-gray-700 border-b">
            <tr>
              <th className="p-2 border">No</th>
              <th className="p-2 border">상품명</th>
              <th className="p-2 border">발주수량</th>
              <th className="p-2 border">출고수량</th>
              <th className="p-2 border">미출수량</th>
              <th className="p-2 border">단가</th>
              <th className="p-2 border">합계</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr
                key={idx}
                className="border-b hover:bg-gray-50 transition text-center"
              >
                <td className="p-2 border">{idx + 1}</td>
                <td className="p-2 border text-left">{item.productName}</td>
                <td className="p-2 border">{item.orderQty}</td>
                <td className="p-2 border">{item.shippedQty ?? 0}</td>
                <td className="p-2 border">{item.pendingQty ?? 0}</td>
                <td className="p-2 border">
                  {item.unitPrice?.toLocaleString() ?? "-"}
                </td>
                <td className="p-2 border text-right">
                  {item.total?.toLocaleString() ?? "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ✅ 버튼 영역 */}
        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={onConfirm}
            className="px-5 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            ✅ 입고 확정
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
