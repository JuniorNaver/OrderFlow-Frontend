import { useState, useEffect } from "react";
import { addItemToOrder } from "../../api/sdApi.js";

export default function SalesTable({
  currentOrder,
  onTotalChange,
  onAddItem,
  onItemsChange,
}) {
  const [items, setItems] = useState([]);

  // ✅ 상품 추가 (DB 저장 + 화면 반영)
  const handleAddItem = async (product) => {
    const productId = product.id || product.gtin;
    if (!productId || !currentOrder?.orderId) return;

    try {
      // ✅ DB에 SalesItem insert (선반영)
      const savedItem = await addItemToOrder(currentOrder.orderId, {
        gtin: product.gtin || product.id,
        quantity: 1,
        price: product.price || 0,
      });

      console.log("✅ DB 저장 완료:", savedItem);

      // ✅ UI 반영
      setItems((prev) => {
        const existing = prev.find((it) => it.gtin === productId || it.id === productId);
        if (existing) {
          return prev.map((it) =>
            it.gtin === productId || it.id === productId
              ? { ...it, qty: it.qty + 1, stock: Math.max(0, it.stock - 1) }
              : it
          );
        }

        const safeProduct = {
          id: savedItem.id || productId,
          gtin: product.gtin || productId,
          name: product.name || product.productName || "상품명 미등록",
          qty: product.qty ?? 1,
          price: Number(product.price) || Number(savedItem.sdPrice) || 0,
          stock: savedItem.stockQuantity ?? product.stock ?? 0,
          originalStock: savedItem.stockQuantity ?? product.stock ?? 0,
        };
        return [...prev, safeProduct];
      });
    } catch (err) {
      console.error("❌ 상품 추가 실패:", err);
      alert("상품을 추가하지 못했습니다.");
    }
  };

  // ✅ 수량 변경
  const handleQuantityChange = (id, delta) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        let newQty = item.qty + delta;
        let newStock = item.stock - delta;

        if (newQty < 1) return item;
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

  // ✅ 전역 함수 등록 (바코드/검색 등에서 접근)
  useEffect(() => {
    window.addItemToSales = handleAddItem;

    if (!window.clearSalesItems) {
      window.clearSalesItems = () => {
        console.log("🧹 결제 완료 후 상품 목록 초기화");
        setItems([]);
        if (onTotalChange) onTotalChange(0);
      };
    }

    if (onAddItem) onAddItem(handleAddItem);

    return () => {
      delete window.addItemToSales;
    };
  }, [onAddItem, onTotalChange, currentOrder]);

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
            <tr key={item.id || item.gtin} className="border-b hover:bg-gray-50 text-gray-800">
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
