import React, { useEffect, useState } from "react";
import { getCartItems } from "../api/poApi";
import BudgetProgressBar from "../components/BudgetProgressBar";

export default function POPage() {
  const [items, setItems] = useState([
    { id: 1, name: "햇반(100g)", gtin: "01584123", price: 1000, margin: 500, qty: 2 },
    { id: 2, name: "진라면", gtin: "09843122", price: 1200, margin: 600, qty: 1 },
    { id: 3, name: "코카콜라 500ml", price: 9000, margin: 4500, qty: 6 },
    { id: 4, name: "삼다수 2L", gtin: "8801234560011", price: 1200, margin: 600, qty: 3 },
    { id: 5, name: "비비고 왕교자", gtin: "8801234560028", price: 9800, margin: 4900, qty: 2 },
    { id: 6, name: "서울우유 1L", gtin: "8801234560035", price: 2600, margin: 1300, qty: 1 },
    { id: 7, name: "농심 새우깡", gtin: "8801234560042", price: 1500, margin: 750, qty: 5 },
    { id: 8, name: "CJ 햇반컵밥 불고기덮밥", gtin: "8801234560059", price: 3900, margin: 1950, qty: 2 },
    { id: 9, name: "오뚜기 진짬뽕", gtin: "8801234560066", price: 1400, margin: 700, qty: 4 },
    { id: 10, name: "코카콜라 1.5L", gtin: "8801234560073", price: 2300, margin: 1150, qty: 6 },
  ]);

  useEffect(() => {
    getCartItems().then(setItems);
  }, []);

  // ✅ 전체 선택 토글
  const [selectAll, setSelectAll] = useState(false);
  const handleSelectAll = () => {
    const newValue = !selectAll;
    setSelectAll(newValue);
    setItems((prev) =>
      prev.map((item) => ({ ...item, selected: newValue }))
    );
  };

  // ✅ 개별 선택
  const handleSelect = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  // ✅ 수량 증가
  const handleIncrease = (id) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? {
              ...it,
              qty: it.qty + 1,
              totalPrice: (it.qty + 1) * it.price,
              totalMargin: (it.qty + 1) * it.margin,
            }
          : it
      )
    );
  };
  // ✅ 수량 감소
  const handleDecrease = (id) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id && it.qty > 1
          ? {
              ...it,
              qty: it.qty - 1,
              totalPrice: (it.qty - 1) * it.price,
              totalMargin: (it.qty - 1) * it.margin,
            }
          : it
      )
    );
  };

  // ✅ 저장 / 삭제
  const handleSave = () => {
    alert("장바구니가 저장되었습니다. (API 연결 예정)");
  };

  const handleDelete = () => {
    const remaining = items.filter((it) => !it.selected);
    setItems(remaining);
  };





  
  return (
    <div className="p-6 bg-gray-50 min-h-screen flex justify-center">
      <div className="w-full max-w-7xl space-y-6">
        {/* 헤더 영역 */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">
            장바구니{" "}
            <span className="text-gray-500 text-lg">({items.length})</span>
          </h1>
          <div className="space-x-3">
            <button
              onClick={handleSave}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded"
            >
              저장
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded"
            >
              삭제
            </button>
          </div>
        </div>

        {/* 아이템 영역 */}
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
                      onChange={handleSelectAll}
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
                          onChange={() => handleSelect(item.id)}
                          className="w-5 h-5"
                        />
                        <span className="ml-12 text-gray-800"> 
                          {item.name}
                        </span>
                      </div>
                    </td>

                    {/* 수량 */}
                    <td className="text-center">
                      <div className="inline-flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleDecrease(item.id)}
                          className="border w-8 h-8 rounded flex items-center justify-center hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-medium leading-none flex items-center justify-center">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => handleIncrease(item.id)}
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
                  <td
                    colSpan="4"
                    className="text-center text-gray-400 py-6"
                  >
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
                    .reduce((sum, item) => sum + (item.totalPrice ?? item.price * item.qty), 0)
                    .toLocaleString()}
                </td>
                <td className="text-xl text-center text-gray-600">
                  {items
                    .reduce((sum, item) => sum + (item.totalMargin ?? item.margin * item.qty), 0)
                    .toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
          <BudgetProgressBar used={1800100} order={910000} budget={2000000} />
          <div className="flex justify-center mt-10 mb-8">
            <button
              className="bg-red-500 hover:bg-red-600 text-white font-bold text-xl py-4 px-20 rounded-none shadow-md transition-all duration-200"
            >
              총 {items.length}개 발주하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}