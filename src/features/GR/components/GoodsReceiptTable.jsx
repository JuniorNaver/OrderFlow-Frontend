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
            <th className="p-2 border">입고명</th>
            <th className="p-2 border">수량</th>
            <th className="p-2 border">총 금액</th>
            <th className="p-2 border">상태</th>
            <th className="p-2 border">입고일자</th>
            <th className="p-2 border">예상 입고일</th>
            <th className="p-2 border">편집</th>
          </tr>
        </thead>

        <tbody>
          {receipts.map((r) => (
            <GoodsReceiptItemRow
              key={r.poId}               // ✅ key 필수
              item={{
                id: r.poId,
                poId: r.poId,
                externalId: r.externalId,
                totalAmount: r.totalAmount,
                userName: r.userName,
                status: r.status,
                receiptDate: r.receiptDate,
              }}
              onSelect={onSelect}        // ✅ 부모에서 받은 onSelect 전달
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
