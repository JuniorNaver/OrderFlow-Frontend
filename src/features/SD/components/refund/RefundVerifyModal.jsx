import { useState } from "react";
import { verifyRefundInfo, verifyEasyPayRefund } from "../../api/refundApi";

export default function RefundVerifyModal({
  onClose,
  reason,
  paymentMethod,
  impUid,
  onRefundComplete,
}) {
  const [cardNo, setCardNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    try {
      setLoading(true);
      let verified = false;

      if (paymentMethod === "CARD") {
        const res = await verifyRefundInfo({ cardNo });
        verified =
          res?.verified === true ||
          res?.result === "OK" ||
          res?.status === "SUCCESS";
      } else if (paymentMethod === "EASY") {
        const res = await verifyEasyPayRefund(impUid);
        verified =
          res?.verified === true ||
          res?.status === "paid" ||
          res?.result === "OK";
      }

      if (verified) {
        alert("✅ 결제정보 검증 완료! 환불을 진행합니다.");
        onRefundComplete(); // ✅ 여기서만 환불 실행됨
      } else {
        alert("❌ 결제정보가 일치하지 않습니다.");
      }
    } catch (err) {
      console.error("❌ 검증 실패:", err);
      setError("서버 검증 실패: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[3000]">
      <div className="bg-white rounded-2xl p-6 shadow-2xl w-[400px] text-gray-900">
        <h2 className="text-xl font-bold mb-4 text-center">결제정보 검증</h2>

        {paymentMethod === "CARD" && (
          <>
            <p className="text-sm text-gray-700 mb-2">
              카드 결제의 경우 카드번호 마지막 4자리를 입력하세요.
            </p>
            <input
              type="text"
              value={cardNo}
              onChange={(e) => setCardNo(e.target.value)}
              placeholder="마지막 4자리"
              className="w-full border rounded-lg px-3 py-2 mb-3"
            />
          </>
        )}

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <button
          onClick={handleVerify}
          disabled={loading || (paymentMethod === "CARD" && !cardNo)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
        >
          {loading ? "검증 중..." : "검증하기"}
        </button>

        <button
          onClick={onClose}
          className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 mt-3 py-2 rounded-lg"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
