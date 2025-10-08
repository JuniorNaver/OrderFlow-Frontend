import { useState } from "react";

export default function SalesTable() {
  const [items, setItems] = useState([
    { id: 1, name: "햇반(100g) 01584123", price: 1000, stock: 5, qty: 0 },
    { id: 2, name: "코카콜라(500ml) 02847412", price: 2000, stock: 7, qty: 0 },
    { id: 3, name: "삼다수(2L) 03847412", price: 1500, stock: 10, qty: 0 },
    { id: 4, name: "진라면(매운맛) 04589612", price: 1200, stock: 8, qty: 0 },
  ]);

  const handleQuantityChange = (id, delta) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              qty: Math.max(0, item.qty + delta),
              stock: Math.max(0, item.stock - delta),
            }
          : item
      )
    );
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}