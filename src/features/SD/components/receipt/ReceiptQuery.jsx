import { useState, useEffect } from "react";
import axios from "axios";
import ReceiptModal from "./ReceiptModal";

export default function ReceiptQuery({ onClose }) {
  const [receipts, setReceipts] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // ✅ 영수증 데이터 로드 (실제 API 연결 가능)
useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const res = await axios.get("/api/receipt"); // 임시 데이터
        setReceipts(res.data);
      } catch (err) {
        console.error("영수증 조회 실패:", err);
        // fallback dummy data
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
     <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white w-[600px] p-8 rounded-2xl shadow-2xl relative">
        <h2 className="text-2xl font-bold mb-6">영수증 조회</h2>

        {/* 영수증 내용 예시 */}
        <div className="border-t border-gray-200 pt-4 space-y-3 text-lg">
          <p>영수증 번호: 202501</p>
          <p>판매 ID: 101</p>
          <p>결제 방식: CARD</p>
          <p>결제 금액: ₩10,000</p>
          <p>결제 시간: 2025-10-08 22:10</p>
        </div>
        
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-5 text-gray-500 hover:text-gray-800 text-lg"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-6">🧾 영수증 조회</h2>

        {/* 리스트 */}
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

        {/* 상세 모달 */}
        {selectedReceipt && (
          <ReceiptModal
            receipt={selectedReceipt}
            onClose={() => setSelectedReceipt(null)}
          />
        )}
      </div>
    </div>
  );
}