import { useEffect, useState } from "react";
import GoodsReceiptForm from "../components/GoodsReceiptForm";
import GoodsReceiptActions from "../components/GoodsReceiptActions";
import GoodsReceiptTable from "../components/GoodsReceiptTable";
import GoodsReceiptSummary from "../components/GoodsReceiptSummary";
import { fetchGoodsReceipts } from "../api/grApi";

export default function GRPage() {
  const [receipts, setReceipts] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchGoodsReceipts();
        console.log("📦 fetchGoodsReceipts 응답:", data);
        setReceipts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ 입고 데이터 조회 실패:", err);
        setReceipts([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="flex justify-center mt-6 mb-10">
      {/* 💡 훨씬 시원한 폭 (화면의 90%) */}
      <div className="bg-white rounded-xl shadow-lg p-8 relative space-y-6 min-h-[75vh] w-[90vw] max-w-[1600px]">
        
        {/* 💰 오른쪽 상단 합계 */}
        <div className="absolute top-8 right-10">
          <GoodsReceiptSummary total={249000000} previous={249000000} />
        </div>

        {/* 🔍 검색/등록/조회 */}
        <GoodsReceiptForm onSearch={setReceipts} />

        {/* 🔸 버튼 영역 */}
        <GoodsReceiptActions selected={selected} />

        {/* 📋 테이블 */}
        <div className="pt-4">
          {loading ? (
            <p className="text-gray-500 text-center py-8">⏳ 불러오는 중...</p>
          ) : receipts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              등록된 입고 내역이 없습니다.
            </p>
          ) : (
            <GoodsReceiptTable receipts={receipts} onSelect={setSelected} />
          )}
        </div>
      </div>
    </div>
  );
}
