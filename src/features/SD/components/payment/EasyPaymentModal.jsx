import { useState, useEffect } from "react";
import axios from "axios";

function EasyPaymentModal({ totalAmount, currentOrder, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [amount, setAmount] = useState(totalAmount); // ✅ 남은 결제 금액

  // ✅ totalAmount 변동 시 자동 반영
  useEffect(() => {
    setAmount(totalAmount);
  }, [totalAmount]);

  const handleEasyPay = async (pg) => {
    const { IMP } = window;
    if (!IMP) {
      setError("아임포트 SDK가 로드되지 않았습니다.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      IMP.init("imp66451012"); // ✅ 본인 imp key

      const merchantUid = `order_${new Date().getTime()}`;

      // ✅ 결제창에 전달할 정보
      const data = {
        pg: pg === "kakaopay"
          ? "kakaopay.TC0ONETIME"
          : "tosspayments.tosstest",
        pay_method: pg === "kakaopay" ? "card" : "tosspay",
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
          const impUid = rsp.imp_uid || null;

          if (!impUid) {
            setError("impUid가 비어 있습니다. 결제 검증을 수행할 수 없습니다.");
            return;
          }

          try {
            console.log("📦 currentOrder:", currentOrder);
            console.log("📦 currentOrder.orderId:", currentOrder?.orderId);

            // ✅ 서버로 결제 결과 전달
            const paymentData = {
              orderId: currentOrder?.orderId,
              amount: amount,
              totalAmount: amount,
              paymentMethod: "EASY",
              imp_uid: impUid,
              merchant_uid: rsp.merchant_uid,
              provider: pg === "kakaopay" ? "kakaopay" : "tosspay",
            };

            console.log("🚀 서버로 전송할 데이터:", paymentData);

            const res = await axios.post("http://localhost:8080/api/payments", paymentData);

            alert(`✅ 간편결제 성공! 결제금액 ₩${amount.toLocaleString()}`);
            onSuccess({
              method: "EASY",
              amount: amount,
              impUid: impUid,
              response: res.data,
            });
            onClose();
          } catch (err) {
            console.error("❌ 서버 검증 실패:", err);
            setError("서버 검증 실패: " + (err.response?.data?.message || err.message));
          }
        } else {
          console.error("❌ 결제 실패:", rsp.error_msg);
          setError("결제 실패: " + rsp.error_msg);
        }
      });
    } catch (err) {
      console.error("❌ 간편결제 처리 중 오류:", err);
      setError("간편결제 처리 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl p-6 shadow-lg w-[380px]">
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
            onClick={() => handleEasyPay("kakaopay")}
            disabled={loading || amount <= 0}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded-xl transition disabled:opacity-50"
          >
            💛 카카오페이로 결제
          </button>
          <button
            onClick={() => handleEasyPay("tosspayments")}
            disabled={loading || amount <= 0}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
          >
            💙 토스페이로 결제
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-xl"
        >
          닫기
        </button>
      </div>
    </div>
  );
}

export default EasyPaymentModal;

