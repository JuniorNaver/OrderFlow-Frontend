import { useState } from "react";
import { createPayment } from "../api/paymentApi";
import CardPaymentModal from "./CardPaymentModal";
import BarcodeListener from "./BarcodeListener";

function PaymentSection({ totalAmount, onSelect }) {

  const [showMethods, setShowMethods] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [loading, setLoading] = useState(false);

    const paymentMap = {
    "카드 결제": "CARD",
    "현금 결제": "CASH",
    "간편 결제": "SIMPLE",
  };

  // ✅ 바코드 스캔 시 실행되는 함수
  const handleBarcodeScan = async (data) => {
    console.log("📡 바코드 감지:", data);

    // 예: PAYMENT|CARD|101|10000
    const [type, method, salesId, amount] = data.split("|");

    if (type === "PAYMENT") {
      if (method === "CARD") {
        setShowCardModal(true); // 카드면 모달 띄우기
      } else {
        // 현금 or 간편결제는 바로 결제 처리
        await handleBarcodePayment(method, salesId, amount);
      }
    }
  };

  // ✅ 바코드 기반 자동 결제 처리
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
    } catch (e) {
      console.error(e);
      alert("바코드 결제 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMethod = async (methodName) => {
    setShowMethods(false);

    if (methodName === "카드 결제") {
      // ✅ 카드 결제는 모달 먼저 띄우기
      setShowCardModal(true);
      return;
    }

    const method = paymentMap[methodName];
    setLoading(true);

     try {
      await createPayment({
        salesId: 101,
        method,
        totalAmount,
      });
      alert(`${methodName} 완료되었습니다.`);
      if (onSelect) onSelect(method);
    } catch (e) {
      alert("결제 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  // ✅ 카드 결제 모달에서 결제 성공 시 처리
  const handleCardSuccess = async () => {
   try {
      await createPayment({
        salesId: 101,
        method: "CARD",
        totalAmount,
      });
      alert("카드 결제 성공!");
      if (onSelect) onSelect("CARD");
    } catch (e) {
      console.error(e);
      alert("카드 결제 중 오류 발생");
    } finally {
      setShowCardModal(false);
    }
  };

  return (
     <div className="w-full max-w-[400px]">
      {/* ✅ 바코드 리스너 연결 */}
      <BarcodeListener onBarcodeScan={handleBarcodeScan} />
      
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
            {["카드 결제", "현금 결제", "간편 결제"].map((method, i) => (
              <button
                key={i}
                onClick={() => handleSelectMethod(method)}
                className="w-full text-left px-6 py-3 text-base font-medium 
                           hover:bg-gray-100 border-b last:border-none transition"
              >
                {method}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 💳 카드 결제 모달 표시 */}
      {showCardModal && (
        <CardPaymentModal
          onClose={() => setShowCardModal(false)}
          onSuccess={handleCardSuccess}
        />
      )}
    </div>
  );
}

export default PaymentSection;
