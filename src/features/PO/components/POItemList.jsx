// PO/components/POItemList.jsx
import React from "react";

export default function POItemList({ items, onIncrease, onDecrease }) {
  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <table className="w-full text-sm">
        <thead className="border-b text-gray-500">
          <tr>
            <th>상품명</th>
            <th>수량</th>
            <th>매입가</th>
            <th>예상 마진</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="py-2">{item.productName}</td>
              <td>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => onDecrease(item.id)}
                    className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => onIncrease(item.id)}
                    className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>
              </td>
              <td>{item.purchasePrice.toLocaleString()}원</td>
              <td className="text-blue-500">{item.margin.toLocaleString()}원</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}