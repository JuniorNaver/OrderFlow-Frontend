import React, { useEffect, useState } from "react";
import { getCartItems } from "../api/poApi";
import POItemList from "../components/POItemList";

export default function POPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    getCartItems().then(setItems);
  }, []);

  // 전체 선택 토글
  const [selectAll, setSelectAll] = useState(false);
  const handleSelectAll = () => {
    const newValue = !selectAll;
    setSelectAll(newValue);
    setItems((prev) =>
      prev.map((item) => ({ ...item, selected: newValue }))
    );
  };

  // 개별 선택
  const handleSelect = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  // 선택된 항목 삭제
  const handleDeleteSelected = () => {
    setItems((prev) => prev.filter((item) => !item.selected));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      <h1 className="text-2xl font-bold mb-4">장바구니</h1>

      {/* 상단 헤더 */}
      <div className="bg-white p-4 rounded-xl shadow">
        <div className="grid grid-cols-4 font-semibold border-b pb-2 mb-2">
          <div className="col-span-2 flex items-center gap-3">
            <div className="bg-white p-4  min-w-[700px]">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAll}
            />
            <span
              onClick={handleDeleteSelected}
              className="cursor-pointer text-red-500 hover:underline"
            >
              전체선택 | 삭제
            </span>
            </div>
          </div>
          <div className="text-center">매입가</div>
          <div className="text-center">예상 마진</div>
        </div>

        {/* 아이템 목록 */}
        <POItemList items={items} onSelect={handleSelect} />
      </div>
    </div>
  );
}