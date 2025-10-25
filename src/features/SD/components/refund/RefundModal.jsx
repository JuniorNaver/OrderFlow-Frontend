import { useState } from "react";
import {
  fetchRefundItems,
  verifyRefundInfo,
  verifyEasyPayRefund,
  requestRefund, // ✅ 추가
} from "../../api/refundApi"; // ApiClient 기반 API 파일 사용

export default function RefundModal({ onClose, onRefundComplete }) {
  const [receiptNo, setReceiptNo] = useState("");
  const [items, setItems] = useState([]);
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [storeInfo, setStoreInfo] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentId, setPaymentId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [impUid, setImpUid] = useState(null);
  const [cardNumber, setCardNumber] = useState("");

  const refundReasons = [
    { label: "상품 불량", value: "DEFECTIVE" },
    { label: "유통기한 문제", value: "EXPIRED" },
    { label: "단순 변심", value: "CUSTOMER_CHANGE" },
    { label: "결제 오류", value: "PAYMENT_ERROR" },
    { label: "중복 결제", value: "DUPLICATE_PAYMENT" },
    { label: "기타", value: "OTHER" },
  ];

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
      setPaymentId(data.paymentId);
      setPaymentMethod(data.paymentMethod || "");
      setImpUid(data.impUid || null);
    } catch (err) {
      console.error("❌ 환불 조회 오류:", err);
      alert("영수증을 찾을 수 없습니다.");
    }
  };

  // 💰 실제 환불 API 호출 (requestRefund 사용)
  const executeRefund = async (detailValue = "") => {
    const selectReason =
      reason === "OTHER" ? customReason.trim() || "기타 사유" : reason;

    const payload = {
      paymentId,
      cancelAmount: totalAmount,
      refundReason: selectReason || "CUSTOMER_CHANGE",
      detailReason:
        paymentMethod === "CARD" ? detailValue : customReason || "",
      cardNo: cardNumber || "",
        items: items.map((item) => ({
        gtin: item.gtin,
        quantity: item.qty ?? item.salesQuantity ?? 1,
        expDate: item.expDate || null,
      })),
    };

    console.log("📤 환불 요청 데이터:", payload);

    // ✅ ApiClient 기반 함수 호출
    await requestRefund(payload, onRefundComplete, onClose);
  };

  // 💳 카드 결제 검증
  const handleCardRefund = async () => {
    try {
      const cardNo = prompt("💳 환불할 카드번호 마지막 4자리를 입력하세요.");
      if (!cardNo) {
        alert("카드번호를 입력해야 합니다.");
        return;
      }

      setCardNumber(cardNo);
      const res = await verifyRefundInfo({ cardNo });

      const verified =
        res?.verified === true ||
        res?.verified === "true" ||
        res?.result === "OK" ||
        res?.status === "SUCCESS";

      if (verified) {
        console.log("✅ 카드번호 검증 통과");
        await executeRefund(cardNo); // ✅ 카드번호 전달
      } else {
        alert("❌ 카드번호가 일치하지 않습니다.");
      }
    } catch (err) {
      console.error("❌ 카드 검증 실패:", err);
      alert("카드번호 검증 중 오류가 발생했습니다.");
    }
  };

  // 💛 간편결제 검증
  const handleEasyRefund = async () => {
    try {
      const res = await verifyEasyPayRefund(impUid);

      const verified =
        res?.verified === true ||
        res?.status === "paid" ||
        res?.result === "OK";

      if (verified) {
        console.log("✅ 간편결제 검증 통과");
        await executeRefund();
      } else {
        alert("❌ 간편결제 검증 실패: impUid 일치하지 않음");
      }
    } catch (err) {
      console.error("❌ 간편결제 검증 중 오류:", err);
      alert("간편결제 검증 실패");
    }
  };

  // 🔘 결제수단별 환불 처리
  const handleRefund = async () => {
    if (!paymentId) {
      alert("결제 내역이 확인되지 않았습니다.");
      return;
    }

    if (paymentMethod === "CARD") {
      await handleCardRefund();
      return;
    }

    if (paymentMethod === "EASY") {
      await handleEasyRefund();
      return;
    }

    await executeRefund();
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center z-[2000]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div className="bg-white rounded-2xl shadow-2xl w-[420px] p-6 relative z-[2100]">
        <h2 className="text-xl font-bold mb-4 text-center">
          영수증 바코드 스캔
        </h2>

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

        {/* 환불 사유 선택 */}
        {items.length > 0 && (
          <div className="mb-3">
            <label className="block text-gray-700 mb-1 text-sm font-semibold">
              환불 사유
            </label>

            <select
              className="w-full border rounded-lg px-3 py-2 text-gray-800"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="">사유를 선택하세요</option>
              {refundReasons.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>

            {reason === "OTHER" && (
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="상세 사유를 입력하세요"
                rows="2"
                className="w-full border rounded-lg px-3 py-2 mt-2 text-gray-800"
              />
            )}
          </div>
        )}

        {/* 상품 리스트 + 유통기한 입력 */}
        {items.length > 0 && (
          <div className="border-t pt-3 max-h-[200px] overflow-y-auto">
            {items.map((item, idx) => (
              <div
                key={item.id || item.gtin || idx}
                className="flex justify-between items-center py-1 px-2 bg-red-50 text-red-600 rounded-md mb-1"
              >
                <span>{item.productName}</span>
                <div className="flex items-center gap-2">
                  <span>
                    ₩{" "}
                    {(item.price ?? item.sdPrice ?? item.subtotal ?? 0).toLocaleString()}
                  </span>

                  {/* ✅ 유통기한 입력 */}
                  <input
                    type="date"
                    value={item.expDate || ""}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((it, i) =>
                          i === idx ? { ...it, expDate: e.target.value } : it
                        )
                      )
                    }
                    className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-700"
                  />
                </div>
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

