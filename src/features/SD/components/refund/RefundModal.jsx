import { useState } from "react";
import axios from "axios";
import { fetchRefundItems } from "../../api/refundApi";

export default function RefundModal({ onClose, onRefundComplete }) {
  const [receiptNo, setReceiptNo] = useState("");
  const [items, setItems] = useState([]);
  const [reason, setReason] = useState("");
  const [storeInfo, setStoreInfo] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentId, setPaymentId] = useState(null);

  // 🔍 영수증 조회
  const handleScan = async (e) => {
    e.preventDefault();
    try {
      const data = await fetchRefundItems(receiptNo);
      console.log("📦 환불 조회 응답:", data);

      setItems(data.items || []);
      setStoreInfo({
        name: data.storeName,
        address: data.storeAddress,
      });
      setTotalAmount(data.totalAmount || 0);
      setPaymentId(data.paymentId); // ✅ paymentId 저장
    } catch (err) {
      console.error("❌ 환불 조회 오류:", err);
      alert("영수증을 찾을 수 없습니다.");
    }
  };

  // 💳 환불 실행
  // 💳 환불 실행
const handleRefund = async () => {
  if (!paymentId) {
    alert("결제 내역이 확인되지 않았습니다.");
    return;
  }

  try {
    const response = await axios.post("http://localhost:8080/api/refunds", {
      paymentId: paymentId,
      cancelAmount: totalAmount,
      reason: reason || "고객 요청 환불",
    });

    console.log("💰 환불 완료 응답:", response.data);
    alert("✅ 환불 완료: " + response.data.refundStatus);
    onRefundComplete?.(response.data);
    onClose();
  } catch (e) {
    console.error("❌ 환불 실패:", e);

    // ✅ 여기가 핵심 수정 부분
    const message =
      e.response?.data?.reason ||
      e.response?.data?.message ||
      "환불 처리 중 오류가 발생했습니다.";

    if (message.includes("이미 환불된")) {
      alert("⚠️ 이미 환불이 완료된 거래입니다.");
    } else if (message.includes("결제 내역이 존재하지 않습니다")) {
      alert("결제 내역을 찾을 수 없습니다.");
    } else {
      alert(message);
    }
  }
};

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-[420px] p-6 relative">
        <h2 className="text-xl font-bold mb-4 text-center">영수증 바코드 스캔</h2>

        {/* 바코드 입력 */}
        <form onSubmit={handleScan} className="flex gap-2 mb-4">
          <input
            value={receiptNo}
            onChange={(e) => setReceiptNo(e.target.value)}
            placeholder="영수증 번호 입력"
            className="flex-1 border rounded-lg px-3 py-2"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700"
          >
            조회
          </button>
        </form>

        {/* 점포정보 */}
        {storeInfo && (
          <div className="text-sm text-gray-600 mb-2">
            <p>🏪 {storeInfo.name}</p>
            <p className="truncate">{storeInfo.address}</p>
          </div>
        )}

        {/* 환불 사유 */}
        {items.length > 0 && (
          <div className="mb-3">
            <label className="block text-gray-700 mb-1 text-sm font-semibold">
              환불 사유
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="환불 사유를 입력하세요"
              rows="2"
              className="w-full border rounded-lg px-3 py-2 text-gray-800"
            />
          </div>
        )}

        {/* 상품 리스트 */}
        {items.length > 0 && (
          <div className="border-t pt-3 max-h-[200px] overflow-y-auto">
            {items.map((item, idx) => (
              <div
                key={item.id || item.gtin || idx}
                className="flex justify-between py-1 px-2 bg-red-50 text-red-600 rounded-md mb-1"
              >
                <span>{item.productName}</span>
                <span>
                  - ₩
                  {(
                    item.price ?? item.sdPrice ?? item.subtotal ?? 0
                  ).toLocaleString()}
                </span>
              </div>
            ))}

            {/* 총 결제금액 */}
            <div className="flex justify-between font-semibold border-t mt-2 pt-2 text-gray-800">
              <span>총 결제금액</span>
              <span>₩ {totalAmount ? totalAmount.toLocaleString() : 0}</span>
            </div>

            {/* 환불 버튼 */}
            <button
              onClick={handleRefund}
              className={`mt-3 w-full py-2 rounded-lg text-white ${
                reason.trim()
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
              disabled={!reason.trim()}
            >
              환불 진행하기
            </button>
          </div>
        )}

        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-black"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
