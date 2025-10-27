export default function GoodsReceiptItemRow({ item, onSelect }) {
  const handleSelect = (e) => {
    const checked = e.target.checked;
    const targetId = item.grHeaderId ?? item.poId; // ✅ 입고ID 우선, 없으면 발주ID fallback

    onSelect((prev) => {
      if (checked) {
        // ✅ 중복 방지
        return prev.includes(targetId) ? prev : [...prev, targetId];
      } else {
        // ✅ 해제 시 제거
        return prev.filter((id) => id !== targetId);
      }
    });
  };

  // ✅ 상태별 색상
  const statusColor =
    {
      CONFIRMED: "bg-green-500",
      PENDING: "bg-gray-400",
      RECEIVED: "bg-blue-500",
      CANCELED: "bg-red-500",
    }[item.status] || "bg-gray-300";

  return (
    <tr className="hover:bg-gray-50 transition">
      {/* ✅ 선택 */}
      <td className="p-2 border text-center">
        <input
          type="checkbox"
          onChange={handleSelect}
          className="cursor-pointer w-4 h-4"
        />
      </td>

      {/* ✅ 입고번호 (없을 경우 - 표시) */}
      <td className="p-2 border text-center">
        {item.poId ?? "-"}
      </td>

      {/* ✅ 발주코드 */}
      <td className="p-2 border text-center">
        {item.externalId || "-"}
      </td>

      {/* ✅ 수량 (입고가 아직 없으면 0) */}
      <td className="p-2 border text-right">
        {item.totalQty ?? 0}
      </td>

      {/* ✅ 총 금액 */}
      <td className="p-2 border text-right">
        {item.totalAmount?.toLocaleString() ?? 0}
      </td>

      {/* ✅ 상태 */}
      <td className="p-2 border text-center">
        <span className={`text-white px-2 py-1 rounded text-xs ${statusColor}`}>
          {item.status || "PENDING"}
        </span>
      </td>

      {/* ✅ 입고일자 / 예상입고일 */}
      <td className="p-2 border text-center">
        {item.receiptDate ?? "-"}
      </td>
      <td className="p-2 border text-center">
        {item.expectedArrival ?? "-"}
      </td>

      {/* ✅ 편집 버튼 */}
      <td className="p-2 border text-center">
        <button
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() =>
            alert(
              `🧾 [${
                item.grHeaderId ?? item.poId
              }] (${item.poExternalId || "-"}) 상세 기능은 준비 중입니다.`
            )
          }
        >
          상세
        </button>
      </td>
    </tr>
  );
}
