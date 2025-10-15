import { useNavigate, useParams,  } from "react-router-dom";
import { placeholder } from "../mock/Categories.mock";
import { useState, useEffect } from "react";

/**
 * @param {{ product:{productCode:string, name:string, imageUrl?:string, unitPrice?:number, suggestedQty?:number}, onClick?:(product)=>void,
 * onQtyChange?: (productCode: String, qty: number) => void }} props
 */

export default function ProductCard({ product, onClick, onQtyChange, onImageClick }) {
  const nav = useNavigate();
  const { storeId = "S001" } = useParams();
  const img = product.imageUrl || placeholder(product.productCode, 300);

  // 1. 초기 수량을 product.suggestedQty (추천 수량) 또는 1로 설정
  // `suggestedQty`는 추천 발주 목록을 불러왔을 때 API 데이터에 있을 수 있습니다.
  const initialQty = product.suggestedQty ? Number(product.suggestedQty) : 1;
  const [qty, setQty] = useState(initialQty);

  // 2. 수량이 변경될 때마다 부모 컴포넌트에 알림
  useEffect(() => {
    // onQtyChange 함수가 존재하고, 현재 수량이 initialQty와 다를 때만 실행
    if (onQtyChange && qty !== (product.suggestedQty ?? 1)) {
    onQtyChange(product.productCode, qty);
  }
}, [qty, onQtyChange, product.productCode, product.suggestedQty]); // ✅ qty가 바뀔 때마다 실행

  const increase = () => setQty(q => q + 1);
  const decrease = () => setQty(q => (q > 1 ? q - 1 : 1));

  const handleActionClick = () => {
    if (onClick) {
      // 부모에서 정의된 onClick 함수를 실행합니다.
      onClick({ productCode: product.productCode, qty });
    } else {
      // onClick이 없을 경우, (예: 디폴트 동작)
      nav("/po", {
        state: {
          from: "pr",
          storeId,
          items: [{ productCode: product.productCode, qty }],
        },
      });
    }
  };

  return (
    <div className="border rounded-2xl p-3 flex flex-col">
      {/* 이미지 */}
      <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden mb-2">
        <img src={img} 
        alt={product.name} 
        className="w-full h-full object-cover cursor-pointer" 
        onClick={onImageClick}
        />
      </div>

      {/* 상품명 + 가격 */}
      <div className="font-medium line-clamp-2">{product.name}</div>
      <div className="text-sm text-gray-600 mt-1">
        {product.unitPrice != null ? product.unitPrice.toLocaleString() + "원" : "-"}
      </div>

      {/* ✅ 장바구니 + 수량 조절 */}
      <div className="mt-auto flex items-center justify-between gap-2">
      <button className="mt-auto px-3 py-2 rounded-xl border shadow-sm hover:bg-gray-50" 
      onClick={handleActionClick}>
        장바구니
      </button>

       {/* 수량 조절 버튼 */}
        <div className="flex items-center border rounded-lg px-2">
          <button
            onClick={decrease}
            className="px-2 text-lg font-bold text-gray-600 hover:text-black"
          >
            -
          </button>
          <span className="w-6 text-center">{qty}</span>
          <button
            onClick={increase}
            className="px-2 text-lg font-bold text-gray-600 hover:text-black"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
