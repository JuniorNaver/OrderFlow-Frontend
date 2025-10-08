import { useState } from "react";
import PaymentSection from "../components/PaymentSection";
import ProductSearch from "../components/ProductSearch";
import ReceiptQuery from "../components/receipt/ReceiptQuery"; // ✅ ReceiptQuery import
import SalesTable from "../components/SalesTable";

export default function SalesRegister() {
  const [showQuery, setShowQuery] = useState(false); // ✅ ReceiptQuery 제어 상태

  const handlePaymentSelect = (method) => {
    console.log("선택된 결제방식:", method);
  };

  // ✅ 영수증 버튼 클릭 시 ReceiptQuery 열기
  const handleReceiptClick = () => {
    setShowQuery(true);
  };


  return (
    <div className="p-10 bg-gray-50 min-h-screen text-[18px] relative">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold">판매등록</h1>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="grid grid-cols-3 gap-10">
        <div className="col-span-2">
          <SalesTable /> {/* ✅ 분리된 컴포넌트 삽입 */}
        </div>

        {/* 💳 오른쪽: 결제 / 환불 / 조회 / 검색 */}
        <div className="grid grid-cols-2 gap-6 justify-items-center">
          <PaymentSection totalAmount={10000} onSelect={handlePaymentSelect} />

          <button className="bg-red-500 text-white w-40 h-20 rounded-2xl hover:bg-red-600 text-xl font-bold shadow-lg transition-transform active:scale-95">
            환불
          </button>

          {/* ✅ 영수증 버튼 → ReceiptQuery 모달 열기 */}
          <button
            onClick={handleReceiptClick}
            className="bg-gray-900 text-white w-40 h-20 rounded-2xl hover:bg-gray-800 text-xl font-bold shadow-lg transition-transform active:scale-95"
          >
            영수증
          </button>

          <button className="bg-green-500 text-white w-40 h-20 rounded-2xl hover:bg-green-600 text-xl font-bold shadow-lg transition-transform active:scale-95">
            보류
          </button>

          <ProductSearch />

          <button className="bg-purple-500 text-white w-40 h-20 rounded-2xl hover:bg-purple-600 text-xl font-bold shadow-lg transition-transform active:scale-95">
            재고조정
          </button>
        </div>
      </div>

      {/* 하단 요약 */}
      <div className="mt-10 bg-white shadow-xl rounded-2xl p-6 grid grid-cols-2 gap-8 text-lg">
        <div>
          <div className="flex justify-between border-b py-2">
            <span>총 매출</span>
            <span>₩ 10,000</span>
          </div>
          <div className="flex justify-between border-b py-2">
            <span>할인액</span>
            <span>₩ 0</span>
          </div>
          <div className="flex justify-between font-bold text-blue-600 py-2 text-xl">
            <span>결제금액</span>
            <span>₩ 10,000</span>
          </div>
        </div>
        <div>
          <div className="flex justify-between border-b py-2">
            <span>받을 금액</span>
            <span>₩ 10,000</span>
          </div>
          <div className="flex justify-between border-b py-2">
            <span>받은 금액</span>
            <span>₩ 10,000</span>
          </div>
          <div className="flex justify-between font-bold text-green-600 py-2 text-xl">
            <span>거스름돈</span>
            <span>₩ 0</span>
          </div>
        </div>
      </div>

      {/* ✅ ReceiptQuery 모달 */}
      {showQuery && <ReceiptQuery onClose={() => setShowQuery(false)} />}
    </div>
  );
}