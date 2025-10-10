import { useState } from "react";
import { createPayment } from "../../api/paymentApi";
import CardPaymentModal from "./CardPaymentModal";
import BarcodeListener from "../BarcodeListener";

function PaymentSection({ totalAmount, onSelect, onPaymentComplete, onSuccess }) { // ✅ onSuccess props 추가
  const [showMethods, setShowMethods] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const paymentMap = {
    "카드 결제": "CARD",
    "현금 결제": "CASH",
    "간편 결제": "SIMPLE",
  };

  // ✅ 바코드 스캔 처리
  const handleBarcodeScan = async (data) => {
    console.log("📡 바코드 감지:", data);
    const [type, method, salesId, amount] = data.split("|");

    if (type === "PAYMENT") {
      if (method === "CARD") {
        setShowCardModal(true);
      } else {
        await handleBarcodePayment(method, salesId, amount);
      }
    }
  };

  // ✅ 바코드 결제
  const handleBarcodePayment = async (method, salesId, amount) => {
    setLoading(true);
    try {
      await createPayment({
        salesId: Number(salesId),
        method,
        totalAmount: Number(amount),
      });
      alert(`✅ ${method} 결제 완료 (바코드)`);

      if (onSelect) onSelect(method);
      if (onPaymentComplete)
        onPaymentComplete(Number(amount), Number(amount));
      if (onSuccess) onSuccess(); // ✅ 추가됨
    } catch (e) {
      console.error(e);
      alert("바코드 결제 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  // ✅ 결제 방식 선택 (수동)
  const handleSelectMethod = (methodName) => {
    const method = paymentMap[methodName];

    // 💳 카드 결제는 모달 먼저 띄움
    if (method === "CARD") {
      setShowCardModal(true);
      setShowMethods(false);
      return;
    }

    // 💵 현금/간편 결제는 바로 결제 실행
    handlePaymentRequest(method, methodName);
  };

  // ✅ 실제 결제 처리 (공통 함수)
  const handlePaymentRequest = async (method, displayName) => {
    setLoading(true);
    try {
      const result = await createPayment({
        salesId: 101,
        method,
        totalAmount,
      });

      alert(`${displayName} 완료되었습니다.`);
      if (onSelect) onSelect(method);
      if (onPaymentComplete)
        onPaymentComplete(totalAmount, result.receivedAmount || totalAmount);
      if (onSuccess) onSuccess(); // ✅ 추가됨
    } catch (e) {
      console.error(e);
      alert("결제 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
      setShowMethods(false);
    }
  };

  // ✅ 카드 결제 모달 → 결제 성공 시
  const handleCardSuccess = async () => {
    try {
      await createPayment({
        salesId: 101,
        method: "CARD",
        totalAmount,
      });
      alert("💳 카드 결제 성공!");

      if (onSelect) onSelect("CARD");
      if (onPaymentComplete)
        onPaymentComplete(totalAmount, totalAmount);
      if (onSuccess) onSuccess(); // ✅ 추가됨
    } catch (e) {
      console.error(e);
      alert("카드 결제 중 오류 발생");
    } finally {
      setShowCardModal(false);
    }
  };

  return (
    <div className="w-full max-w-[400px]">
      {/* ✅ 바코드 리스너 */}
      <BarcodeListener onBarcodeScan={handleBarcodeScan} />

      {/* ✅ 결제 버튼 */}
      <div className="relative">
        <button
          onClick={() => setShowMethods((prev) => !prev)}
          disabled={loading}
          className={`bg-blue-500 text-white w-40 h-20 rounded-2xl 
                      hover:bg-blue-600 text-xl font-bold shadow-lg 
                      transition-transform active:scale-95 
                      ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {loading ? "처리 중..." : "결제하기"}
        </button>

        {showMethods && (
          <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-gray-100 animate-fadeIn">
            {["카드 결제", "현금 결제", "간편 결제"].map((name, i) => (
              <button
                key={i}
                onClick={() => handleSelectMethod(name)}
                className="w-full text-left px-6 py-3 text-base font-medium 
                           hover:bg-gray-100 border-b last:border-none transition"
              >
                {name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 💳 카드 결제 모달 */}
      {showCardModal && (
        <CardPaymentModal
          totalAmount={totalAmount}
          onClose={() => setShowCardModal(false)}
          onSuccess={handleCardSuccess}
        />
      )}
    </div>
  );
}

export default PaymentSection;