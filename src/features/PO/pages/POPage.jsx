// PO/pages/POCartPage.jsx
import React, { useEffect, useState } from "react";
import { getCartItems, updateQuantity, confirmOrder } from "../api/poApi";
import POItemList from "../components/POItemList";
import POStatusChart from "../components/POStatusChart";

export default function POCartPage() {
  const [items, setItems] = useState([]);
  const [chartData, setChartData] = useState([
    { name: "실온", value: 40 },
    { name: "냉장", value: 35 },
    { name: "냉동", value: 25 },
  ]); 

  useEffect(() => {
    getCartItems().then(setItems);
  }, []);

  const handleIncrease = (id) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, quantity: i.quantity + 1 } : i
      )
    );
  };

  const handleDecrease = (id) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id && i.quantity > 1
          ? { ...i, quantity: i.quantity - 1 }
          : i
      )
    );
  };

  const handleConfirm = async () => {
    await confirmOrder();
    alert("발주가 확정되었습니다.");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      <h1 className="text-2xl font-bold mb-4">발주 요청 장바구니</h1>
      <POItemList
        items={items}
        onIncrease={handleIncrease}
        onDecrease={handleDecrease}
      />
      <div className="grid grid-cols-2 gap-6">
        <POStatusChart data={chartData} />
        <div className="flex items-center justify-center">
          <button
            onClick={handleConfirm}
            className="px-8 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
          >
            발주 확정
          </button>
        </div>
      </div>
    </div>
  );
}