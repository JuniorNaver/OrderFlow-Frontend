import { useState } from "react";
import ScanModal from "./ScanModal";
import {
  confirmGoodsReceipt,
  cancelGoodsReceipt,
  deleteGoodsReceipt,
} from "../api/grApi";
import { useToast } from "/src/components/providers/ToastProvider";

export default function GoodsReceiptActions({ selected = [] }) {
  const [showScan, setShowScan] = useState(false);
  const { showToast } = useToast();

  /** ✅ 입고 확정 */
  const handleConfirm = async () => {
    if (selected.length === 0)
      return showToast("선택된 항목이 없습니다.", "warning");

    if (!confirm(`선택된 ${selected.length}건을 입고 확정하시겠습니까?`)) return;

    try {
      await Promise.all(selected.map((id) => confirmGoodsReceipt(id)));
      showToast("✅ 입고 확정 완료!", "success");
      window.location.reload();
    } catch (err) {
      console.error("❌ 입고 확정 중 오류:", err);
      showToast("❌ 입고 확정 중 오류가 발생했습니다.", "error");
    }
  };

  /** 🚫 발주 취소 */
  const handleCancel = async () => {
    if (selected.length === 0)
      return showToast("취소할 항목을 선택하세요.", "warning");

    const reason = prompt("취소 사유를 입력하세요 (선택):", "사용자 요청");
    if (!reason && !confirm("취소 사유 없이 진행하시겠습니까?")) return;

    try {
      await Promise.all(selected.map((id) => cancelGoodsReceipt(id, reason)));
      showToast("🚫 선택된 발주가 취소되었습니다.", "info");
      window.location.reload();
    } catch (err) {
      console.error("❌ 발주 취소 중 오류:", err);
      showToast("❌ 발주 취소 실패", "error");
    }
  };

  /** 🗑 삭제 */
  const handleDelete = async () => {
    if (selected.length === 0)
      return showToast("삭제할 항목을 선택하세요.", "warning");

    if (!confirm(`정말로 ${selected.length}건을 삭제하시겠습니까?`)) return;

    try {
      await Promise.all(selected.map((id) => deleteGoodsReceipt(id)));
      showToast("🗑 선택된 입고가 삭제되었습니다.", "success");
      window.location.reload();
    } catch (err) {
      console.error("❌ 삭제 중 오류:", err);
      showToast("❌ 삭제 실패", "error");
    }
  };

  /** 🔁 초기화 */
  const handleReset = () => {
    if (confirm("모든 선택을 초기화하시겠습니까?")) {
      window.location.reload();
    }
  };

  return (
    <>
      <div className="flex justify-between items-center border-b pb-3 mb-2">
        {/* 🔹 왼쪽 버튼 그룹 */}
        <div className="flex space-x-2">
          <button
            onClick={() => setShowScan(true)} // ✅ 스캔 모달 열기 연결
            className="px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600 shadow-sm transition"
          >
            스캔
          </button>
          <button className="px-4 py-2 bg-blue-400 text-white rounded hover:bg-blue-500 shadow-sm transition">
            내보내기
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 shadow-sm transition"
          >
            입고 확정
          </button>
        </div>

        {/* 🔹 오른쪽 버튼 그룹 */}
        <div className="flex space-x-2">
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 shadow-sm transition"
          >
            발주 취소
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-orange-400 text-white rounded hover:bg-orange-500 shadow-sm transition"
          >
            삭제
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 shadow-sm transition"
          >
            초기화
          </button>
        </div>
      </div>

      {/* 🔸 스캔 모달 */}
      {showScan && (
        <ScanModal
          onClose={() => setShowScan(false)}
          onSuccess={() => window.location.reload()}
        />
      )}
    </>
  );
}