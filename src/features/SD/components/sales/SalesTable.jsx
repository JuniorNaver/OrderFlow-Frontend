import { useState, useEffect } from "react";

export default function SalesTable({onTotalChange, onAddItem}) {
  const [items, setItems] = useState([]);

  const handleAddItem = (product) => {
    const newItems = [...items, product];
    setItems(newItems);
  };

  useEffect(() => {
    const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    onTotalChange(total);
  }, [items, onTotalChange]);

  // ✅ 부모가 이 함수를 쓸 수 있도록 전달
  useEffect(() => {
    if (onAddItem) onAddItem(handleAddItem);
  }, [onAddItem]);

 const handleQuantityChange = (id, delta) => {
  setItems((prev) =>
    prev.map((item) => {
      if (item.id !== id) return item;

      let newQty = item.qty + delta;
      let newStock = item.stock - delta; // 🔹 재고는 반대로 움직임

      // 🚫 최소값 제한
      if (newQty < 1) return item;

      // 🚫 재고 부족 시 차단
      if (newStock < 0) {
        alert("재고 수량이 부족합니다!");
        return item;
      }

      // 🚫 재고 초과 회복 방지 (즉, 재고 원래 수량 이상으로 증가 못하게)
      if (newStock > item.originalStock) {
        newStock = item.originalStock;
      }

      return {
        ...item,
        qty: newQty,
        stock: newStock,
      };
    })
  );
};
   // ✅ 상품 삭제
  const handleDeleteItem = (id) => {
    if (window.confirm("이 상품을 삭제하시겠습니까?")) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
   <div className="bg-white shadow-xl rounded-2xl p-6">
      <table className="w-full border-collapse text-lg">
        <thead className="border-b bg-gray-100 text-gray-700 font-semibold">
          <tr>
            <th className="p-3 text-left w-[60px]">NO</th>
            <th className="p-3 text-left">제품명</th>
            <th className="p-3 text-right w-[120px]">단가</th>
            <th className="p-3 text-center w-[160px]">수량</th>
            <th className="p-3 text-right w-[80px]">재고</th>
            <th className="p-3 text-center w-[80px]">삭제</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b hover:bg-gray-50 text-gray-800">
              <td className="p-3">{item.id}</td>
              <td className="p-3">{item.name}</td>
              <td className="p-3 text-right">₩{item.price.toLocaleString()}</td>
              <td className="p-3 text-center">
                <div className="flex justify-center items-center gap-3">
                  <button
                    onClick={() => handleQuantityChange(item.id, -1)}
                    className="px-3 py-1.5 bg-gray-200 rounded-md hover:bg-gray-300 text-lg"
                  >
                    -
                  </button>
                  <span className="w-[30px] text-center">{item.qty}</span>
                  <button
                    onClick={() => handleQuantityChange(item.id, +1)}
                    className="px-3 py-1.5 bg-gray-200 rounded-md hover:bg-gray-300 text-lg"
                  >
                    +
                  </button>
                </div>
              </td>
              <td className="p-3 text-right">{item.stock}</td>
              <td className="p-3 text-center">
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition"
                >
                  X
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}