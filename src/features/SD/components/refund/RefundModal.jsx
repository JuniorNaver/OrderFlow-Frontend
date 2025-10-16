import { useState } from "react";
import { fetchRefundItems } from "../../api/refundApi";
import RefundVerifyModal from "./RefundVerifyModal";

export default function RefundModal({ onClose, onRefundComplete }) {
  const [receiptNo, setReceiptNo] = useState("");
  const [items, setItems] = useState([]);
  const [showVerify, setShowVerify] = useState(false);
  const [reason, setReason] = useState(""); // ✅ 환불 사유 상태 추가

  const handleScan = async (e) => {
    e.preventDefault();
    try {
      const data = await fetchRefundItems(receiptNo);
      setItems(data.items);
    } catch {
      alert("영수증을 찾을 수 없습니다.");
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
          <button className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700">
            조회
          </button>
        </form>

        {/* ✅ 환불 사유 입력 */}
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
            {items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between py-1 px-2 bg-red-50 text-red-600 rounded-md mb-1"
              >
                <span>{item.productName}</span>
                <span>- ₩{item.price.toLocaleString()}</span>
              </div>
            ))}
            <button
              onClick={() => setShowVerify(true)}
              className="mt-3 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
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

        {/* 다음 단계 */}
        {showVerify && (
          <RefundVerifyModal
            reason={reason} // ✅ reason 전달
            onClose={() => setShowVerify(false)}
            onRefundComplete={onRefundComplete}
          />
        )}
      </div>
    </div>
  );
}
