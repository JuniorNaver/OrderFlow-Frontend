import { useState } from "react";
import { createPayment } from "../api/paymentApi";

function PaymentSection({ totalAmount, onSelect }) {

  const [showMethods, setShowMethods] = useState(false);
  const [loading, setLoading] = useState(false);

    const paymentMap = {
    "카드 결제": "CARD",
    "현금 결제": "CASH",
    "간편 결제": "SIMPLE",
    };

 const handleSelectMethod = async (methodName) => {
    setShowMethods(false);
    const method = paymentMap[methodName];
    if (onSelect) onSelect(method);

    setLoading(true);
    try {
      const result = await createPayment({
        salesId: 101,
        method,
        totalAmount,
      });
      console.log("결제 결과:", result);
      alert(`${methodName} 완료되었습니다.`);
    } catch (e) {
      console.error(e);
      alert("결제 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[400px]">
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
    </div>
  );
}

export default PaymentSection;