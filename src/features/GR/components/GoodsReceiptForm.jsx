export default function GoodsReceiptForm({ onSearch }) {
  return (
    <div className="w-full space-y-3">
      {/* 🔹 1행: 검색 + 검색버튼 */}
      <div className="flex items-center justify-start space-x-2">
        <input
          type="text"
          placeholder="상품명, 상품코드, 매입상품명"
          className="border rounded px-3 py-2 w-80"
        />
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          검색
        </button>
      </div>

      {/* 🔹 2행: 등록 + 기간 + 조회 */}
      <div className="flex items-center space-x-3">
        <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
          등록
        </button>

        <span className="text-gray-600">기간</span>
        <input
          type="date"
          className="border rounded px-2 py-1 text-sm"
        />
        <span>~</span>
        <input
          type="date"
          className="border rounded px-2 py-1 text-sm"
        />

        <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
          조회
        </button>
      </div>

      {/* 🔹 밑줄 구분선 */}
      <div className="border-t border-gray-200 pt-3" />
    </div>
  );
}