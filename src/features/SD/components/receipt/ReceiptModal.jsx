export default function ReceiptModal({ receipt, onClose }) {
  if (!receipt) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-[480px] relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-500 hover:text-gray-800 text-lg"
        >
          ✕
        </button>

        <h3 className="text-xl font-bold mb-4">🧾 영수증 상세</h3>
        <div className="text-gray-700 space-y-2">
          <p><strong>영수증 번호:</strong> {receipt.receiptId}</p>
          <p><strong>판매 번호:</strong> {receipt.salesId}</p>
          <p><strong>결제 수단:</strong> {receipt.paymentMethod}</p>
          <p><strong>결제 금액:</strong> ₩{receipt.totalAmount.toLocaleString()}</p>
          <p><strong>결제 일시:</strong> {receipt.createdAt}</p>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
          >
            닫기
          </button>
          <button
            className="px-5 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
            onClick={() => alert("🖨️ 인쇄 기능 추가 예정")}
          >
            인쇄하기
          </button>
        </div>
      </div>
    </div>
  );
}