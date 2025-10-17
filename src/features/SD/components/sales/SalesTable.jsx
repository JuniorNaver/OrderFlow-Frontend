import { useState, useEffect } from "react";

export default function SalesTable({ onTotalChange, onAddItem }) {
  const [items, setItems] = useState([]);

  // ✅ 상품 추가 함수
  const handleAddItem = (product) => {
    if (!product?.id) return;

    setItems((prev) => {
      const existing = prev.find((it) => it.id === product.id);
      if (existing) {
        // 동일 상품이면 수량 +1, 재고 -1
        return prev.map((it) =>
          it.id === product.id
            ? { ...it, qty: it.qty + 1, stock: Math.max(0, it.stock - 1) }
            : it
        );
      }

      const safeProduct = {
        ...product,
        qty: product.qty ?? 1,
        price: Number(product.price) || 0,
        stock: product.stock ?? 0,
        originalStock: product.stock ?? 0,
      };
      return [...prev, safeProduct];
    });
  };

  // ✅ 수량 변경
  const handleQuantityChange = (id, delta) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        let newQty = item.qty + delta;
        let newStock = item.stock - delta; // 재고 반대 방향으로 변화

        if (newQty < 1) return item; // 최소 1개
        if (newStock < 0) {
          alert("재고 수량이 부족합니다!");
          return item;
        }
        if (newStock > item.originalStock) newStock = item.originalStock;

        return { ...item, qty: newQty, stock: newStock };
      })
    );
  };

  // ✅ 상품 삭제
  const handleDeleteItem = (id) => {
    if (window.confirm("이 상품을 삭제하시겠습니까?")) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // ✅ 총액 계산 → 부모로 전달
  useEffect(() => {
    const total = items.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (item.qty || 0),
      0
    );
    if (onTotalChange) onTotalChange(total);
  }, [items, onTotalChange]);

  // ✅ 외부에서 접근할 수 있게 window 등록
  useEffect(() => {
    // 상품 추가 전역 함수
    window.addItemToSales = handleAddItem;

    // ✅ 결제 완료 시 PaymentSection에서 호출하는 초기화 함수
    window.clearSalesItems = () => {
      setItems([]);
      if (onTotalChange) onTotalChange(0); // 총액도 0으로 초기화
      console.log("🧹 상품 목록 초기화 완료");
    };

    // 부모에서도 직접 전달 가능하게 등록
    if (onAddItem) onAddItem(handleAddItem);

    // cleanup
    return () => {
      delete window.addItemToSales;
      delete window.clearSalesItems;
    };
  }, [onAddItem, onTotalChange]);

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
          {items.map((item, idx) => (
            <tr
              key={item.id} // ✅ key 경고 해결
              className="border-b hover:bg-gray-50 text-gray-800"
            >
              <td className="p-3 text-center">{idx + 1}</td>
              <td className="p-3">{item.name || "이름없음"}</td>
              <td className="p-3 text-right">
                ₩{item.price ? Number(item.price).toLocaleString() : 0}
              </td>
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
              <td className="p-3 text-right">{item.stock ?? 0}</td>
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

          {items.length === 0 && (
            <tr>
              <td colSpan="6" className="text-center text-gray-400 p-4">
                상품이 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
