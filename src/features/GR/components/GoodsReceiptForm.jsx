import { useState } from "react";
import { searchGoodsReceipts } from "../api/grApi"; // ✅ 백엔드 API 불러오기

export default function GoodsReceiptForm({ onSearch }) {
  // ✅ 상태 관리
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  /** 🔍 검색 실행 */
  const handleSearch = async () => {
    try {
      const result = await searchGoodsReceipts(searchTerm, startDate, endDate);
      // ✅ 부모 컴포넌트로 검색 결과 전달
      onSearch(result.data);
    } catch (err) {
      console.error("검색 중 오류 발생:", err);
      alert("검색 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* 🔹 1행: 검색 + 검색버튼 */}
      <div className="flex items-center justify-start space-x-2">
        <input
          type="text"
          placeholder="상품명, 상품코드, 매입상품명"
          className="border rounded px-3 py-2 w-80"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          검색
        </button>
      </div>

      {/* 🔹 2행: 등록 + 기간 + 조회 */}
      <div className="flex items-center space-x-3">
        <span className="text-gray-600">기간</span>
        <input
          type="date"
          className="border rounded px-2 py-1 text-sm"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <span>~</span>
        <input
          type="date"
          className="border rounded px-2 py-1 text-sm"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          조회
        </button>
      </div>

      {/* 🔹 밑줄 구분선 */}
      <div className="border-t border-gray-200 pt-3" />
    </div>
  );
}
