import { useState } from "react";
import { searchPOByBarcode, createAndConfirmGR } from "../api/grApi";
import POItemListModal from "./POItemListModal";

export default function ScanModal({ onClose, onSuccess }) {
  const [barcode, setBarcode] = useState("");
  const [poData, setPoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showItemsModal, setShowItemsModal] = useState(false);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const data = await searchPOByBarcode(barcode);
      setPoData(data);
    } catch {
      alert("❌ 발주를 찾을 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!poData?.poId) return alert("발주 정보가 없습니다.");
    if (!confirm("입고를 확정하시겠습니까?")) return;

    try {
      await createAndConfirmGR(poData.poId);
      alert("✅ 입고가 완료되었습니다!");
      onSuccess();
    } catch (err) {
      alert("❌ 입고 확정 실패: " + err.message);
    }
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 w-[500px]">
          <h2 className="text-xl font-bold mb-4 text-gray-800">📦 바코드 스캔</h2>

          <input
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="발주 바코드 입력 또는 스캔"
            className="w-full border rounded px-3 py-2 mb-3"
          />

          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            {loading ? "조회 중..." : "조회"}
          </button>

          {poData && (
            <div className="mt-4 border-t pt-3 space-y-2">
              <p><b>발주번호:</b> {poData.poBarcode}</p>
              <p><b>담당자:</b> {poData.userName}</p>
              <p><b>총 금액:</b> {poData.totalAmount?.toLocaleString()}원</p>
              <p><b>상태:</b> {poData.status}</p>

              {/* ✅ 상세보기 버튼 */}
              <button
                onClick={() => setShowItemsModal(true)}
                className="mt-3 w-full bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300"
              >
                🔍 상세보기
              </button>
            </div>
          )}

          <button
            onClick={onClose}
            className="mt-4 w-full bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300"
          >
            닫기
          </button>
        </div>
      </div>

      {/* ✅ 품목 상세 모달 */}
      {showItemsModal && (
        <POItemListModal
          items={poData?.items || []}
          onConfirm={handleConfirm}
          onClose={() => setShowItemsModal(false)}
        />
      )}
    </>
  );
}
