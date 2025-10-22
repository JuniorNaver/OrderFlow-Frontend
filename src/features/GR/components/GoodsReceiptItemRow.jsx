
export default function GoodsReceiptItemRow({ item, onSelect }) {
  const handleSelect = () => onSelect((prev) => [...prev, item.id]);

  const statusColor = {
    출고: "bg-blue-500",
    취소: "bg-red-500",
    도착: "bg-green-500",
    대기: "bg-gray-400",
  }[item.status] || "bg-gray-300";

  return (
    <tr className="hover:bg-gray-50 transition">
      <td className="p-2 border">
        <input type="checkbox" onChange={handleSelect} />
      </td>
      <td className="p-2 border">{item.id}</td>
      <td className="p-2 border">{item.poId || "-"}</td>
      <td className="p-2 border">{item.receiptNo || "-"}</td>
      <td className="p-2 border">{item.qty || 0}</td>
      <td className="p-2 border">{item.totalAmount?.toLocaleString() || 0}</td>
      <td className="p-2 border">
        <span
          className={`text-white px-2 py-1 rounded text-xs ${statusColor}`}
        >
          {item.status || "대기"}
        </span>
      </td>
      <td className="p-2 border">{item.receiptDate || "-"}</td>
      <td className="p-2 border">{item.expectedDate || "-"}</td>
      <td className="p-2 border">
        <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
          편집
        </button>
      </td>
    </tr>
  );
}