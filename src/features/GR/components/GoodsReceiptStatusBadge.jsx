export default function GoodsReceiptStatusBadge({ status }) {
  const color =
    {
      출고: "bg-blue-500",
      도착: "bg-green-500",
      대기: "bg-gray-400",
      취소: "bg-red-500",
    }[status] || "bg-gray-300";

  return (
    <span
      className={`text-white text-xs font-semibold px-2 py-1 rounded ${color}`}
    >
      {status}
    </span>
  );
}