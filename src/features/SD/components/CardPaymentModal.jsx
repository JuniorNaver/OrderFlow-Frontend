import { useState } from "react";

function CardPaymentModal({ onClose, onSuccess }) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [error, setError] = useState("");

  // ✅ 실제 검증 로직 (간단한 시뮬레이션)
  const handleSubmit = (e) => {
    e.preventDefault();

    const validCard = "1234-5678-9876-5432";
    const validExpiry = "12/29";
    const validCvc = "777";

    if (cardNumber === validCard && expiry === validExpiry && cvc === validCvc) {
      alert("💳 결제 성공! 카드 승인 완료되었습니다.");
      onSuccess(); // 부모에게 성공 알림
      onClose();
    } else {
      setError("❌ 카드 정보가 올바르지 않습니다.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-[350px]">
        <h2 className="text-2xl font-bold mb-6 text-center">카드 결제</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-600 mb-1 text-sm">카드번호</label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="1234-5678-9876-5432"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-1 text-sm">유효기간</label>
            <input
              type="text"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              placeholder="MM/YY"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-1 text-sm">CVC</label>
            <input
              type="password"
              value={cvc}
              onChange={(e) => setCvc(e.target.value)}
              placeholder="***"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              취소
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              결제하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CardPaymentModal;