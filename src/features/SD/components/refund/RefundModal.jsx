import RefundView from "./RefundView";

export default function RefundModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl shadow-2xl p-6 w-[90%] max-w-5xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">환불</h2>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300"
          >
            닫기
          </button>
        </div>
        <RefundView onClose={onClose} />
      </div>
    </div>
  );
}