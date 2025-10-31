import { useEffect } from "react";
import { addItemToOrder, updateItemQuantity, deleteItemFromOrder } from "../../api/sdApi";
import { useLoading } from "/src/components/providers/LoadingProvider";
import { useToast } from "/src/components/providers/ToastProvider";

export default function SalesTable({
  currentOrder,
  items,                // ✅ 부모에서 내려온 상태 (유일한 소스)
  onItemsChange,        // ✅ 부모에게 변경 전달
  onTotalChange,
}) {
  const { showLoading, hideLoading } = useLoading();
  const { showToast } = useToast();

  // ✅ 총액 계산 (렌더링 시마다 자동 반영)
  useEffect(() => {
    const total = items.reduce(
      (sum, it) => sum + (Number(it.price) || 0) * (it.qty || 0),
      0
    );
    onTotalChange?.(total);
  }, [items, onTotalChange]);

  // ✅ 상품 추가 (검색/바코드 공용)
  const handleAddItem = async (product) => {
    if (!currentOrder?.orderId) return showToast("⛔ 주문이 없습니다.", "error");

    try {
      showLoading("상품 추가 중...");
      const saved = await addItemToOrder(currentOrder.orderId, {
        gtin: product.gtin || product.id,
        quantity: 1,
      });
      hideLoading();

      // ✅ 부모 상태 갱신
      onItemsChange((prev) => {
        const existing = prev.find((it) => it.gtin === saved.gtin);
        const price = Number(saved.unitPrice ?? saved.sdPrice ?? product.price ?? 0);

        if (existing) {
          return prev.map((it) =>
            it.gtin === saved.gtin
              ? {
                  ...it,
                  qty: saved.salesQuantity ?? it.qty + 1,
                  stock: saved.stockQuantity ?? it.stock,
                  price,
                  subtotal: saved.subtotal ?? price * (it.qty + 1),
                }
              : it
          );
        }

        return [
          ...prev,
          {
            id: saved.no || saved.id,
            gtin: saved.gtin,
            name: saved.productName || product.productName || "상품명 미등록",
            qty: saved.salesQuantity ?? 1,
            price,
            stock: saved.stockQuantity ?? 0,
            subtotal: saved.subtotal ?? price,
          },
        ];
      });
    } catch (err) {
      hideLoading();
      console.error("❌ 상품 추가 실패:", err);
      showToast("상품 추가 중 오류 발생 ❌", "error");
    }
  };

  // ✅ 수량 변경
  const handleQuantityChange = async (id, delta) => {
    const target = items.find((it) => it.id === id);
    if (!target) return;
    const newQty = target.qty + delta;
    if (newQty < 1) return showToast("⚠️ 최소 수량은 1개입니다.", "warning");

    try {
      const res = await updateItemQuantity(id, newQty);

      onItemsChange((prev) =>
        prev.map((it) =>
          it.id === id
            ? {
                ...it,
                qty: res.salesQuantity ?? newQty,
                stock: res.stockQuantity ?? it.stock,
                price: Number(res.unitPrice ?? it.price),
                subtotal:
                  Number(res.subtotal) ??
                  Number(res.unitPrice ?? it.price) * newQty,
              }
            : it
        )
      );
    } catch (err) {
      console.error("❌ 수량 변경 실패:", err);
      showToast("수량 변경 중 오류 발생 ❌", "error");
    }
  };

  // ✅ 상품 삭제
  const handleDeleteItem = async (itemId) => {
    if (!currentOrder?.orderId) return showToast("⛔ 주문이 없습니다.", "error");
    if (!window.confirm("이 상품을 삭제하시겠습니까?")) return;

    try {
      await deleteItemFromOrder(currentOrder.orderId, itemId);
      onItemsChange((prev) => prev.filter((it) => it.id !== itemId));
      showToast("✅ 상품이 삭제되었습니다.", "success");
    } catch (err) {
      console.error("❌ 삭제 실패:", err);
      showToast("삭제 중 오류 ❌", "error");
    }
  };

  // ✅ 전역 등록 (검색/바코드용)
  useEffect(() => {
    if (!currentOrder?.orderId) return;
    window.addItemToSales = handleAddItem;

    return () => {
      delete window.addItemToSales;
    };
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
          {items.length > 0 ? (
            items.map((item, idx) => (
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
            ))
          ) : (
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
