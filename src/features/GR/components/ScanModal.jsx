import { useState } from "react";
import { searchPOByBarcode, createAndConfirmGR } from "../api/grApi";

export default function ScanModal({ onClose, onSuccess }) {
  const [barcode, setBarcode] = useState("");
  const [poData, setPoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await searchPOByBarcode(barcode);
      setPoData(res);
    } catch (err) {
      setError("발주 정보를 찾을 수 없습니다.");
      setPoData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!poData) return;
    try {
      await createAndConfirmGR(poData.poId);
      alert("✅ 입고 확정 완료!");
      onSuccess();
      onClose();
    } catch (err) {
      alert("❌ 입고 확정 중 오류 발생");
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[500px]">
        <h2 className="text-xl font-semibold mb-4">📦 바코드 스캔</h2>

        <input
          type="text"
          className="w-full border rounded px-3 py-2 mb-3"
          placeholder="바코드 번호를 스캔하거나 입력하세요"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          autoFocus
        />

        <button
          onClick={handleSearch}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          조회
        </button>

        {loading && <p className="text-center text-gray-500 mt-2">🔍 조회 중...</p>}
        {error && <p className="text-center text-red-500 mt-2">{error}</p>}

        {poData && (
          <div className="mt-4 border-t pt-3 space-y-2">
            <p><b>발주번호:</b> {poData.poId}</p>
            <p><b>공급처:</b> {poData.supplierName}</p>
            <p><b>총 금액:</b> {poData.totalAmount?.toLocaleString()}원</p>
            <p><b>상태:</b> {poData.status}</p>

            <button
              onClick={handleConfirm}
              className="mt-3 w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
            >
              ✅ 입고 확정
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
