import { useState, useEffect } from "react";
import PaymentSection from "../components/payment/PaymentSection";
import ProductSearchModal from "../components/shared/ProductSearchModal";
import ReceiptQueryModal from "../components/receipt/ReceiptQueryModal";
import SalesTable from "../components/sales/SalesTable";
import { getProductByBarcode } from "../api/productApi";
import BarcodeListener from "../components/BarcodeListener";
import SummarySection from "../components/shared/SummarySection";
import RefundModal from "../components/refund/RefundModal";
import HoldButton from "../components/hold/HoldButton";
import { saveHold, getHolds, resumeHold } from "../api/holdMAnager";
import { createOrder, completeOrder } from "../api/sdApi";

function SalesRegister() {
  const [showQuery, setShowQuery] = useState(false);
  const [showRefund, setShowRefund] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const [currentOrder, setCurrentOrder] = useState(null);
  const [salesItems, setSalesItems] = useState([]);
  const [holdList, setHoldList] = useState([]);

  const [totalAmount, setTotalAmount] = useState(0);
  const [paidTotal, setPaidTotal] = useState(0);
  const [changeAmount, setChangeAmount] = useState(0);

  // ✅ 주문 생성
  useEffect(() => {
    const initOrder = async () => {
      try {
        const saved = localStorage.getItem("currentOrder");
        if (saved) {
          const parsed = JSON.parse(saved);
          const res = await fetch(`http://localhost:8080/api/sd/${parsed.orderId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.salesStatus !== "COMPLETED" && data.salesStatus !== "CANCELLED") {
              setCurrentOrder(data);
              localStorage.setItem("currentOrder", JSON.stringify(data));
              return;
            }
          }
        }
        const order = await createOrder();
        setCurrentOrder(order);
        localStorage.setItem("currentOrder", JSON.stringify(order));
      } catch (err) {
        console.error("❌ 주문 생성 오류:", err);
        alert("주문 생성 중 오류 발생");
      }
    };
    initOrder();
  }, []);

  // ✅ 바코드 스캔 (DB 선저장 + 테이블 즉시 반영)
  const handleBarcodeScan = async (code) => {
    console.log("📡 스캔 감지:", code);
    if (!currentOrder) return alert("⛔ 주문이 아직 생성되지 않았습니다.");
    try {
      const product = await getProductByBarcode(code);
      if (!product) return alert("상품을 찾을 수 없습니다.");

      if (window.addItemToSales) {
        await window.addItemToSales(product);
      } else {
        console.error("🚨 addItemToSales 미등록");
      }
    } catch (e) {
      console.error("바코드 처리 오류:", e);
      alert("바코드 처리 중 오류 발생");
    }
  };

  // ✅ 결제 완료 후 처리
  const handlePaymentSuccess = async () => {
    if (!currentOrder) return alert("주문이 없습니다.");
    try {
      await completeOrder(currentOrder.orderId);
      alert("💳 결제 완료 및 매출 반영됨!");

      localStorage.removeItem("currentOrder");
      const next = await createOrder();
      setCurrentOrder(next);
      localStorage.setItem("currentOrder", JSON.stringify(next));

      if (window.clearSalesItems) window.clearSalesItems();
      setSalesItems([]);
      setTotalAmount(0);
      setPaidTotal(0);
      setChangeAmount(0);
    } catch (err) {
      console.error("결제 완료 오류:", err);
      alert("결제 완료 중 오류 발생");
    }
  };

  return (
    <div className="p-10 bg-gray-50 min-h-screen text-[18px] relative overflow-visible">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-10 w-full max-w-[1440px] mx-auto">
        <h1 className="text-4xl font-bold">판매등록</h1>
        {currentOrder && (
          <div className="flex items-center text-gray-600 gap-2">
            <span>🧾</span>
            <span>
              주문번호:{" "}
              <b className="text-gray-800">
                {currentOrder.orderNo || `ID-${currentOrder.orderId}`}
              </b>
            </span>
          </div>
        )}
      </div>

      {/* 본문 */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 max-w-[1440px] mx-auto">
        {/* 좌측 테이블 */}
        <div className="relative">
          <SalesTable
            currentOrder={currentOrder}
            onTotalChange={setTotalAmount}
            onItemsChange={setSalesItems}
          />
          <BarcodeListener onBarcodeScan={handleBarcodeScan} />
        </div>

        {/* 우측 버튼 */}
        <div className="flex flex-col items-center space-y-8">
          <div className="grid grid-cols-2 gap-5" style={{ width: "340px" }}>
            <div className="w-[160px] h-[78px]">
              <PaymentSection
                totalAmount={totalAmount}
                currentOrder={currentOrder}
                onSuccess={handlePaymentSuccess}
                onPaymentComplete={(received, change) => {
                  setPaidTotal(received);
                  setChangeAmount(change);
                }}
              />
            </div>
            <button
              onClick={() => setShowRefund(true)}
              className="w-[160px] h-[80px] bg-red-500 text-white rounded-2xl hover:bg-red-600 text-xl font-bold"
            >
              환불
            </button>
            <button
              onClick={() => setShowQuery(true)}
              className="w-[160px] h-[80px] bg-gray-900 text-white rounded-2xl hover:bg-gray-800 text-xl font-bold"
            >
              영수증
            </button>
            <HoldButton
              onHold={async () => alert("보류 기능 구현 중")}
              onHoldList={() => {}}
              onResume={() => {}}
              className="w-[160px] h-[78px] bg-yellow-500 text-white rounded-2xl hover:bg-yellow-600 text-xl font-bold"
            >
              보류
            </HoldButton>
            <button
              onClick={() => setShowSearch(true)}
              className="w-[160px] h-[80px] bg-teal-500 text-white rounded-2xl hover:bg-teal-600 text-xl font-bold"
            >
              상품검색
            </button>

            <button
              className="w-[160px] h-[80px] bg-teal-500 text-white rounded-2xl hover:bg-teal-600 text-xl font-bold"
            >
             폐기
            </button>
          </div>
        </div>
      </div>

      <SummarySection
        totalAmount={totalAmount}
        receivedAmount={paidTotal}
        changeAmount={changeAmount}
        remainingAmount={Math.max(totalAmount - paidTotal, 0)}
      />

      {/* 모달 */}
      {showSearch && (
        <ProductSearchModal
          onClose={() => setShowSearch(false)}
          onSelect={(p) => window.addItemToSales?.(p)}
        />
      )}
      {showQuery && <ReceiptQueryModal onClose={() => setShowQuery(false)} />}
      {showRefund && (
        <RefundModal
          onClose={() => setShowRefund(false)}
          onRefundComplete={() => {
            setShowRefund(false);
            alert("✅ 환불 완료되었습니다.");
          }}
        />
      )}
    </div>
  );
}

export default SalesRegister;
