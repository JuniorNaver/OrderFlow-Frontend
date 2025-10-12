import React from "react";

export default function ItemList({
  items,
  selectAll,
  onSelectAll,
  onSelect,
  onIncrease,
  onDecrease,
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow overflow-x-auto">
      <table className="w-full border-collapse text-lg min-w-[900px]">
        {/* 구분 */}
        <thead>
          <tr className="border-b border-gray-300 text-gray-700 font-semibold text-lg">
            <th className="py-3 px-4 text-left">
              <div className="flex items-center gap-40">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={onSelectAll}
                  className="w-5 h-5"
                />
                <span className="ml-4">상품명</span>
              </div>
            </th>
            <th className="w-48 text-center">수량</th>
            <th className="w-40 text-center">매입가</th>
            <th className="w-40 text-center">예상 마진</th>
          </tr>
        </thead>

        {/* 목록 */}
        <tbody>
          {items.length > 0 ? (
            items.map((item) => (
              <tr
                key={item.id}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                {/* 상품명 */}
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={!!item.selected}
                      onChange={() => onSelect(item.id)}
                      className="w-5 h-5"
                    />
                    <span className="ml-12 text-gray-800">{item.name}</span>
                  </div>
                </td>

                {/* 수량 */}
                <td className="text-center">
                  <div className="inline-flex items-center justify-center gap-3">
                    <button
                      onClick={() => onDecrease(item.id)}
                      className="border w-8 h-8 rounded flex items-center justify-center hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-medium flex items-center justify-center">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => onIncrease(item.id)}
                      className="border w-8 h-8 rounded flex items-center justify-center hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </td>

                {/* 매입가 */}
                <td className="text-center text-gray-800">
                  {(item.totalPrice ?? item.price * item.qty).toLocaleString()}
                </td>

                {/* 예상 마진 */}
                <td className="text-center text-gray-600">
                  {(item.totalMargin ?? item.margin * item.qty).toLocaleString()}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center text-gray-400 py-6">
                장바구니에 상품이 없습니다.
              </td>
            </tr>
          )}
        </tbody>

        {/* 총 금액 */}
        <tfoot>
          <tr className="border-t border-gray-300 font-semibold text-lg">
            <td className="text-xl py-4 px-4 text-right" colSpan="2">
              총 금액
            </td>
            <td className="text-xl text-center text-gray-800">
              {items
                .reduce(
                  (sum, item) => sum + (item.totalPrice ?? item.price * item.qty),
                  0
                )
                .toLocaleString()}
            </td>
            <td className="text-xl text-center text-gray-800">
              {items
                .reduce(
                  (sum, item) => sum + (item.totalMargin ?? item.margin * item.qty),
                  0
                )
                .toLocaleString()}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}