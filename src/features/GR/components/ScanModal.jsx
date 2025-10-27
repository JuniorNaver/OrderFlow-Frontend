import { useState } from "react";
import { searchPOByBarcode, createAndConfirmGR } from "../api/grApi";
import POItemListModal from "./POItemListModal";
import { useToast } from "/src/components/providers/ToastProvider"; // ✅ 전역 토스트

export default function ScanModal({ onClose, onSuccess }) {
  const [barcode, setBarcode] = useState("");
  const [poData, setPoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showItemsModal, setShowItemsModal] = useState(false);
  const { showToast } = useToast(); // ✅ 토스트 훅

  const handleSearch = async () => {
    try {
      setLoading(true);
      const data = await searchPOByBarcode(barcode);
      setPoData(data);
      showToast("✅ 발주 정보를 불러왔습니다.", "success");
    } catch {
      showToast("❌ 발주를 찾을 수 없습니다.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!poData?.poId) {
      showToast("⚠ 발주 정보가 없습니다.", "warning");
      return;
    }

    if (!confirm("입고를 확정하시겠습니까?")) return;

     try {
    // ✅ 입고 생성 + 확정 API 호출
    await createAndConfirmGR(poData.poId);

    showToast("✅ 입고가 완료되었습니다!", "success");

    // ✅ 목록 갱신 or 상위 콜백 호출
    if (typeof onSuccess === "function") onSuccess();

    // ✅ 모달 닫기
    onClose();
  } catch (err) {
    const status = err.response?.status;
    const message = err.response?.data || err.message;

    console.error("입고 확정 오류:", err);

    if (status === 409) {
      showToast("⚠ 이미 입고 처리된 발주입니다.", "warning");
    } else if (status === 400) {
      if (message.includes("창고 없음")) {
        showToast("⚠ 해당 점포의 창고가 등록되어 있지 않습니다.", "warning");
      } else if (message.includes("발주 없음")) {
        showToast("⚠ 유효하지 않은 발주 정보입니다.", "warning");
      } else {
        showToast(message || "요청이 잘못되었습니다.", "error");
      }
    } else {
      showToast("❌ 입고 확정 중 오류가 발생했습니다.", "error");
    }
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
              <p><b>발주번호:</b> {poData.externalId}</p>
              <p><b>담당자:</b> {poData.userName}</p>
              <p><b>총 금액:</b> {poData.totalAmount?.toLocaleString()}원</p>
              <p><b>상태:</b> {poData.status}</p>

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
