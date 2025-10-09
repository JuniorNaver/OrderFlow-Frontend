export default function RefundTable({ items, quantities, onChange }) {
  return (
    <div className="overflow-auto border rounded-2xl">
      <table className="min-w-full text-left">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3">상품명</th>
            <th className="px-4 py-3">단가</th>
            <th className="px-4 py-3">환불가능</th>
            <th className="px-4 py-3">환불수량</th>
          </tr>
        </thead>
        <tbody>
          {items.map(it => (
            <tr key={it.paymentItemId} className="border-t">
              <td className="px-4 py-2">{it.productName}</td>
              <td className="px-4 py-2">{it.unitPrice.toLocaleString()}원</td>
              <td className="px-4 py-2">{it.refundableQty}</td>
              <td className="px-4 py-2">
                <input
                  type="number"
                  min={0}
                  max={it.refundableQty}
                  value={quantities[it.paymentItemId] || 0}
                  onChange={e =>
                    onChange(it.paymentItemId, Number(e.target.value))
                  }
                  className="w-20 border rounded-lg px-2 py-1"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}