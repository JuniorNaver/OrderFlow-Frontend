import { useState, useEffect } from "react";
import { addItemToOrder } from "../../api/sdApi.js";
import { updateItemQuantity } from "../../api/sdApi.js";
import { deleteItemFromOrder } from "../../api/sdApi.js";

export default function SalesTable({
  currentOrder,
  onTotalChange,
  onAddItem,
  onItemsChange,
}) {
  const [items, setItems] = useState([]);
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
  // ✅ 외부에서 테이블 아이템을 일괄 주입
  window.loadSalesItems = (raw = []) => {
    const mapped = raw.map((it, idx) => ({
      id: it.no || idx,                         // SalesItem.no
      gtin: it.gtin,                            // 상품 바코드
      name: it.productName,                     // 상품명
      price: Number(it.sdPrice ?? 0),           // 판매 단가 (sdPrice = unitPrice)
      qty: Number(it.salesQuantity ?? 1),       // 수량
      stock: Number(it.stockQuantity ?? 0),     // 표시용 재고
      subtotal: Number(it.subtotal ?? 0),       // 소계 (백엔드 계산값)
    }));
    setItems(mapped);
  };

  window.clearSalesItems = () => {
    setItems([]);
  };
}, []);

  useEffect(() => {
  onItemsChange?.(items);
  const total = items.reduce((sum, it) => sum + (Number(it.price) * Number(it.qty)), 0);
  onTotalChange?.(total);
}, [items, onItemsChange, onTotalChange]);


// ✅ 상품 추가 (DB 저장 + 화면 반영)
const handleAddItem = async (product) => {
  if (!currentOrder?.orderId) {
    setShowLoading(true);
    setTimeout(() => setShowLoading(false), 1500);
    return;
  }

  try {
    const savedItem = await addItemToOrder(currentOrder.orderId, {
      gtin: product.gtin || product.id,
      quantity: 1,
      price: product.price || 0,
    });

    console.log("✅ DB 응답:", savedItem);

    setItems((prev) => {
      const existing = prev.find((it) => it.gtin === savedItem.gtin);

      if (existing) {
        const updatedOriginal = Number(savedItem.stockQuantity ?? existing.originalStock ?? 0);
        const updatedStock = Math.max(0, updatedOriginal - Number(savedItem.salesQuantity ?? (existing.qty + 1)));
        return prev.map((it) =>
          it.gtin === savedItem.gtin
            ? {
                ...it,
                qty: Number(savedItem.salesQuantity ?? (existing.qty + 1)),
                stock: updatedStock, // ✅ 서버 계산된 재고 그대로 반영
                price: savedItem.sdPrice ?? it.price,
                originalStock: updatedOriginal, // ✅ 원재고는 stockQuantity
              }
            : it
        );
      } else {
        const qty = Number(savedItem.salesQuantity ?? 1);
        const baseOriginal = Number(savedItem.stockQuantity ?? product.stock ?? 0);
        return [
          ...prev,
          {
            id: savedItem.no || savedItem.id,
            gtin: savedItem.gtin,
            name: savedItem.productName || product.productName || "상품명 미등록",
            qty,
            price: Number(savedItem.sdPrice) || product.price || 0,
            originalStock: baseOriginal,
            stock: Math.max(0, baseOriginal - qty), // ✅ 서버 값 반영
          },
        ];
      }
    });
  } catch (err) {
    console.error("❌ 상품 추가 실패:", err);
    alert("상품을 추가하지 못했습니다.");
  }
};




  // ✅ 수량 변경
 const handleQuantityChange = async (id, delta) => {
  console.log("⚡ handleQuantityChange 호출됨:", id, delta);

  setItems((prev) =>
    prev.map((item) => {
      if (item.id !== id) return item;

      let newQty = item.qty + delta;
      if (newQty < 1) return item;

       const newStock = Math.max(0, Number(item.originalStock ?? 0) - newQty);
     if (newStock < 0) {
        alert("재고 수량이 부족합니다!");
        return item;
      }

      // ✅ axios PATCH로 변경
      (async () => {
        try {
          console.log("📦 PATCH 요청 시도:", id, newQty);
          const res = await updateItemQuantity(id, newQty);
          console.log("📬 PATCH 응답 성공:", res);
        } catch (err) {
          console.error("❌ PATCH 요청 실패:", err);
        }
      })();

      return { ...item, qty: newQty, stock: newStock };
    })
  );
};



  // ✅ 상품 삭제
  const handleDeleteItem = async (itemId) => {
  if (!currentOrder?.orderId) return alert("⛔ 주문이 없습니다.");
  if (!window.confirm("이 상품을 삭제하시겠습니까?")) return;

  try {
    const updated = await deleteItemFromOrder(currentOrder.orderId, itemId);
    setItems(updated.salesItems || []);
    alert("✅ 상품이 삭제되었습니다.");
  } catch (err) {
    console.error("❌ 삭제 실패:", err);
    alert("삭제 중 오류가 발생했습니다.");
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
  // ✅ currentOrder가 생길 때마다 최신 addItemToSales 등록
      useEffect(() => {
        // 🛑 주문이 아직 생성되지 않았으면 등록하지 않음
        if (!currentOrder?.orderId) return;

        console.log("🪄 addItemToSales 등록됨 (orderId:", currentOrder.orderId, ")");

        // ✅ 전역 함수 등록
        window.addItemToSales = handleAddItem;
        window.clearSalesItems = () => {
          console.log("🧹 결제 완료 후 상품 목록 초기화");
          setItems([]);
          onTotalChange?.(0);
        };

        // ✅ 부모에게 콜백 전달
        onAddItem?.(handleAddItem);

        // ✅ 언마운트 시 정리
        return () => {
          delete window.addItemToSales;
          delete window.clearSalesItems;
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [currentOrder]);


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
