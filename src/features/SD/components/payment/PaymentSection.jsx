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
}) {
  const [loading, setLoading] = useState(false);
  const [paidTotal, setPaidTotal] = useState(0); // ✅ 누적 결제 금액
  const [showMethods, setShowMethods] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showCashModal, setShowCashModal] = useState(false);
  const [showEasyModal, setShowEasyModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  // ✅ 남은 금액 계산
  const remainingAmount = Math.max(totalAmount - paidTotal, 0);

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

      // 2️⃣ 누적 결제 금액 갱신
      const newPaidTotal = paidTotal + Number(amount);
      setPaidTotal(newPaidTotal);

      const remaining = totalAmount - newPaidTotal;

      // 3️⃣ 안내 메시지
      alert(`✅ ${method} 결제 성공! (남은 금액: ₩${remaining.toLocaleString()})`);

      // 4️⃣ 아직 결제 금액이 남은 경우
      if (remaining > 0) {
        console.log(`💡 아직 ₩${remaining.toLocaleString()} 남았습니다.`);
        if (onSelect) onSelect(method);
        if (onPaymentComplete)
          onPaymentComplete(Number(amount), extraData.change ?? 0);
        return;
      }

      // 5️⃣ 모든 결제 완료 → 결제 완료 모달 표시
      setShowCompleteModal(true);
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
          totalAmount={remainingAmount} // ✅ 남은 금액 전달
          onClose={() => setShowCardModal(false)}
          onSuccess={({ amount }) => handlePaymentSuccess("CARD", amount)}
        />
      )}

      {/* 💵 현금 결제 모달 */}
      {showCashModal && (
        <CashPaymentModal
          totalAmount={remainingAmount} // ✅ 남은 금액 전달
          onClose={() => setShowCashModal(false)}
          onSuccess={({ receivedAmount, change }) =>
            handlePaymentSuccess("CASH", remainingAmount, {
              receivedAmount,
              change,
            })
          }
        />
      )}

      {/* ⚡ 간편 결제 모달 */}
      {showEasyModal && (
        <EasyPaymentModal
          totalAmount={remainingAmount} // ✅ 남은 금액 전달
          currentOrder={currentOrder}
          onClose={() => setShowEasyModal(false)}
          onSuccess={({ impUid }) =>
            handlePaymentSuccess("EASY", remainingAmount, { impUid })
          }
        />
      )}

      {/* ✅ 결제 완료 모달 */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-[380px] text-center">
            <h2 className="text-2xl font-bold text-green-600 mb-3">✅ 결제 완료</h2>
            <p className="text-gray-700 mb-4">결제가 모두 완료되었습니다.</p>
            <p className="font-semibold mb-6">
              영수증 출력 또는 거스름돈을 확인하세요.
            </p>

            <button
              onClick={async () => {
                await completeOrder(currentOrder.orderId);
                const newOrder = await createOrder();
                localStorage.setItem("currentOrder", JSON.stringify(newOrder));
                if (window.clearSalesItems) window.clearSalesItems();
                setShowCompleteModal(false);
                setPaidTotal(0);
                if (onSuccess) onSuccess(newOrder);
              }}
              className="bg-blue-500 text-white px-6 py-2 rounded-xl hover:bg-blue-600 font-bold"
            >
              다음 주문으로
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentSection;


