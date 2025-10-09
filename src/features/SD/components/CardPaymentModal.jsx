import { useState, useEffect } from "react";

function CardPaymentModal({ totalAmount, onClose, onSuccess }) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const validCard = "1234-5678-9876-5432";
    const validExpiry = "12/29";
    const validCvc = "777";

    setTimeout(() => {
      if (cardNumber === validCard && expiry === validExpiry && cvc === validCvc) {
        alert("💳 결제 성공! 카드 승인 완료되었습니다.");
        onSuccess(); // 부모에서 모달 닫기 담당
      } else {
        setError("❌ 카드 정보가 올바르지 않습니다.");
      }
      setLoading(false);
    }, 1200);
  };

  // ✅ Enter 키로 바로 결제 실행
  useEffect(() => {
    const handleEnter = (e) => {
      if (e.key === "Enter") handleSubmit(e);
    };
    window.addEventListener("keydown", handleEnter);
    return () => window.removeEventListener("keydown", handleEnter);
  }, [cardNumber, expiry, cvc]);

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-[350px]">
        <h2 className="text-2xl font-bold mb-2 text-center">카드 결제</h2>
        <p className="text-center text-gray-600 mb-6">
          결제 금액: <span className="font-semibold text-blue-600">₩ {totalAmount.toLocaleString()}</span>
        </p>

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
              disabled={loading}
              className={`bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "승인 중..." : "결제하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CardPaymentModal;