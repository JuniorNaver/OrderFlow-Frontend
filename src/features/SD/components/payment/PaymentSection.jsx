import { useState } from "react";
import { createPayment } from "../../api/paymentApi.js";
import CardPaymentModal from "./CardPaymentModal";
import CashPaymentModal from "./CashPaymentModal";
import EasyPaymentModal from "./EasyPaymentModal";
import BarcodeListener from "../BarcodeListener";
import { createOrder, completeOrder } from "../../api/sdApi.js";

function PaymentSection({
  totalAmount,
  currentOrder,
  onSelect,
  onPaymentComplete,
  onSuccess,
  setPaidTotal,
}) {
  const [loading, setLoading] = useState(false);
  const [showMethods, setShowMethods] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showCashModal, setShowCashModal] = useState(false);
  const [showEasyModal, setShowEasyModal] = useState(false);

  const paymentMap = {
    "카드 결제": "CARD",
    "현금 결제": "CASH",
    "간편 결제": "EASY",
  };

  // ✅ 결제 성공 공통 처리
  const handlePaymentSuccess = async (method, amount, extraData = {}) => {
    try {
      // 1️⃣ 결제 내역 DB에 저장
      await createPayment({
        orderId: currentOrder?.orderId,
        amount: Number(amount),
        paymentMethod: method,
        ...extraData,
      });

      // 2️⃣ 결제 완료 처리
      alert(`✅ ${method} 결제 성공!`);

      // 3️⃣ 금액/거스름돈 업데이트
      if (setPaidTotal) setPaidTotal((prev) => prev + Number(amount));
      if (onSelect) onSelect(method);
      if (onPaymentComplete)
        onPaymentComplete(Number(amount), extraData.change ?? 0);

      // 4️⃣ 주문 완료 및 새 주문 생성
      await completeOrder(currentOrder.orderId);
      const newOrder = await createOrder();

      // 5️⃣ 로컬/화면 초기화
      localStorage.setItem("currentOrder", JSON.stringify(newOrder));
      if (window.clearSalesItems) window.clearSalesItems();
      console.log("🆕 새 주문으로 초기화됨:", newOrder);

      if (onSuccess) onSuccess(newOrder);
    } catch (error) {
      console.error("결제 처리 중 오류:", error);
      alert("결제 처리 중 오류가 발생했습니다.");
    } finally {
      setShowCardModal(false);
      setShowCashModal(false);
      setShowEasyModal(false);
      setLoading(false);
    }
  };

  // ✅ 수동 결제 선택
  const handleSelectMethod = (methodName) => {
    const method = paymentMap[methodName];
    switch (method) {
      case "CARD":
        setShowCardModal(true);
        break;
      case "CASH":
        setShowCashModal(true);
        break;
      case "EASY":
        setShowEasyModal(true);
        break;
      default:
        break;
    }
    setShowMethods(false);
  };

  return (
    <div className="w-full max-w-[400px]">
      <BarcodeListener
        onBarcodeScan={(method, salesId, amount) =>
          handlePaymentSuccess(method, amount)
        }
      />

      {/* ✅ 결제 버튼 */}
      <div className="relative">
        <button
          onClick={() => setShowMethods((p) => !p)}
          disabled={loading}
          className={`bg-blue-500 text-white w-40 h-20 rounded-2xl hover:bg-blue-600 text-xl font-bold shadow-lg transition-transform active:scale-95 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "처리 중..." : "결제하기"}
        </button>

        {showMethods && (
          <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-gray-100 animate-fadeIn">
            {["카드 결제", "현금 결제", "간편 결제"].map((name, i) => (
              <button
                key={i}
                onClick={() => handleSelectMethod(name)}
                className="w-full text-left px-6 py-3 text-base font-medium hover:bg-gray-100 border-b last:border-none transition"
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
          onSuccess={({ amount }) => handlePaymentSuccess("CARD", amount)}
        />
      )}

      {/* 💵 현금 결제 모달 */}
      {showCashModal && (
        <CashPaymentModal
          totalAmount={totalAmount}
          onClose={() => setShowCashModal(false)}
          onSuccess={({ receivedAmount, change }) =>
            handlePaymentSuccess("CASH", totalAmount, {
              receivedAmount,
              change,
            })
          }
        />
      )}

      {/* ⚡ 간편 결제 모달 */}
      {showEasyModal && (
        <EasyPaymentModal
          totalAmount={totalAmount}
          currentOrder={currentOrder}
          onClose={() => setShowEasyModal(false)}
          onSuccess={({ impUid }) =>
            handlePaymentSuccess("EASY", totalAmount, { impUid })
          }
        />
      )}
    </div>
  );
}

export default PaymentSection;
