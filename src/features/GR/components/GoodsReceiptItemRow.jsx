export default function GoodsReceiptItemRow({ item, onSelect }) {
  const handleSelect = (e) => {
    const checked = e.target.checked;
    onSelect((prev) => {
      if (checked) {
        // ✅ 이미 선택된 항목이면 중복 추가 방지
        return prev.includes(item.id) ? prev : [...prev, item.id];
      } else {
        // ✅ 체크 해제 시 목록에서 제거
        return prev.filter((id) => id !== item.id);
      }
    });
  };

  const statusColor =
    {
      출고: "bg-blue-500",
      취소: "bg-red-500",
      도착: "bg-green-500",
      대기: "bg-gray-400",
      CONFIRMED: "bg-green-500", // ✅ 백엔드 ENUM 대응
      PENDING: "bg-gray-400",
      RECEIVED: "bg-blue-500",
      CANCELED: "bg-red-500",
    }[item.status] || "bg-gray-300";

  return (
    <tr className="hover:bg-gray-50 transition">
      {/* ✅ 체크박스 */}
      <td className="p-2 border">
        <input
          type="checkbox"
          onChange={handleSelect}
          className="cursor-pointer w-4 h-4"
        />
      </td>

      {/* ✅ 주요 정보 */}
      <td className="p-2 border">{item.id}</td>
      <td className="p-2 border">{item.poId || "-"}</td>
      <td className="p-2 border">{item.receiptNo || "-"}</td>
      <td className="p-2 border">{item.qty || 0}</td>
      <td className="p-2 border">{item.totalAmount?.toLocaleString() || 0}</td>

      {/* ✅ 상태 */}
      <td className="p-2 border">
        <span
          className={`text-white px-2 py-1 rounded text-xs ${statusColor}`}
        >
          {item.status || "대기"}
        </span>
      </td>

      {/* ✅ 날짜 정보 */}
      <td className="p-2 border">{item.receiptDate || "-"}</td>
      <td className="p-2 border">{item.expectedDate || "-"}</td>

      {/* ✅ 편집 버튼 */}
      <td className="p-2 border">
        <button
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => alert(`🧾 [${item.id}] 편집 기능은 준비 중입니다.`)}
        >
          편집
        </button>
      </td>
    </tr>
  );
}