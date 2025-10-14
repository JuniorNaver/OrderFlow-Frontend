import {  Navigate, useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getRecommend, createPurchaseRequest } from "../api/api";
import { placeholder, CATEGORIES, MOCK_PRODUCTS } from "../mock/Categories";
import ProductCard from "../components/ProductCard";
import { useState, useEffect } from "react";


export default function RecommendListPage() {
  const { storeId = "" } = useParams();
  const nav = useNavigate();
  
  const [selectedCategory, setSelectedCategory] = useState("가공식품"); // 대분류
  const [selectedSubCategory, setSelectedSubCategory] = useState(null); // 하위 분류
  const [isInitialized, setIsInitialized] = useState(false);

  const [hoverCategory, setHoverCategory] = useState("");
   const [purchaseList, setPurchaseList] = useState({}); 

  // 추천 발주 API
  const q = useQuery({
    queryKey: ["recommend", storeId],
    queryFn: () => getRecommend(storeId),
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });

  useEffect(() => {
    console.log("useEffect 실행됨", { isSuccess: q.isSuccess, dataUpdatedAt: q.dataUpdatedAt, isInitialized });
  if (!q.isSuccess || isInitialized) return;

  const data = q.data;
  if (!Array.isArray(data) || data.length === 0) return;

  const initial = {};
  data.forEach(i => {
    if (i.suggestedQty > 0) {
      initial[i.productCode] = i.suggestedQty;
    }
  });

  setPurchaseList(initial);
  setIsInitialized(true);
}, [q.isSuccess]);

  const createMut = useMutation({
    mutationFn: (lines) => createPurchaseRequest(storeId, { storeId, lines }),
  });

  const handleQtyChange = (productCode, qty) => {
    setPurchaseList(prev => {
      // 수량이 1 이상일 때만 추가/업데이트
      if (qty > 0) {
        return { ...prev, [productCode]: qty };
      }
      // 수량이 0이면 목록에서 제거 (선택적)
      const newState = { ...prev };
      delete newState[productCode];
      return newState;
    });
  };


  const lines = Object.keys(purchaseList).map(productCode => ({
    productCode,
    qty: purchaseList[productCode],
  }));

  const level1Data = CATEGORIES;
  const level2Data = level1Data.find(cat => cat.name === hoverCategory)?.sub || [];


  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);
    setSelectedSubCategory(null); // 대분류만 선택 시 하위 분류 초기화
    setHoverCategory(""); // 클릭 시 드롭다운 닫기
};
  const handleSubCategoryClick = (categoryName, subName) => {
        setSelectedCategory(categoryName);
        setSelectedSubCategory(subName);
        setHoverCategory(""); // 드롭다운 닫기
    };

  const filteredProducts = MOCK_PRODUCTS.filter(p =>{
    const matchCategory = selectedCategory ? p.category === selectedCategory : true;
    const matchSub = selectedSubCategory  ? p.subCategory === selectedSubCategory : true;
    return matchCategory && matchSub;
  })

  const goToPO = () => {
    nav("/po", {
      state: { from: "pr-recommend", storeId, items: lines },
    });
  };

  return (
    <div className="space-y-5">
      {/* 상단 헤더 */}
      <header className="flex justify-between items-center border-b pb-2">
        <h1 className="text-2xl font-bold">발주</h1>
        <span className="text-sm text-gray-500">
          {new Date().toLocaleString()}
        </span>
      </header>

      {/* 카테고리 필터 */}
      <div className="flex justify-start gap-1 overflow-x-auto py-1 border-b">
        {level1Data.map(c => ( // level1Data(CATEGORIES)를 매핑합니다.
        <div
         key={c.name}
         className="relative overflow-visible"
           onMouseEnter={() => setHoverCategory(c.name)}
            onMouseLeave={() => setHoverCategory("")}
           >
           {/* 1차 카테고리 버튼 */}
           <button
             className={`px-4 py-2 text-sm font-medium transition duration-150 ease-in-out ${
             selectedCategory === c.name 
                  ? "text-red-600 border-b-2 border-red-500 font-bold" 
                   : "text-gray-700 hover:text-red-500"
              }`}
             onClick={() => handleCategoryClick(c.name)}
             >
             {c.name}
            </button>

            {/* 하위 카테고리 드롭다운 패널 */}
            {hoverCategory === c.name && c.sub?.length > 0 && (
             <div 
              className="absolute left-full top-0 mt-0.5 bg-white shadow-xl rounded-lg border border-gray-200 p-3 grid grid-cols-1 gap-y-1 z-50 min-w-[500px]"
                // 하위 카테고리가 4열로 펼쳐지도록 설정
               >
              {level2Data.map(sub => (
                <button
                   key={sub}
                  className={`text-sm px-2 py-1 text-left rounded-md transition duration-100 ${
                   selectedSubCategory === sub && selectedCategory === c.name
                           ? "bg-red-50 text-red-700 font-medium" 
                           : "text-gray-700 hover:bg-gray-100"
            }`}
                     onClick={() => handleSubCategoryClick(c.name, sub)}
                   >
                 {sub}
               </button>
                 ))}
             </div>
            )}
        </div>
         ))}
      </div>
      {/* ✅ 변경 끝: 카테고리 필터 UI */}

        {/* ✅ 8. 상품 목록 (필터링된 상품)을 카테고리 옆에 배치 */}
        <div className="flex-grow">
          {q.isLoading ? (
            <div>불러오는 중...</div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredProducts.map(p => (
                <ProductCard
                  key={p.productCode}
                  product={{
                    ...p,
                    imageUrl: placeholder(p.productCode, 200),
                    // ✅ purchaseList의 현재 수량을 ProductCard에 전달
                    suggestedQty: purchaseList[p.productCode],
                  }}
                  // ✅ 수량 변경 핸들러 연결
                  onQtyChange={handleQtyChange}
                  onImageClick={() => nav(`/pr/product/${p.productCode}`)}
                />
              ))}
            </div>
          )}
        </div>

      <div className="border-t pt-3 text-sm space-y-3">
        <div className="flex justify-between items-center">
           <span className="font-medium">담긴 상품: {lines.length}개</span>
          <span className="text-gray-500">
            ※ 18:00 이후 발주는 익일 배송 예정입니다.
        </span>
        </div>
            <div className="flex justify-end gap-3">
        <button
          className="px-4 py-2 rounded-xl border bg-white hover:bg-gray-50"
          onClick={goToPO}
           disabled={lines.length === 0}
          >
             전체 담아서 PO로 이동
            </button>
            <button
            className="px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600"
            onClick={() => createMut.mutate(lines)}
             disabled={createMut.isPending || lines.length === 0}
            >
           즉시 발주
           </button>
         </div>
      </div>
</div>
   );
};