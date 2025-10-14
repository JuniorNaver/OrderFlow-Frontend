import { useState } from "react";

function CashPaymentModal({ totalAmount, onClose, onSuccess }) {
  const [received, setReceived] = useState("");
  const [change, setChange] = useState(0);
  const [error, setError] = useState("");

  const handleInput = (e) => {
    const value = Number(e.target.value);
    setReceived(value);

    // 거스름돈 계산
    setChange(value - totalAmount);

    // 실시간 유효성 검사
    if (totalAmount <= 0) {
      setError("❌ 결제할 금액이 없습니다.");
    } else if (value < totalAmount) {
      setError("💸 받은 금액이 부족합니다.");
    } else {
      setError("");
    }
  };

  const handleConfirm = () => {
    // 방어 로직
    if (totalAmount <= 0) {
      alert("❌ 결제할 금액이 없습니다.");
      return;
    }
    if (received < totalAmount) {
      alert("💸 받은 금액이 부족합니다.");
      return;
    }

    onSuccess({
      method: "CASH",
      paidAmount: totalAmount,
      receivedAmount: received,
      change: received - totalAmount,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-[380px]">
        <h2 className="text-2xl font-bold mb-4 text-green-700">💵 현금 결제</h2>

        <label className="block text-gray-600 mb-1">받은 금액</label>
        <input
          type="number"
          className="w-full border border-gray-300 rounded-md p-2 text-right text-lg"
          placeholder="예: 30000"
          value={received}
          onChange={handleInput}
        />

        <div className="mt-3 text-right font-semibold text-lg">
          거스름돈:{" "}
          <span className={change < 0 ? "text-gray-400" : "text-blue-600"}>
            {change > 0 ? change.toLocaleString() : 0} 원
          </span>
        </div>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-md"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            disabled={!!error} // ❗ 에러 있을 때 버튼 비활성화
            className={`px-4 py-2 rounded-md text-white ${
              error
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            결제완료
          </button>
        </div>
      </div>
    </div>
  );
}

export default CashPaymentModal;