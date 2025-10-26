
import React, { useEffect, useState } from "react";
import { usePOApi } from "../api/poApi"; // ✅ userId 자동 전달됨
import { getProduct } from "../../PR/api/product";
import { useLocation, useNavigate } from "react-router-dom";
import BudgetBar from "../components/BudgetBar";
import CapacityChart from "../components/CapacityChart";
import ItemList from "../components/ItemList";
import SavedCartModal from "../components/SavedCartModal";
import NeedleChart from "../components/NeedleChart";
import Empty from "../components/Empty";
import InsertNameModal from "../components/InsertNameModal";
import { mockSavedCarts, mockWarehouseData } from "../mock/Mockup";

// ✅ 상품 식별자 보정용 (GTIN or ProductId)
async function resolveProductIdOrGtin(raw) {
  if (raw.id || raw.productId) return { productId: raw.id ?? raw.productId };

  const gtin = raw.gtin || raw.productCode;
  if (!gtin) return {};

  try {
    const p = await getProduct(gtin);
    if (p?.id) return { productId: p.id };
    return { gtin };
  } catch {
    return { gtin };
  }
}

export default function POPage() {
  const {
    createPO,
    getCurrentCartId,
    getCartItems,
    updateQuantity,
    deleteCartItems,
    saveCart,
    getSavedCartList,
    deleteSavedCart,
    confirmOrder,
  } = usePOApi();

  const initialPoId = getCurrentCartId() || null;
  const [items, setItems] = useState([]);
  const [poId, setPoId] = useState(initialPoId);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [savedCarts, setSavedCarts] = useState(mockSavedCarts);
  const [selectAll, setSelectAll] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();


  // ✅ ‘장바구니 추가’
  const handleAddToCart = async (product, orderQty) => {
    try {
      // 1️⃣ 서버에 상품 추가 요청
      const added = await createPO({
        gtin: product.gtin,
        orderQty: orderQty ?? 1, // 기본 수량
      });

      // 2️⃣ 서버에서 최신 장바구니 아이템 목록 가져오기
      const updated = await getCartItems(added.poId);
      setItems(updated);

    } catch (err) {
      console.error("상품 추가 실패:", err);
      alert("장바구니 추가 중 오류가 발생했습니다.");
    }
  };


  // ✅ 상세 페이지에서 넘어온 품목 합치기
  useEffect(() => {
  const s = location.state;
  if (!s?.items?.length) return;

  (async () => {
    try {
      for (const product of s.items) {
        await handleAddToCart(product);
      }

      navigate("/po", { replace: true, state: null });
    } catch (err) {
      console.error("상세페이지 상품 추가 실패:", err);
    }
  })();
}, [location.state]);



  // 🧩 장바구니 페이지 로드시, 서버에서 아이템 불러오기
  useEffect(() => {
    if (!poId) return;
    (async () => {
      try {
        const itemsFromServer = await getCartItems(poId);
        console.log("불러온 장바구니:", itemsFromServer);

        const normalized = itemsFromServer.map(it => ({
          itemNo: it.itemNo,
          gtin: it.gtin,
          productName: it.productName,
          qty: it.orderQty ?? 0,
          price: it.purchasePrice ?? 0,
          totalPrice: it.total ?? (it.purchasePrice ?? 0) * (it.orderQty ?? 0),
          margin: it.margin ?? 0,
          expectedArrival: it.expectedArrival,
          selected: false,
        }));

        setItems(normalized);
      } catch (err) {
        console.error("장바구니 불러오기 실패:", err);
      }
    })();
  }, [poId]);








  // 수량 증가
  const handleIncrease = async (itemNo, currentQty) => {
    const newQty = currentQty + 1;
    try {
      // 서버에 수량 업데이트 요청
      await updateQuantity(itemNo, newQty);
      setItems((prev) =>
        prev.map((it) =>
          it.itemNo === itemNo
            ? {
              ...it,
              qty: it.qty + 1,
              totalPrice: newQty * it.price,
              totalMargin: newQty * it.margin,
            }
            : it
        )
      );
    } catch (err) {
      console.error("수량 증가 실패:", err);
      alert("서버와 통신 중 오류가 발생했습니다.");
    }
  };

  // 수량 감소
  const handleDecrease = async (itemNo, currentQty) => {
    if (currentQty <= 1) return;
    const newQty = currentQty - 1;
    try {
      await updateQuantity(itemNo, newQty);
      setItems((prev) =>
        prev.map((it) =>
          it.itemNo === itemNo
            ? {
              ...it,
              qty: newQty,
              totalPrice: newQty * it.price,
              totalMargin: newQty * it.margin,
            }
            : it
        )
      );
    } catch (err) {
      console.error("수량 감소 실패:", err);
      alert("서버와 통신 중 오류가 발생했습니다.")
    }
  };

  // 전체 선택 토글
  const handleSelectAll = () => {
    const newValue = !selectAll;
    setSelectAll(newValue);
    setItems((prev) =>
      prev.map((item) => ({ ...item, selected: newValue }))
    );
  };

  // 개별 선택
  const handleSelect = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.itemNo === id ? { ...item, selected: !item.selected } : item
      )
    );
  };






  // 총 매입가(= 현재 발주 금액) 계산
  const [usedBudget, setUsedBudget] = useState(2000000); // 예: 누적 사용 금액
  const [monthBudget, setMonthBudget] = useState(3000000); // 예: 월 예산
  const order = items.reduce(
    (sum, it) => sum + (it.totalPrice ?? it.price * it.qty),
    0
  );

  // 삭제버튼
  const handleDelete = async () => {
    const selectedItems = items.filter((it) => it.selected); // 선택된 항목만 필터링
    if (selectedItems.length === 0) {
      alert("삭제할 항목을 선택해주세요.");
      return;
    }
    const itemIdsToDelete = selectedItems.map(it => it.itemNo); // 삭제할 ID 목록 추출
    try {
      await deleteCartItems(itemIdsToDelete);
      const remaining = items.filter((it) => !it.selected);
      setItems(remaining);
    } catch (err) {
      console.error("상품 삭제 실패:", err);
      alert("상품 삭제 중 오류가 발생했습니다.");
    }
  };





  // 장바구니 저장버튼
  const handleSave = () => {
    setIsNameModalOpen(true);
  };

  // 저장시, 제목 입력
  const handleConfirmSave = async (cartName) => {
    try {
      // 장바구니 저장 요청
      await saveCart(poId, { remarks: cartName });

      alert(`'${cartName}' 장바구니가 저장되었습니다.`);

      // ✅ 저장 완료 후 목록을 다시 불러와 최신화
      const updatedList = await getSavedCartList();
      setSavedCarts(updatedList);
    } catch (err) {
      console.error("장바구니 저장 실패:", err);
      alert("장바구니 저장 중 오류가 발생했습니다.");
    } finally {
      setIsNameModalOpen(false);
    }
  };

  // '불러오기' 버튼 클릭
  const handleLoad = async () => {
    const list = await getSavedCartList();
    console.log("저장된 장바구니:", list);
    setShowSavedList(true); // 목업데이터 출력 
  };

  // 불러오기 임시 데이터 
  const [showSavedList, setShowSavedList] = useState(false); // 모달 표시 여부

  // 특정 저장본을 클릭했을 때
  const handleSelectSavedCart = (cart) => {
    setItems(cart.items);
    setShowSavedList(false);
  };

  // 불러오기 삭제 버튼 
  const handleDeleteSavedCart = async (e, cart) => {
    e.stopPropagation();
    if (!window.confirm(`'${cart.name}' 장바구니를 삭제하시겠습니까?`)) return;

    try {
      await deleteSavedCart(cart.poId); // ✅ itemNo → poId
    } catch (err) {
      console.error("장바구니 삭제 실패:", err);
    } finally {
      setSavedCarts((prev) =>
        prev.filter((c) => String(c.poId) !== String(cart.poId))
      );
    }
  };





  // 모달 닫기
  const handleCloseModal = () => {
    setShowSavedList(false);
  };

  // 발주확정 버튼
  const handleOrder = async () => {
    const selectedItems = items.filter(it => it.selected);
    if (selectedItems.length === 0) {
      alert("장바구니가 비어있습니다.");
      return;
    }
    if (!poId) {
      alert("발주 헤더가 없습니다. 다시 시도해 주세요.");
      return;
    }
    try {
      // 선택 라인만 확정하는 스펙이라면 itemNo 배열도 전달
      // await confirmOrder(poId, selectedItems.map(it => it.itemNo));
      await confirmOrder(poId);
      alert(`${selectedItems.length}개 상품을 발주 확정했습니다.`);
    } catch (err) {
      console.error("발주 요청 실패:", err);
      alert("발주 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex justify-center">
      {items.length === 0 ? (

        <Empty handleLoad={handleLoad} />

      ) : (
        <div className="w-full max-w-7xl flex items-stretch space-x-8">
          {/* 왼쪽 영역 */}
          <div className="flex-1 flex flex-col ">
            {/* 헤더 */}
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold">
                장바구니{" "}
                <span className="text-gray-500 text-lg">({items.length})</span>
              </h1>
              <div className="space-x-3">
                <button
                  onClick={handleSave}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded"
                >
                  저장
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded"
                >
                  삭제
                </button>
                <button
                  onClick={handleLoad}
                  className="bg-gray-300 hover:bg-gray-300 text-white font-semibold px-4 py-2 rounded border border-gray-300"
                >
                  불러오기
                </button>
              </div>
            </div>

            {/* 상품 목록 */}
            <ItemList
              items={items}
              selectAll={selectAll}
              onSelectAll={handleSelectAll}
              onSelect={handleSelect}
              onIncrease={handleIncrease}
              onDecrease={handleDecrease}
            />

            {/* 예산 바 */}
            <div className="mb-9">
              <BudgetBar
                used={usedBudget}
                order={order}
                budget={monthBudget}
                monthLabel="3월 발주금액"
              />
            </div>

            {/* 바늘 지표계 */}
            <div className="flex justify-start pl-5 mb-7">
              <NeedleChart value={65} max={100} />
            </div>

            {/* 발주 버튼 */}
            <div className="flex justify-center mt-12 mb-8">
              <button
                onClick={handleOrder}
                className="bg-red-500 hover:bg-red-600 text-white font-bold text-xl py-4 px-20 rounded-none shadow-md transition-all duration-200"
              >
                총 {items.length}개 발주하기
              </button>
            </div>
          </div>

          {/* 오른쪽 영역(CapacityChart) */}
          <div className="w-[350px] relative">
            <div className="sticky top-20">
              <CapacityChart data={mockWarehouseData} />
            </div>
          </div>
        </div>
      )}

      {/* 불러오기 모달 표시 */}
      {showSavedList && (
        <SavedCartModal
          carts={savedCarts}
          onSelect={handleSelectSavedCart}
          onClose={handleCloseModal}
          onDelete={handleDeleteSavedCart}
        />
      )}

      <InsertNameModal
        isOpen={isNameModalOpen}
        onClose={() => setIsNameModalOpen(false)}
        onConfirm={handleConfirmSave}
      />
    </div>
  );
};