
import api, { createPOHeader } from "../api/poApi";
import React, { useEffect, useState } from "react";
import { confirmOrder, deleteCartItems, getSavedCartList, saveCart, updateQuantity } from "../api/poApi";
import BudgetBar from "../components/BudgetBar";
import CapacityChart from "../components/CapacityChart";
import ItemList from "../components/ItemList";
import SavedCartModal from "../components/SavedCartModal";
import NeedleChart from "../components/NeedleChart";
import { mockItems, mockSavedCarts, mockWarehouseData } from "../mock/Mockup";
import Empty from "../components/Empty";
import InsertNameModal from "../components/InsertNameModal";

export default function POPage() {
  const [items, setItems] = useState(mockItems);
  const [savedCarts] = useState(mockSavedCarts);
  const [poId, setPoId] = useState(null);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);




  /** '장바구니 추가' 버튼이랑 연결 */
  const handleAddToCart = async (product) => {
  try {
    // 1️⃣ 아직 발주 헤더(장바구니)가 없다면 새로 생성
    let currentPoId = poId;
    if (!currentPoId) {
      currentPoId = await createPOHeader(); // 💡 여기서 헤더 생성
    }

    // 2️⃣ 생성된 poId 기준으로 아이템 추가
    await api.post(`/api/po/${currentPoId}/items`, {
      productId: product.id,
      qty: 1,
    });

    // 3️⃣ 프론트 상태 업데이트
    setItems((prev) => [...prev, { ...product, qty: 1, selected: false }]);
  } catch (err) {
    console.error("상품 추가 실패:", err);
    alert("장바구니 추가 중 오류가 발생했습니다.");
  }
};











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
    const newQty = currentQty -1;
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
  const [selectAll, setSelectAll] = useState(false);
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

  // 모달에서 이름 입력 후 '저장' 클릭 시 실행
  const handleConfirmSave = async (cartName) => {
    try {
      await saveCart(poId, cartName); // 백엔드에서 이름 필드 받는 경우
      alert(`'${cartName}' 장바구니가 저장되었습니다.`);
    } catch (err) {
      console.error("장바구니 저장 실패:", err);
      alert("장바구니 저장 중 오류가 발생했습니다.");
    } finally {
      setIsNameModalOpen(false);
    }
  };



  // '불러오기' 버튼 클릭시 
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
    try {
      const poId = 1; // 추후 실제 발주 id로 교체하기 
      await confirmOrder(poId);
      alert(`${items.length}개 상품을 발주 확정했습니다.`);
      // window.location.reload(); // 필요시 UI 초기화 or 목록 새로고침
    } catch (err){
      console.error("발주 요청 실패:", err);
      alert("발주 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex justify-center">
      {items.length === 0 ? (
          
          <Empty handleLoad={handleLoad}/>

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