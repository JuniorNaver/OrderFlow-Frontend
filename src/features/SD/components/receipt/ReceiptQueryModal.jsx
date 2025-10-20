import { useState } from "react";
import { getReceiptsByDate, reissueReceipt } from "../../api/receiptApi";

function ReceiptQueryModal({ onClose }) {
  const [date, setDate] = useState("");
  const [receipts, setReceipts] = useState([]);
  const [selected, setSelected] = useState(null);

  const handleSearch = async () => {
    try {
      const data = await getReceiptsByDate(date);
      setReceipts(data);
    } catch (e) {
      console.error(e);
      alert("영수증 조회 실패");
    }
  };

  const handleReissue = async (receiptNo) => {
    try {
      const data = await reissueReceipt(receiptNo);
      setSelected(data);
    } catch (err) {
      if (err.response?.status === 410) {
        alert("❌ 50일 이상 지난 영수증은 재발행 불가합니다.");
      } else {
        alert("재발행 실패");
      }
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center z-[2000]">
      {/* 🔲 어두운 반투명 + 블러 배경 (카드 결제와 동일) */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

    <div className="fixed inset-0 bg-white/60 backdrop-blur-sm flex justify-center items-center z-50">
      {/* 외부 클릭 시 닫기 */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* 메인 모달 */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-[850px] h-[600px] flex flex-col overflow-hidden border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-800">📜 영수증 조회</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl font-light"
          >
            ✕
          </button>
        </div>

        {/* 검색 영역 */}
        <div className="flex items-center gap-3 px-6 py-3 bg-white border-b border-gray-200">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold transition-all"
          >
            조회
          </button>
        </div>

        {/* 본문 2단 분할 */}
        <div className="flex flex-1 overflow-hidden bg-gray-50">
          {/* 좌측 리스트 */}
          <div className="w-1/2 overflow-y-auto border-r border-gray-200 p-4 space-y-3">
            {receipts.length === 0 ? (
              <p className="text-gray-500 text-center mt-10">
                날짜를 선택하고 조회하세요.
              </p>
            ) : (
              receipts.map((r) => (
                <div
                  key={r.receiptNo}
                  onClick={() => setSelected(r)}
                  className={`p-3 rounded-xl cursor-pointer transition-all shadow-sm ${
                    selected?.receiptNo === r.receiptNo
                      ? "bg-blue-100 border border-blue-400"
                      : "bg-white hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  <p className="font-semibold text-gray-800">{r.receiptNo}</p>
                  <p className="text-sm text-gray-500">{r.issuedAt}</p>
                  <p className="text-sm text-gray-500">{r.storeName}</p>
                  <p className="text-right font-bold text-blue-600">
                    ₩{r.totalAmount.toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* 우측 상세 */}
          <div className="w-1/2 p-6 overflow-y-auto bg-white">
            {selected ? (
              <>
                <p className="text-xl font-bold mb-1 text-gray-800">
                  {selected.storeName}
                </p>
                <p className="text-sm text-gray-500 mb-3">
                  {selected.storeAddress}
                </p>
                <div className="border-t border-gray-200 pt-3 space-y-2">
                  {selected.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex justify-between text-sm text-gray-700"
                    >
                      <span>{item.productName}</span>
                      <span>
                        ₩{item.sdPrice.toLocaleString()} ×{" "}
                        {item.salesQuantity}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-right text-lg font-bold mt-3 text-blue-600">
                  총합: ₩{selected.totalAmount.toLocaleString()}
                </p>

                <button
                  onClick={() => handleReissue(selected.receiptNo)}
                  className="mt-5 bg-gray-100 hover:bg-blue-100 text-blue-700 border border-blue-300 px-5 py-2 rounded-lg font-semibold transition-all"
                >
                  재발행 요청
                </button>
              </>
            ) : (
              <p className="text-gray-500 text-center mt-20">
                영수증을 선택하세요.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default ReceiptQueryModal;