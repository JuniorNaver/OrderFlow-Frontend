export default function RefundSummary({ preview, onPreview, onSubmit, disabled }) {
  return (
    <div className="bg-gray-50 border rounded-2xl p-4">
      <div className="text-lg font-bold mb-2">요약</div>
      {preview ? (
        <>
          <div className="flex justify-between"><span>환불 총액</span><span>{preview.refundTotal.toLocaleString()}원</span></div>
          <div className="flex justify-between"><span>수수료</span><span>{preview.fee.toLocaleString()}원</span></div>
          <div className="flex justify-between font-semibold"><span>지급액</span><span>{preview.finalRefund.toLocaleString()}원</span></div>
        </>
      ) : (
        <div className="text-sm text-gray-500 mb-2">프리뷰를 눌러 금액을 확인하세요.</div>
      )}

      <div className="flex gap-2 mt-3">
        <button onClick={onPreview} disabled={disabled} className="flex-1 bg-gray-200 hover:bg-gray-300 rounded-xl py-2 font-semibold disabled:opacity-50">프리뷰</button>
        <button onClick={onSubmit} disabled={disabled} className="flex-1 bg-red-600 text-white hover:bg-red-700 rounded-xl py-2 font-semibold disabled:opacity-50">환불 실행</button>
      </div>
    </div>
  );
}