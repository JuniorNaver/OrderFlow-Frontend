import { useState, useEffect } from "react";
import PaymentSection from "../components/payment/PaymentSection";
import ProductSearchModal from "../components/shared/ProductSearchModal";
import ReceiptQueryModal from "../components/receipt/ReceiptQueryModal";
import SalesTable from "../components/sales/SalesTable";
import { getProductByBarcode } from "../api/productApi";
import { createOrder, completeOrder, getOrderById } from "../api/sdApi";
import { saveHold, getHolds, resumeHold } from "../api/holdMAnager";
import BarcodeListener from "../components/BarcodeListener";
import SummarySection from "../components/shared/SummarySection";
import RefundModal from "../components/refund/RefundModal";
import HoldButton from "../components/hold/HoldButton";
import HoldModal from "../components/hold/HoldModal";
import DisposalEntryView from "../../STK/components/DisposalEntryView";
import { useLoading } from "/src/components/providers/LoadingProvider"; // ✅ 전역 로딩 훅
import { useToast } from "/src/components/providers/ToastProvider";   // ✅ 전역 토스트 (선택)

function SalesRegister() {
  const [showQuery, setShowQuery] = useState(false);
  const [showRefund, setShowRefund] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
   const [showDisposal, setShowDisposal] = useState(false);

  // ✅ 보류 관련 상태
  const [holdList, setHoldList] = useState([]);
  const [showHoldModal, setShowHoldModal] = useState(false);

  // ✅ 주문 관련 상태
  const [currentOrder, setCurrentOrder] = useState(null);
  const [salesItems, setSalesItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [paidTotal, setPaidTotal] = useState(0);
  const [changeAmount, setChangeAmount] = useState(0);

  const { showLoading, hideLoading } = useLoading(); // ✅ 전역 로딩
  const { showToast } = useToast(); // ✅ 토스트 (선택)

  // ✅ 주문 생성
 useEffect(() => {
  const initOrder = async () => {
    try {
      showLoading("주문 정보를 불러오는 중입니다...");

      // ✅ 1️⃣ localStorage에 저장된 주문 확인
      const saved = localStorage.getItem("currentOrder");

      if (saved) {
        const parsed = JSON.parse(saved);
        const data = await getOrderById(parsed.orderId);

        // ✅ 이미 존재하고 완료되지 않았다면 복원
        if (data && data.salesStatus !== "COMPLETED" && data.salesStatus !== "CANCELLED") {
          setCurrentOrder(data);
          localStorage.setItem("currentOrder", JSON.stringify(data));
          hideLoading();
          return; // ✅ 여기서 끝냄 (새 주문 안 만듦)
        }
      }

      // ✅ 2️⃣ 저장된 주문이 없거나 완료/취소된 상태 → 새 주문 생성
      const storeInfo = JSON.parse(localStorage.getItem("storeInfo"));
      const storeId = storeInfo?.storeId || "S001";

      const newOrder = await createOrder(storeId);
      setCurrentOrder(newOrder);
      localStorage.setItem("currentOrder", JSON.stringify(newOrder));

    } catch (err) {
      console.error("❌ 주문 생성 오류:", err);
      showToast("주문 생성 중 오류가 발생했습니다 ❌", "error");
    } finally {
      hideLoading();
    }
  };

  initOrder();
}, []);

  // ✅ 공통 상품 추가 로직 (검색 + 바코드)
  const handleAddProduct = async (product) => {
  if (!currentOrder?.orderId) {
    showToast("⛔ 주문이 아직 생성되지 않았습니다.", "error");
    return;
  }

    try {
      if (window.addItemToSales) {
        window.addItemToSales(product);
      } else {
        console.warn("⚠️ addItemToSales 미등록 상태입니다.");
      }
    } catch (err) {
      console.error("❌ 상품 추가 실패:", err);
      showToast("상품 추가 중 오류가 발생했습니다 ❌", "error");
    }
  };

  // ✅ 바코드 스캔
  const handleBarcodeScan = async (code) => {
    console.log("📡 스캔 감지:", code);
    if (!currentOrder) return showToast("⛔ 주문이 아직 생성되지 않았습니다.", "error");

    try {
      showLoading("상품 정보를 불러오는 중입니다...");
      const product = await getProductByBarcode(code);
      if (!product) return showToast("상품을 찾을 수 없습니다.", "error");
      await handleAddProduct(product);
    } catch (e) {
      console.error("바코드 처리 오류:", e);
      showToast("바코드 처리 중 오류 발생 ❌", "error");
    } finally {
      hideLoading();
    }
  };

  // ✅ 결제 완료 후 초기화
  const handlePaymentSuccess = async () => {
    if (!currentOrder) return showToast("주문이 없습니다.", "error");
    try {
      showLoading("결제 처리 중입니다...");
      await completeOrder(currentOrder.orderId);
      showToast("💳 결제 완료 및 매출 반영됨!", "success");

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
      showToast("결제 완료 중 오류 발생 ❌", "error");
    } finally {
      hideLoading();
    }
  };

 // ✅ 보류 저장
  const handleHold = async () => {
  if (!currentOrder) return showToast("⛔ 현재 주문이 없습니다.", "error");
  try {
    const items = JSON.parse(localStorage.getItem("salesItems") || "[]");
    const result = await saveHold(currentOrder.orderId, items);
    showToast(
      result.mode === "online" ? "✅ 서버에 보류 저장 완료" : "📦 오프라인 임시 저장",
      "success"
    );

    // ✅ (1) 테이블 초기화 — 바로 실행
    window.clearSalesItems?.();

    // ✅ (2) 기존 주문 제거
    localStorage.removeItem("currentOrder");

    // ✅ (3) 새 주문 생성
    const next = await createOrder();
    setCurrentOrder(next);
    localStorage.setItem("currentOrder", JSON.stringify(next));

    // ✅ (4) 금액 초기화
    setSalesItems([]);
    setTotalAmount(0);
    setPaidTotal(0);
    setChangeAmount(0);
  } catch (err) {
    showToast("보류 저장 중 오류 ❌", "error");
  }
};


  // ✅ 보류 목록 조회
  const handleHoldList = async () => {
    try {
      const holds = await getHolds();
      console.log("📋 보류 목록:", holds);
      setHoldList(Array.isArray(holds) ? holds : []);
    } catch (err) {
      console.error("보류 목록 조회 실패:", err);
    }
  };

  // ✅ 보류 주문 재개
const handleResume = async (orderId) => {
   try {
    const resumed = await resumeHold(orderId);
    setCurrentOrder(resumed);

    const items = resumed.items || resumed.salesItems || [];
    setSalesItems(items);
    if (window.loadSalesItems) window.loadSalesItems(items);

    alert("보류된 주문을 불러왔습니다.");
    setShowHoldModal(false);
  } catch (err) {
    console.error("보류 재개 실패:", err);
    alert("보류 재개 실패");
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
            onAddItem={(fn) => {
              console.log("✅ addItemToSales 등록됨");
              window.addItemToSales = fn;
            }}
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
                onHold={handleHold}
                onHoldList={handleHoldList}  // ✅ 여기에 연결됨
                onResume={handleResume}
                holdList={holdList}
              />

            <button
              onClick={() => setShowSearch(true)}
              className="w-[160px] h-[80px] bg-teal-500 text-white rounded-2xl hover:bg-teal-600 text-xl font-bold"
            >
              상품검색
            </button>

            <button
               onClick={() => setShowDisposal(true)}
              className="w-[160px] h-[80px] bg-gray-400 text-white rounded-2xl hover:bg-gray-500 text-xl font-bold"
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
          onSelect={(p) => handleAddProduct(p)}
        />
      )}
      {showQuery && <ReceiptQueryModal onClose={() => setShowQuery(false)} />}
      {showRefund && (
        <RefundModal
          onClose={() => setShowRefund(false)}
          onRefundComplete={() => {
            setShowRefund(false);
            showToast("✅ 환불 완료되었습니다.", "success");
          }}
        />
      )}
      {showHoldModal && (
        <HoldModal
          onClose={() => setShowHoldModal(false)}
          onLoadHold={(hold) => {
            console.log("선택한 보류 불러오기:", hold);
            setShowHoldModal(false);
          }}
        />
      )}
      {showDisposal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-2xl w-[80%] h-[80%] overflow-auto">
            <button
              className="absolute top-4 right-4 text-gray-600 hover:text-black"
              onClick={() => setShowDisposal(false)}
            >
              ✖
            </button>
            <DisposalEntryView />
          </div>
        </div>
      )}
    </div>
  );
}

export default SalesRegister;
