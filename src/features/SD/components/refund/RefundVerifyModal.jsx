import { useState } from "react";
import RefundConfirmModal from "./RefundConfirmModal";
import { verifyRefundInfo } from "../../api/refundApi";

export default function RefundVerifyModal({ onClose, reason, onRefundComplete }) {
  const [cardNo, setCardNo] = useState("");
  const [verified, setVerified] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleVerify = async () => {
    try {
      const res = await verifyRefundInfo({ cardNo });
      if (res.verified) {
        setVerified(true);
        setShowConfirm(true);
      } else {
        alert("결제정보가 일치하지 않습니다.");
      }
    } catch {
      alert("검증 실패");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white rounded-2xl shadow-xl w-[400px] p-6">
        <h2 className="text-xl font-bold mb-3 text-center">결제정보 확인</h2>

        <input
          type="text"
          value={cardNo}
          onChange={(e) => setCardNo(e.target.value)}
          placeholder="카드번호 / 간편결제 ID 입력"
          className="w-full px-3 py-2 rounded-lg text-black"
        />

        <button
          onClick={handleVerify}
          className="mt-4 w-full bg-blue-600 py-2 rounded-lg hover:bg-blue-700"
        >
          검증하기
        </button>

        <button
          onClick={onClose}
          className="mt-2 w-full bg-gray-700 py-2 rounded-lg hover:bg-gray-600"
        >
          닫기
        </button>

        {showConfirm && (
          <RefundConfirmModal
            reason={reason} // ✅ 전달
            onClose={() => setShowConfirm(false)}
            onRefundComplete={onRefundComplete}
          />
        )}
      </div>
    </div>
  );
}
