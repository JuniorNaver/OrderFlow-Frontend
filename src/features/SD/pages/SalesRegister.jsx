import { useState, useEffect } from "react";
import PaymentSection from "../components/payment/PaymentSection";
import ProductSearch from "../components/sales/ProductSearch";
import ReceiptQuery from "../components/receipt/ReceiptQuery";
import SalesTable from "../components/sales/SalesTable";
import { getProductByBarcode } from "../api/productApi";
import BarcodeListener from "../components/BarcodeListener";
import SummarySection from "../components/shared/SummarySection";
import RefundModal from "../components/refund/RefundModal";

function SalesRegister() {
  const [showQuery, setShowQuery] = useState(false);
  const [showRefund, setShowRefund] = useState(false); // ✅ 추가됨
  const [totalAmount, setTotalAmount] = useState(0);
  const [receivedAmount, setReceivedAmount] = useState(0);
  const [changeAmount, setChangeAmount] = useState(0);

  // ✅ 총매출 변화 감지
  const handleTotalChange = (total) => {
    console.log("총 매출:", total);
    setTotalAmount(total);
  };

  const handlePaymentSelect = (method) => {
    console.log("선택된 결제방식:", method);
  };

  const handlePaymentComplete = (expected, received) => {
    setReceivedAmount(received);
    setChangeAmount(received - expected);
  };

  const handleReceiptClick = () => {
    setShowQuery(true);
  };

  const handleRefundClick = () => {
    setShowRefund(true);
  };

  const handlePaymentSuccess = () => {
    alert("결제 완료! 매출이 반영되었습니다.");
  };

  const handleBarcodeScan = async (barcode) => {
    console.log("스캔된 바코드:", barcode);
    try {
      const product = await getProductByBarcode(barcode);
      if (product && window.addItemToSales) {
        window.addItemToSales({
          id: product.id,
          name: product.name,
          price: product.price,
          qty: 1,
          stock: product.stock,
        });
      } else {
        alert("상품을 찾을 수 없습니다.");
      }
    } catch (e) {
      console.error("바코드 검색 오류:", e);
      alert("바코드 검색 중 오류 발생");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (window.addItemToSales) {
        window.addItemToSales({
          id: 1,
          name: "햇반",
          price: 2000,
          qty: 1,
          stock: 20,
        });
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-10 bg-gray-50 min-h-screen text-[18px] relative">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold">판매등록</h1>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="grid grid-cols-3 gap-10">
        {/* 좌측: 판매 테이블 */}
        <div className="col-span-2">
          <SalesTable
            onTotalChange={handleTotalChange}
            onAddItem={(addFn) => (window.addItemToSales = addFn)}
          />
          <BarcodeListener onBarcodeScan={handleBarcodeScan} />
        </div>

        {/* 우측 섹션 */}
        <div className="grid grid-cols-2 gap-6 justify-items-center">
          <PaymentSection
            totalAmount={totalAmount}
            onSelect={handlePaymentSelect}
            onPaymentComplete={handlePaymentComplete}
            onSuccess={handlePaymentSuccess}
          />

          <button
            onClick={handleRefundClick}
            className="bg-red-500 text-white w-40 h-20 rounded-2xl hover:bg-red-600 text-xl font-bold shadow-lg transition-transform active:scale-95"
          >
            환불
          </button>

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
      <SummarySection
        totalAmount={totalAmount}
        receivedAmount={receivedAmount}
        changeAmount={changeAmount}
      />

      {/* 모달들 */}
      {showQuery && <ReceiptQuery onClose={() => setShowQuery(false)} />}

      {showRefund && (
        <RefundModal onClose={() => setShowRefund(false)} /> // ✅ 닫는 괄호 추가
      )}
    </div>
  );
}

export default SalesRegister;