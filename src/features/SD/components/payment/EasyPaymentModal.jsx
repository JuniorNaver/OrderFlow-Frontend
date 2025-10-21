import { useState, useEffect } from "react";

function EasyPaymentModal({ totalAmount, currentOrder, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [amount, setAmount] = useState(totalAmount);
  const [isProcessing, setIsProcessing] = useState(false); // ✅ 중복 방지 플래그

  useEffect(() => {
    setAmount(totalAmount);
  }, [totalAmount]);

  const handleEasyPay = async () => {
    if (isProcessing) return; // ✅ 이미 결제 중이면 재실행 방지
    setIsProcessing(true);
    const { IMP } = window;

    if (!IMP) {
      setError("아임포트 SDK가 로드되지 않았습니다.");
      setIsProcessing(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      IMP.init("imp66451012");

      const merchantUid = `order_${new Date().getTime()}`;

      const data = {
        pg: "kakaopay.TC0ONETIME",
        pay_method: "card",
        merchant_uid: merchantUid,
        name: "POS 간편결제",
        amount: Number(amount) > 0 ? Number(amount) : 1000,
        buyer_email: "test@orderflow.com",
        buyer_name: "테스트 고객",
        buyer_tel: "010-1234-5678",
      };

      IMP.request_pay(data, async (rsp) => {
        console.log("📡 아임포트 응답:", rsp);

        if (rsp.success) {
          const impUid = rsp.imp_uid || `IMP_TEST_${Date.now()}`;
          const merchantUid =
            rsp.merchant_uid || `ORDER_${currentOrder?.orderId || "UNKNOWN"}`;

          try {
            const paymentData = {
              orderId: currentOrder?.orderId,
              totalAmount: Number(amount),
              amount: Number(amount),
              paymentMethod: "EASY",
              transactionNo: rsp.apply_num || null,
              imp_uid: impUid,
              merchant_uid: merchantUid,
              provider: "KAKAOPAY",
            };

            console.log("🚀 서버로 전송할 데이터:", paymentData);

            onSuccess({
              method: "EASY",
              amount,
              paidAmount: amount,
              impUid,
              merchantUid 
            });
            onClose();

          } catch (err) {
            console.error("❌ 서버 검증 실패:", err);
            setError(
              "서버 검증 실패: " +
                (err.response?.data?.message || err.message)
            );
          }
        } else {
          console.error("❌ 결제 실패:", rsp.error_msg);
          setError("결제 실패: " + rsp.error_msg);
        }

        setIsProcessing(false); // ✅ 모든 콜백 종료 후 해제
        setLoading(false);
      });
    } catch (err) {
      console.error("❌ 간편결제 처리 중 오류:", err);
      setError("간편결제 처리 중 오류 발생");
      setIsProcessing(false);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center z-[2000]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      <div className="relative bg-white rounded-2xl p-6 shadow-2xl w-[380px] z-[2100]">
        <h2 className="text-2xl font-bold text-center mb-4">간편결제</h2>

        <p className="text-center text-gray-700 mb-3">
          남은 결제금액:{" "}
          <span className="font-semibold text-blue-600">
            ₩ {amount.toLocaleString()}
          </span>
        </p>

        {error && <p className="text-red-600 text-center mb-3">{error}</p>}

        <div className="flex flex-col gap-3">
          <button
            onClick={handleEasyPay}
            disabled={loading || amount <= 0 || isProcessing} // ✅ 중복 방지
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded-xl transition disabled:opacity-50"
          >
            💛 카카오페이로 결제
          </button>
        </div>

        <button
          onClick={onClose}
          disabled={isProcessing}
          className="mt-5 w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-xl"
        >
          닫기
        </button>
      </div>
    </div>
  );
}

export default EasyPaymentModal;
