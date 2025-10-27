import GoodsReceiptItemRow from "./GoodsReceiptItemRow";

export default function GoodsReceiptTable({ receipts, onSelect }) {
  return (
    <div className="overflow-x-auto border rounded-md shadow-sm">
      <table className="min-w-full text-sm text-center border-collapse">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="p-2 border">선택</th>
            <th className="p-2 border">입고번호</th>
            <th className="p-2 border">발주코드</th>
            <th className="p-2 border">수량</th>
            <th className="p-2 border">총 금액</th>
            <th className="p-2 border">상태</th>
            <th className="p-2 border">입고일자</th>
            <th className="p-2 border">예상 입고일</th>
            <th className="p-2 border">상세</th>
          </tr>
        </thead>

        <tbody>
          {receipts.map((r) => (
            <GoodsReceiptItemRow
              key={r.poId}
             item={{
                    poId: r.poId || r.pold,
                    externalId: r.externalId,
                    totalAmount: r.totalAmount,
                    totalQty: r.totalQty,
                    userName: r.userName,
                    status: r.status,
                    receiptDate: r.receiptDate,
                    expectedArrival: r.expectedArrival,
                  }}
              onSelect={onSelect}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
