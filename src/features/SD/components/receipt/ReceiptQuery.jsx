import { useState, useEffect } from "react";
import axios from "axios";
import ReceiptModal from "./ReceiptModal";

export default function ReceiptQuery({ onClose }) {
  const [receipts, setReceipts] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // ✅ 더미 또는 API 로드
 useEffect(() => {
  const fetchReceipts = async () => {
    try {
      const res = await axios.get("/api/receipt");
      console.log("✅ 영수증 API 응답:", res.data);
      const data = Array.isArray(res.data) ? res.data : [res.data];
      setReceipts(data);
    } catch (err) {
      console.error("❌ 영수증 조회 실패:", err.message);

      // ✅ 임시 더미 데이터 (API 연결 안 되어 있을 때)
      setReceipts([
        {
          receiptId: 1001,
          salesId: 2001,
          paymentMethod: "CARD",
          totalAmount: 12000,
          createdAt: "2025-10-08 18:32:00",
        },
        {
          receiptId: 1002,
          salesId: 2002,
          paymentMethod: "CASH",
          totalAmount: 8700,
          createdAt: "2025-10-08 18:36:00",
        },
      ]);
    }
  };

  fetchReceipts();
}, []);

  return (
    <>
      {/* ✅ 리스트 모달 */}
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
        <div className="bg-white w-[600px] p-8 rounded-2xl shadow-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-5 text-gray-500 hover:text-gray-800 text-lg"
          >
            ✕
          </button>

          <h2 className="text-2xl font-bold mb-6">🧾 영수증 조회</h2>

          <div className="border rounded-lg divide-y max-h-[400px] overflow-y-auto">
            {receipts.length === 0 ? (
              <p className="text-center text-gray-400 py-10">
                조회된 영수증이 없습니다.
              </p>
            ) : (
              receipts.map((r) => (
                <div
                  key={r.receiptId}
                  onClick={() => setSelectedReceipt(r)}
                  className="p-4 hover:bg-blue-50 cursor-pointer flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      영수증 #{r.receiptId}
                    </p>
                    <p className="text-sm text-gray-600">
                      {r.createdAt} | ₩{r.totalAmount.toLocaleString()} |{" "}
                      {r.paymentMethod}
                    </p>
                  </div>
                  <span className="text-gray-400 text-sm">▶</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ✅ 상세 모달 (위층 z-index) */}
      {selectedReceipt && (
        <ReceiptModal
          receipt={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </>
  );
}