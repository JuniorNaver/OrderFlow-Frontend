// features/PR/components/OrderForm.jsx
import { useState } from "react";

/**
 * @param {{ onAdd:(line:{productCode:string, qty:number})=>void }} props
 */
export default function OrderForm({ onAdd = () => {} }) {  // 🔹 기본값으로 no-op
  const [productCode, setProductCode] = useState("");
  const [qty, setQty] = useState(1);

  const addLine = (e) => {
    e.preventDefault();
    if (!productCode || qty <= 0) return;   // 간단 검증
    onAdd({ productCode, qty });            // 🔹 여기서 실제로 호출
    setProductCode("");
    setQty(1);
  };

  return (
    <form onSubmit={addLine} className="flex gap-2">
      <input
        className="border p-2 rounded-lg"
        placeholder="상품코드"
        value={productCode}
        onChange={(e) => setProductCode(e.target.value)}
      />
      <input
        type="number"
        min={1}
        className="border p-2 rounded-lg w-24 text-right"
        value={qty}
        onChange={(e) => setQty(Number(e.target.value))}
      />
      <button type="submit" className="px-4 py-2 rounded-xl border">
        행 추가
      </button>
    </form>
  );
}

