import { useState, useEffect } from "react";
import PaymentSection from "../components/payment/PaymentSection";
import ProductSearchModal from "../components/shared/ProductSearchModal";
import ReceiptQuery from "../components/receipt/ReceiptQuery";
import SalesTable from "../components/sales/SalesTable";
import { getProductByBarcode } from "../api/productApi";
import BarcodeListener from "../components/BarcodeListener";
import SummarySection from "../components/shared/SummarySection";
import RefundModal from "../components/refund/RefundModal";
import HoldButton from "../components/hold/HoldButton";
import {
  createOrder,
  completeOrder,
  holdOrder,
  getHoldOrders,
  resumeOrder,
} from "../api/sdApi";

function SalesRegister() {
  const [showQuery, setShowQuery] = useState(false);
  const [showRefund, setShowRefund] = useState(false); // ✅ 추가됨
  const [totalAmount, setTotalAmount] = useState(0);
  const [receivedAmount, setReceivedAmount] = useState(0);
  const [changeAmount, setChangeAmount] = useState(0);
  const [showSearch, setShowSearch] = useState(false);

  const [currentOrder, setCurrentOrder] = useState(null);
  const [holdList, setHoldList] = useState([]);
  const [salesItems, setSalesItems] = useState([]); // ✅ 현재 판매중인 상품 목록

   // ✅ 주문 생성 (페이지 진입 시 자동 생성)
    useEffect(() => {
      const initOrder = async () => {
        try {
          // 1️⃣ 로컬스토리지에 이전 주문 ID가 있으면 복구 시도
          const savedOrder = localStorage.getItem("currentOrder");
          if (savedOrder) {
            const parsed = JSON.parse(savedOrder);
            console.log("🔁 기존 진행 주문 복구:", parsed);
            setCurrentOrder(parsed);
            return;
          }

          // 2️⃣ 없으면 새 주문 생성
          const order = await createOrder();
          setCurrentOrder(order);

          localStorage.setItem("currentOrder", JSON.stringify(order));

          console.log("🆕 새 주문 생성:", order);
        } catch (err) {
          console.error("주문 생성 오류:", err);
        }
      };
      initOrder();
    }, []);

    const handleItemAdded = (item) => {
    console.log("✅ 새 상품 추가됨:", item);
    if (window.addItemToSales) {
      window.addItemToSales({
        id: item.id,
        name: item.name,
        price: item.price,
        qty: 1,
        stock: item.stock,
      });
    }
  };


  // ✅ 총매출 변화 감지
  const handleTotalChange = (total) => {
    console.log("총 매출:", total);
    setTotalAmount(total);
  };

 // ✅ 결제 완료 처리
  const handlePaymentSuccess = async () => {
    if (!currentOrder) return alert("주문이 없습니다.");
    try {
      await completeOrder(currentOrder.orderId);
      alert("💳 결제 완료 및 매출 반영됨!");
      // 다음 주문 자동 생성
      const next = await createOrder();
      setCurrentOrder(next);
    } catch (err) {
      console.error("결제 완료 오류:", err);
    }
  };

  // ✅ 바코드 스캔 시 상품 추가
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

   // ✅ 주문 보류 처리
  const handleHold = async () => {
  if (!currentOrder) return alert("보류할 주문이 없습니다.");
  if (!salesItems || salesItems.length === 0) {
    return alert("상품이 없습니다. 상품을 추가한 후 보류할 수 있습니다.");
  }

  try {
    await holdOrder(currentOrder.orderId);
    alert(`🟡 주문 ${currentOrder.orderNo || currentOrder.orderId} 이 보류되었습니다.`);

    const next = await createOrder();
    setCurrentOrder(next);
    setTotalAmount(0);
    setReceivedAmount(0);
    setChangeAmount(0);

    if (window.addItemToSales) {
      window.addItemToSales({ reset: true });
    }

    console.log("🆕 새 주문 생성:", next);
  } catch (err) {
    console.error("보류 처리 오류:", err);
    alert("보류 중 오류가 발생했습니다.");
  }
};

  // ✅ 보류 목록 조회
  const handleGetHoldList = async () => {
    try {
      const list = await getHoldOrders();
      setHoldList(list);
    } catch (err) {
      console.error("보류 목록 오류:", err);
    }
  };

  // ✅ 보류 재개
  const handleResume = async (orderId) => {
    try {
      const resumed = await resumeOrder(orderId);
      setCurrentOrder(resumed);
      alert(`♻️ 주문 ${resumed.orderNo || resumed.orderId} 재개됨`);
    } catch (err) {
      console.error("보류 재개 오류:", err);
    }
  };

  return (
    <div className="p-10 bg-gray-50 min-h-screen text-[18px] relative">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold">판매등록</h1>
        {currentOrder && (
          <span className="text-gray-600">
            🧾 주문번호:{" "}
            <b>
              {currentOrder.orderNo
                ? currentOrder.orderNo
                : `ID-${currentOrder.orderId}`}
            </b>
          </span>
        )}
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
            onSuccess={handlePaymentSuccess}
          />

          {/* 환불 */}
          <button
            onClick={() => setShowRefund(true)}
            className="bg-red-500 text-white w-40 h-20 rounded-2xl hover:bg-red-600 text-xl font-bold shadow-lg transition-transform active:scale-95"
          >
            환불
          </button>

          {/* 영수증 */}
          <button
            onClick={() => setShowQuery(true)}
            className="bg-gray-900 text-white w-40 h-20 rounded-2xl hover:bg-gray-800 text-xl font-bold shadow-lg transition-transform active:scale-95"
          >
            영수증
          </button>

          {/* 보류 버튼 */}
         <HoldButton
            onHold={handleHold}
            onHoldList={handleGetHoldList}
            onResume={handleResume}
            holdList={holdList}
          />

          {/* 상품 검색 버튼 */}
          <button
            onClick={() => setShowSearch(true)}
            className="bg-teal-500 text-white w-40 h-20 rounded-2xl hover:bg-teal-600 text-xl font-bold shadow-lg transition-transform active:scale-95"
          >
            상품검색
          </button>

          {/* ✅ 모달은 조건부 렌더링으로 변경 */}
          {showSearch && (
            <ProductSearchModal
              onClose={() => setShowSearch(false)}
              onSelect={handleItemAdded}
              orderId={currentOrder?.orderId}
            />
          )}

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
      {showRefund && <RefundModal onClose={() => setShowRefund(false)} />}
    </div>
  );
}

export default SalesRegister;