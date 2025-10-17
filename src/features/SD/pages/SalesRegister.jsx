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
import {
  createOrder,
  completeOrder,
  holdOrder,
  getHoldOrders,
  resumeOrder,
} from "../api/sdApi";

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

  // ✅ 1. 주문 생성 (첫 진입 시)
  useEffect(() => {
  let mounted = true;
  Promise.resolve().then(async () => {
    try {
      const saved = localStorage.getItem("currentOrder");

      if (saved) {
        const parsed = JSON.parse(saved);

        // ✅ 기존 주문 상태 확인 (백엔드 조회)
        const res = await fetch(`http://localhost:8080/api/sd/${parsed.orderId}`);
        if (res.ok) {
          const data = await res.json();

          // ✅ 미완료 주문이면 그대로 이어서 사용
          if (data.salesStatus !== "COMPLETED" && data.salesStatus !== "CANCELLED") {
            console.log("♻️ 기존 주문 복원:", data);
            setCurrentOrder(data);
            localStorage.setItem("currentOrder", JSON.stringify(data));
            return;
          }
        }
      }

      // ✅ 없거나 이미 완료된 경우 → 새 주문 생성
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

  // ✅ 2. 상품 추가 (ProductSearchModal → SalesTable)
  const handleItemAdded = (item) => {
    console.log("✅ 새 상품 추가됨 (원본):", item);

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

    const product = {
      id: gtin,
      name: productName,
      price: price,
      qty: 1,
      stock: stock,
    };

    console.log("🧩 변환된 상품:", product);

    if (window.addItemToSales) {
      window.addItemToSales(product);
    } else {
      console.warn("⚠️ addItemToSales 함수가 아직 등록되지 않았습니다.");
    }
  };

  // ✅ 3. 결제 완료 → 주문 확정 + 새 주문 생성
 const handlePaymentSuccess = async () => {
  if (!currentOrder) return alert("주문이 없습니다.");

  const finalPaid = paidTotal > 0 ? paidTotal : totalAmount;
  if (Math.abs(finalPaid - totalAmount) > 1e-3) {
    alert("💳 일부 금액만 결제되었습니다. 남은 금액을 결제해주세요.");
    return;
  }

  try {
    await completeOrder(currentOrder.orderId);
    alert("💳 결제 완료 및 매출 반영됨!");

    // ✅ 1️⃣ 로컬스토리지 완전 초기화
    localStorage.removeItem("currentOrder");

    // ✅ 2️⃣ 새 주문 생성
    const next = await createOrder();

    // ✅ 3️⃣ 상태 갱신
    setCurrentOrder(next);
    localStorage.setItem("currentOrder", JSON.stringify(next));

    // ✅ 4️⃣ 화면 상태 초기화
    setSalesItems([]);
    setTotalAmount(0);
    setPaidTotal(0);
    setReceivedAmount(0);
    setChangeAmount(0);

    // ✅ 5️⃣ SalesTable 리셋
    if (window.addItemToSales) window.addItemToSales({ reset: true });

    console.log("🆕 새 주문으로 완전히 초기화됨:", next);
  } catch (err) {
    console.error("결제 완료 오류:", err);
    alert("결제 완료 중 오류가 발생했습니다.");
  }

};

  // ✅ 4. 바코드 스캔 상품 추가
  const handleBarcodeScan = async (code) => {
    console.log("스캔된 바코드:", code);
    if (!currentOrder) {
      alert("⛔ 주문이 아직 생성되지 않았습니다. 잠시 후 다시 시도하세요.");
      return;
    }

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
      } else {
        alert("상품을 찾을 수 없습니다.");
      }
    } catch (e) {
      console.error("바코드 검색 오류:", e);
      alert("바코드 검색 중 오류 발생");
    }
  };

  // ✅ 5. 보류 처리
  const handleHold = async () => {
    if (!currentOrder) return alert("보류할 주문이 없습니다.");
    if (!salesItems || salesItems.length === 0) {
      return alert("상품이 없습니다. 상품을 추가한 후 보류할 수 있습니다.");
    }

    try {
      await holdOrder(currentOrder.orderId);
      alert(`🟡 주문 ${currentOrder.orderNo || currentOrder.orderId} 보류됨`);

      const next = await createOrder();
      setCurrentOrder(next);
      localStorage.setItem("currentOrder", JSON.stringify(next));

      setTotalAmount(0);
      setReceivedAmount(0);
      setChangeAmount(0);
      if (window.addItemToSales) window.addItemToSales({ reset: true });
    } catch (err) {
      console.error("보류 처리 오류:", err);
      alert("보류 중 오류가 발생했습니다.");
    }
  };

  // ✅ 6. 보류 목록 조회
  const handleGetHoldList = async () => {
    try {
      const list = await getHoldOrders();
      setHoldList(list);
    } catch (err) {
      console.error("보류 목록 오류:", err);
    }
  };

  // ✅ 7. 보류 재개
  const handleResume = async (orderId) => {
    try {
      const resumed = await resumeOrder(orderId);
      setCurrentOrder(resumed);
      localStorage.setItem("currentOrder", JSON.stringify(resumed));
      alert(`♻️ 주문 ${resumed.orderNo || resumed.orderId} 재개됨`);
    } catch (err) {
      console.error("보류 재개 오류:", err);
    }
  };

  return (
    <div className="p-10 bg-gray-50 min-h-screen text-[18px] relative overflow-hidden">
      {/* 상단 헤더 */}
      <div className="flex justify-between items-center mb-10 w-full max-w-[1440px] mx-auto">
        <h1 className="text-4xl font-bold">판매등록</h1>
        {currentOrder && (
          <div className="flex items-center text-gray-600 gap-2">
            <span>🧾</span>
            <span>
              주문번호:{" "}
              <b className="text-gray-800">
                {currentOrder.orderNo
                  ? currentOrder.orderNo
                  : `ID-${currentOrder.orderId}`}
              </b>
            </span>
          </div>
        )}
      </div>

      {/* 메인 */}
      <div className="grid grid-cols-3 gap-10">
        {/* 좌측 테이블 */}
        <div className="col-span-2 relative">
          <SalesTable
            onTotalChange={setTotalAmount}
            onAddItem={(fn) => (window.addItemToSales = fn)}
          />
          <BarcodeListener onBarcodeScan={handleBarcodeScan} />
        </div>

        {/* 우측 버튼 섹션 */}
        <div className="grid grid-cols-2 gap-6 justify-items-center">
          <PaymentSection
            totalAmount={totalAmount}
            currentOrder={currentOrder}
            onSuccess={handlePaymentSuccess}
            onPaymentComplete={(received, change) => {
              setReceivedAmount(received);
              setChangeAmount(change);
              setPaidTotal(received); // ✅ paidTotal 즉시 반영
            }}
            setPaidTotal={setPaidTotal}
          />

          <button
            onClick={() => setShowRefund(true)}
            className="bg-red-500 text-white w-40 h-20 rounded-2xl hover:bg-red-600 text-xl font-bold shadow-lg transition-transform active:scale-95"
          >
            환불
          </button>

          <button
            onClick={() => setShowQuery(true)}
            className="bg-gray-900 text-white w-40 h-20 rounded-2xl hover:bg-gray-800 text-xl font-bold shadow-lg transition-transform active:scale-95"
          >
            영수증
          </button>

          <HoldButton
            onHold={handleHold}
            onHoldList={handleGetHoldList}
            onResume={handleResume}
            holdList={holdList}
          />

          <button
            onClick={() => {
              if (!currentOrder) {
                alert("⛔ 주문이 아직 생성되지 않았습니다. 잠시 후 다시 시도하세요.");
                return;
              }
              setShowSearch(true);
            }}
            className="bg-teal-500 text-white w-40 h-20 rounded-2xl hover:bg-teal-600 text-xl font-bold shadow-lg transition-transform active:scale-95"
          >
            상품검색
          </button>

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
