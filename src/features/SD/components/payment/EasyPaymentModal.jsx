import { useState } from "react";
import axios from "axios";

function EasyPaymentModal({ totalAmount, currentOrder, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEasyPay = async (pg) => {
    const { IMP } = window;
    if (!IMP) {
      setError("아임포트 SDK가 로드되지 않았습니다.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      IMP.init("imp66451012");


      const data = {
        pg: pg === "kakaopay"
            ? "kakaopay.TC0ONETIME"
            : "toss_brandpay.tosstest",
        pay_method: pg === "kakaopay" ? "card" : "tosspay",
        merchant_uid: `order_${new Date().getTime()}`,
        name: "POS 간편결제",
        amount: Number(totalAmount) > 0 ? Number(totalAmount) : 1000,
        buyer_email: "test@orderflow.com",
        buyer_name: "테스트 고객",
        buyer_tel: "010-1234-5678",
        };

      // ✅ 결제창 호출
      IMP.request_pay(data, async (rsp) => {
        if (rsp.success) {
          // 백엔드 검증 요청
          try {
            const res = await axios.post("http://localhost:8080/api/payments", {
              orderId: currentOrder?.orderId,
              amount: totalAmount,
              paymentMethod: "EASY",
              impUid: rsp.imp_uid, // 아임포트 거래 고유값
            });

            onSuccess(res.data);
            alert("✅ 간편결제 성공!");
            onClose();
          } catch (err) {
            console.error(err);
            setError("서버 검증 실패: " + (err.response?.data?.message || err.message));
          }
        } else {
          console.error("결제 실패:", rsp.error_msg);
          setError("결제 실패: " + rsp.error_msg);
        }
      });
    } catch (err) {
      console.error(err);
      setError("간편결제 처리 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl p-6 shadow-lg w-[380px]">
        <h2 className="text-2xl font-bold text-center mb-4">간편결제</h2>

        {error && <p className="text-red-600 text-center mb-3">{error}</p>}

        <div className="flex flex-col gap-3">
          <button
            onClick={() => handleEasyPay("kakaopay")}
            disabled={loading}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded-xl transition"
          >
            💛 카카오페이로 결제
          </button>
          <button
            onClick={() => handleEasyPay("toss_brandpay")}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition"
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