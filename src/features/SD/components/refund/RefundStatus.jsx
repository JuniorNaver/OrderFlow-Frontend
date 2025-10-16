export default function RefundStatus({ result, onClose }) {
  const success = result?.status === "SUCCESS" || result?.success === true;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white text-center rounded-2xl shadow-xl w-[360px] p-6">
        <h2 className={`text-xl font-bold mb-3 ${success ? "text-green-600" : "text-red-600"}`}>
          {success ? "환불 완료" : "환불 실패"}
        </h2>
        <p className="text-gray-600 mb-5">
          {success ? "정상적으로 환불이 처리되었습니다." : "환불 중 오류가 발생했습니다."}
        </p>
        <button
          onClick={onClose}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
