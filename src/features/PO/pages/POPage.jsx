import axios from "axios";
import React, { useEffect, useState } from "react";
import { confirmOrder, deleteCartItems, getCartItems, saveCart, updateQuantity } from "../api/poApi";
import BudgetBar from "../components/BudgetBar";
import CapacityChart from "../components/CapacityChart";
import ItemList from "../components/ItemList";
import SavedCartModal from "../components/SavedCart";
import NeedleChart from "../components/NeedleChart";

export default function POPage() {
  const [items, setItems] = useState([
    { id: 1, name: "햇반(100g)", gtin: "01584123", price: 1000, margin: 500, qty: 2 },
    { id: 2, name: "진라면", gtin: "09843122", price: 1200, margin: 600, qty: 1 },
    { id: 3, name: "코카콜라 500ml", price: 9000, margin: 4500, qty: 100 },
    { id: 4, name: "삼다수 2L", gtin: "8801234560011", price: 1200, margin: 600, qty: 3 },
    { id: 5, name: "비비고 왕교자", gtin: "8801234560028", price: 9800, margin: 4900, qty: 2 },
    { id: 6, name: "서울우유 1L", gtin: "8801234560035", price: 2600, margin: 1300, qty: 1 },
    { id: 7, name: "농심 새우깡", gtin: "8801234560042", price: 1500, margin: 750, qty: 5 },
    { id: 8, name: "CJ 햇반컵밥 불고기덮밥", gtin: "8801234560059", price: 3900, margin: 1950, qty: 2 },
    { id: 9, name: "오뚜기 진짬뽕", gtin: "8801234560066", price: 1400, margin: 700, qty: 4 },
    { id: 10, name: "코카콜라 1.5L", gtin: "8801234560073", price: 2300, margin: 1150, qty: 6 },
  ]);

  // 장바구니 불러오기 (임의의 poId와 status)
  const [poId] = useState(1);
  const [status] = useState("PO");
  useEffect(() => {
    // API 호출 시 poId와 status를 전달
    getCartItems(poId, status)
      .then(initialItems => {
        const initializedItems = initialItems.map(item => ({...item, selected : item.selected ?? false}));
        setItems(initializedItems);
      }).catch(err => console.error("장바구니 로드 오류:", err));
  }, [poId, status]); // poId와 status가 변경되면 다시 로드

  // 수량 증가
  const handleIncrease = async (itemId, currentQty) => {
    const newQty = currentQty + 1;
    try {
      // 서버에 수량 업데이트 요청
      await updateQuantity(itemId, newQty);
      setItems((prev) =>
        prev.map((it) =>
          it.id === itemId
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
  const handleDecrease = async (itemId, currentQty) => {
    if (currentQty <= 1) return;
    const newQty = currentQty -1;
    try {
      await updateQuantity(itemId, newQty);
      setItems((prev) =>
        prev.map((it) =>
          it.id === itemId 
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
        item.id === id ? { ...item, selected: !item.selected } : item
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

  // 창고 용량 임시데이터 
  const warehouseData = {
      room: { current: 600, incoming: 200, capacity: 1000 },
      cold: { current: 400, incoming: 100, capacity: 800 },
      frozen: { current: 300, incoming: 50, capacity: 600 },
  };

  // 삭제버튼
  const handleDelete = async () => {
    const selectedItems = items.filter((it) => it.selected); // 선택된 항목만 필터링
    if (selectedItems.length === 0) {
        alert("삭제할 항목을 선택해주세요."); 
        return;
    }
    const itemIdsToDelete = selectedItems.map(it => it.id); // 삭제할 ID 목록 추출
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
  const handleSave = async () => {
  try {
    await saveCart(poId, items); // 신규 API 필요
    alert("장바구니가 성공적으로 저장되었습니다.");
  } catch (err) {
    console.error("장바구니 저장 실패:", err);
    alert("저장 중 오류가 발생했습니다.");
  }
};

  // 불러오기 버튼 (목록 모달 표시)
  const handleLoad = () => {
    setShowSavedList(true);
  };

  // 특정 저장본을 클릭했을 때
  const handleSelectSavedCart = (cart) => {
    setItems(cart.items);
    setShowSavedList(false);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setShowSavedList(false);
  };

  // 불러오기 임시 데이터 
  const [showSavedList, setShowSavedList] = useState(false); // 모달 표시 여부
  const [savedCarts] = useState([
    {
      id: "cart-001",
      name: "2월 발주 리스트",
      date: "2025-02-20",
      items: [
        { id: 11, name: "코카콜라 1.5L", price: 2300, margin: 1150, qty: 10 },
        { id: 12, name: "삼다수 2L", price: 1200, margin: 600, qty: 5 },
      ],
    },
    {
      id: "cart-002",
      name: "3월 초 매입 리스트",
      date: "2025-03-02",
      items: [
        { id: 21, name: "햇반컵밥 불고기덮밥", price: 3900, margin: 1950, qty: 3 },
        { id: 22, name: "비비고 왕교자", price: 9800, margin: 4900, qty: 2 },
      ],
    },
    {
      id: "cart-003",
      name: "테스트용 장바구니",
      date: "2025-03-15",
      items: [
        { id: 31, name: "진라면 매운맛", price: 1300, margin: 600, qty: 4 },
        { id: 32, name: "농심 새우깡", price: 1500, margin: 750, qty: 6 },
      ],
    },
  ]);

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
            <CapacityChart data={warehouseData} />
          </div>
        </div>
      </div>

      {/* 불러오기 모달 표시 */}
      {showSavedList && (
        <SavedCartModal
          carts={savedCarts}
          onSelect={handleSelectSavedCart}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}