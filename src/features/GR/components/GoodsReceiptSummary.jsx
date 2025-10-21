export default function GoodsReceiptSummary({ total, previous }) {
  return (
    <div className="bg-white rounded-md shadow px-3 py-2 text-sm text-right border">
      <p className="text-gray-600">
        이번 합계:{" "}
        <span className="text-blue-600 font-semibold">
          {total.toLocaleString()}원
        </span>
      </p>
      <p className="text-gray-600">
        총 누적:{" "}
        <span className="text-red-600 font-semibold">
          {previous.toLocaleString()}원
        </span>
      </p>
    </div>
  );
}
