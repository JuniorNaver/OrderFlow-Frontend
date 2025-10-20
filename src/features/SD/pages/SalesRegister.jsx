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
  const [receivedAmount, setReceivedAmount] = useState(0);
  const [changeAmount, setChangeAmount] = useState(0);
  const [paidTotal, setPaidTotal] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);

  // ✅ 1. 주문 생성
  useEffect(() => {
    let mounted = true;
    Promise.resolve().then(async () => {
      try {
        const saved = localStorage.getItem("currentOrder");

        if (saved) {
          const parsed = JSON.parse(saved);
          const res = await fetch(`http://localhost:8080/api/sd/${parsed.orderId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.salesStatus !== "COMPLETED" && data.salesStatus !== "CANCELLED") {
              console.log("♻️ 기존 주문 복원:", data);
              setCurrentOrder(data);
              localStorage.setItem("currentOrder", JSON.stringify(data));
              return;
            }
          }
        }

        const order = await createOrder();
        if (mounted) {
          setCurrentOrder(order);
          localStorage.setItem("currentOrder", JSON.stringify(order));
          console.log("🆕 새 주문 생성:", order);
        }
      } catch (err) {
        console.error("❌ 주문 생성 오류:", err);
        alert("주문 생성 중 오류가 발생했습니다.");
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  // ✅ 상품 추가
  const handleItemAdded = (item) => {
    const productName =
      item.productName ||
      item.name ||
      item.product?.productName ||
      item.lot?.product?.productName ||
      "상품명 미등록";

    const gtin =
      item.gtin ||
      item.product?.gtin ||
      item.lot?.gtin ||
      item.lot?.product?.gtin ||
      Date.now();

    const price =
      item.price ||
      item.unitPrice ||
      item.product?.price ||
      item.lot?.product?.price ||
      0;

    const stock =
      item.stock ||
      item.quantity ||
      item.lot?.quantity ||
      item.availableQty ||
      0;

    const product = { id: gtin, name: productName, price, qty: 1, stock };
    if (window.addItemToSales) window.addItemToSales(product);
  };

  // ✅ 결제 완료
  const handlePaymentSuccess = async () => {
    if (!currentOrder) return alert("주문이 없습니다.");
    const finalPaid = paidTotal > 0 ? paidTotal : totalAmount;
    if (Math.abs(finalPaid - totalAmount) > 1e-3)
      return alert("💳 일부 금액만 결제되었습니다.");

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
      setReceivedAmount(0);
      setChangeAmount(0);
    } catch (err) {
      console.error("결제 완료 오류:", err);
      alert("결제 완료 중 오류가 발생했습니다.");
    }
  };

  // ✅ 바코드 스캔
  const handleBarcodeScan = async (code) => {
    if (!currentOrder) return alert("⛔ 주문이 아직 생성되지 않았습니다.");
    try {
      const product = await getProductByBarcode(code);
      if (product && window.addItemToSales) {
        window.addItemToSales({
          id: product.id || product.gtin,
          name: product.name || product.productName,
          price: product.price || product.unitPrice,
          qty: 1,
          stock: product.stock || product.quantity,
        });
      } else alert("상품을 찾을 수 없습니다.");
    } catch (e) {
      console.error("바코드 검색 오류:", e);
      alert("바코드 검색 중 오류 발생");
    }
  };

  // ✅ 보류 처리
  const handleHold = async () => {
    if (!currentOrder) return alert("보류할 주문이 없습니다.");
    if (!salesItems.length) return alert("상품이 없습니다.");

    try {
      await saveHold(currentOrder.orderId, salesItems);
      alert(`🟡 주문 ${currentOrder.orderNo || currentOrder.orderId} 보류됨`);

      const next = await createOrder();
      setCurrentOrder(next);
      localStorage.setItem("currentOrder", JSON.stringify(next));

      if (window.clearSalesItems) window.clearSalesItems();
      setSalesItems([]);
      setTotalAmount(0);
      setReceivedAmount(0);
      setChangeAmount(0);
      setPaidTotal(0);
    } catch (err) {
      console.error("보류 처리 오류:", err);
      alert("보류 중 오류가 발생했습니다.");
    }
  };

  // ✅ 보류 목록 조회
  const handleGetHoldList = async () => {
    try {
      const list = await getHolds();
      setHoldList(list);
    } catch (err) {
      console.error("보류 목록 오류:", err);
    }
  };

  // ✅ 보류 재개
  const handleResume = async (orderId) => {
    try {
      const resumed = await resumeHold(orderId);
      setCurrentOrder(resumed);
      localStorage.setItem("currentOrder", JSON.stringify(resumed));
      alert(`♻️ 주문 ${resumed.orderNo || resumed.orderId} 재개됨`);

      if (window.clearSalesItems) window.clearSalesItems();

      if (resumed.salesItems?.length > 0) {
        resumed.salesItems.forEach((item) => {
          window.addItemToSales({
            id: item.id || Date.now(),
            name: item.productName || "상품명 미등록",
            price: item.sdPrice || 0,
            qty: item.salesQuantity || 1,
            stock: item.stockQuantity || 0,
          });
        });
      }
    } catch (err) {
      console.error("보류 재개 오류:", err);
      alert("보류 재개 중 오류가 발생했습니다.");
    }
  };

  return (
  <div className="p-10 bg-gray-50 min-h-screen text-[18px] relative overflow-visible">
    {/* 상단 헤더 */}
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

    {/* 메인 컨텐츠 */}
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 max-w-[1440px] mx-auto">
      {/* 좌측: 판매 테이블 */}
      <div className="relative">
        <SalesTable
          onTotalChange={setTotalAmount}
          onAddItem={(fn) => (window.addItemToSales = fn)}
          onItemsChange={setSalesItems}
        />
        <BarcodeListener onBarcodeScan={handleBarcodeScan} />
      </div>

      {/* 💳 우측 패널 */}
<div className="flex flex-col items-center space-y-8">
  {/* 🧭 기능 버튼 2×3 고정 */}
  <div
    className="grid grid-cols-2 gap-5"
    style={{
      width: "340px",
      justifyItems: "center",
      alignItems: "center",
    }}
  >
    {/* ✅ 결제하기 = PaymentSection 컴포넌트 */}
    <div className="w-[160px] h-[78px]">
      <PaymentSection
        totalAmount={totalAmount}
        currentOrder={currentOrder}
        onSuccess={handlePaymentSuccess}
        onPaymentComplete={(received, change) => {
          setReceivedAmount(received);
          setChangeAmount(change);
          setPaidTotal(received);
        }}
        setPaidTotal={setPaidTotal}
      />
    </div>

    {/* 나머지 버튼들은 동일한 크기 */}
    <button
      onClick={() => setShowRefund(true)}
      className="w-[160px] h-[80px] flex justify-center items-center bg-red-500 text-white rounded-2xl hover:bg-red-600 text-xl font-bold shadow-lg transition-transform active:scale-95"
    >
      환불
    </button>

    <button
      onClick={() => setShowQuery(true)}
      className="w-[160px] h-[80px] flex justify-center items-center bg-gray-900 text-white rounded-2xl hover:bg-gray-800 text-xl font-bold shadow-lg transition-transform active:scale-95"
    >
      영수증
    </button>

    <HoldButton
      onHold={handleHold}
      onHoldList={handleGetHoldList}
      onResume={handleResume}
      holdList={holdList}
      className="w-[160px] h-[78px] flex justify-center items-center bg-yellow-500 text-white rounded-2xl hover:bg-yellow-600 text-xl font-bold shadow-lg transition-transform active:scale-95"
    >
      보류
    </HoldButton>

    <button
      onClick={() => {
        if (!currentOrder)
          return alert("⛔ 주문이 아직 생성되지 않았습니다.");
        setShowSearch(true);
      }}
      className="w-[160px] h-[80px] flex justify-center items-center bg-teal-500 text-white rounded-2xl hover:bg-teal-600 text-xl font-bold shadow-lg transition-transform active:scale-95"
    >
      상품검색
    </button>

    <button
      className="w-[160px] h-[80px] flex justify-center items-center bg-purple-500 text-white rounded-2xl hover:bg-purple-600 text-xl font-bold shadow-lg transition-transform active:scale-95"
    >
      재고조정
    </button>
  </div>
</div>

</div>

    {/* 하단 요약 섹션 */}
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
        onSelect={handleItemAdded}
        orderId={currentOrder?.orderId}
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
