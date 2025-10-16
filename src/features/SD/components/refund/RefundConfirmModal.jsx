import { useState } from "react";
import { requestRefund } from "../../api/refundApi";
import RefundStatus from "./RefundStatus";

export default function RefundConfirmModal({ onClose, reason, onRefundComplete }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleRefund = async () => {
    setLoading(true);
    try {
      const res = await requestRefund({
        impUid: "imp_1234567890",
        reason: reason || "사유 미입력", // ✅ reason 전달
        amount: 15000,
      });
      setResult(res);
      if (onRefundComplete) onRefundComplete();
    } catch {
      setResult({ success: false });
    } finally {
      setLoading(false);
    }
  };

  if (result) return <RefundStatus result={result} onClose={onClose} />;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white rounded-2xl shadow-xl w-[380px] p-6 text-center">
        <h2 className="text-xl font-bold mb-4">환불 하시겠습니까?</h2>
        {reason && (
          <p className="text-gray-300 mb-4 text-sm">
            사유: <span className="font-semibold text-white">{reason}</span>
          </p>
        )}

        <div className="flex justify-center gap-3">
          <button
            onClick={handleRefund}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
          >
            예
          </button>
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg"
          >
            아니오
          </button>
        </div>
      </div>
    </div>
  );
}
