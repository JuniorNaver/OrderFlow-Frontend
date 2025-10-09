import { useState } from "react";
import RefundTable from "./RefundTable";
import RefundReason from "./RefundReason";
import RefundSummary from "./RefundSummary";
import { getEligibleRefundItems, previewRefund, createRefund } from "../../api/refundApi";

export default function RefundView({ onClose }) {
  const [receiptId, setReceiptId] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [eligible, setEligible] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [reason, setReason] = useState("");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await getEligibleRefundItems({ receiptId, paymentId });
      setEligible(data);
      const init = {};
      data.items.forEach(i => (init[i.paymentItemId] = 0));
      setQuantities(init);
    } finally {
      setLoading(false);
    }
  };

  const handleQtyChange = (id, qty) => {
    setQuantities(prev => ({ ...prev, [id]: qty }));
  };

  const handlePreview = async () => {
    const items = Object.entries(quantities)
      .filter(([_, q]) => q > 0)
      .map(([paymentItemId, refundQty]) => ({ paymentItemId, refundQty }));

    const result = await previewRefund({ paymentId, reason, items });
    setPreview(result);
  };

  const handleSubmit = async () => {
    const items = Object.entries(quantities)
      .filter(([_, q]) => q > 0)
      .map(([paymentItemId, refundQty]) => ({ paymentItemId, refundQty }));

    const result = await createRefund({ paymentId, reason, items });
    alert(`환불 완료! 금액: ${result.finalRefund.toLocaleString()}원`);
    onClose();
  };

  return (
    <div>
      {/* 검색 영역 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <input
          className="border rounded-xl px-3 py-2"
          placeholder="영수증번호"
          value={receiptId}
          onChange={e => setReceiptId(e.target.value)}
        />
        <input
          className="border rounded-xl px-3 py-2"
          placeholder="결제번호"
          value={paymentId}
          onChange={e => setPaymentId(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white rounded-xl py-2 font-semibold"
          onClick={handleSearch}
          disabled={loading}
        >
          조회
        </button>
      </div>

      {eligible && (
        <>
          <RefundTable items={eligible.items} quantities={quantities} onChange={handleQtyChange} />
          <div className="grid grid-cols-3 gap-6 mt-6">
            <div className="col-span-2">
              <RefundReason value={reason} onChange={setReason} />
            </div>
            <RefundSummary
              preview={preview}
              onPreview={handlePreview}
              onSubmit={handleSubmit}
              disabled={loading}
            />
          </div>
        </>
      )}
    </div>
  );
}