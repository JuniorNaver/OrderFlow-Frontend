export default function SummarySection({
  totalAmount,
  receivedAmount,
  changeAmount,
  remainingAmount, // ✅ 추가
}) {
  return (
    <div className="mt-10 bg-white shadow-xl rounded-2xl p-6 grid grid-cols-2 gap-8 text-lg">
      <div>
        <div className="flex justify-between border-b py-2">
          <span>총 매출</span>
          <span>₩ {totalAmount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between border-b py-2">
          <span>할인액</span>
          <span>₩ 0</span>
        </div>
        <div className="flex justify-between font-bold text-blue-600 py-2 text-xl">
          <span>결제금액</span>
          <span>₩ {totalAmount.toLocaleString()}</span>
        </div>
      </div>

      <div>
        <div className="flex justify-between border-b py-2">
          <span>받을 금액</span>
          <span className="text-red-600 font-semibold">
            ₩ {remainingAmount.toLocaleString()} {/* ✅ 남은 금액 표시 */}
          </span>
        </div>
        <div className="flex justify-between border-b py-2">
          <span>받은 금액</span>
          <span>₩ {receivedAmount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between font-bold text-green-600 py-2 text-xl">
          <span>거스름돈</span>
          <span>₩ {changeAmount.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
