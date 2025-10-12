import { useNavigate, useParams } from "react-router-dom";
import { placeholder } from "../mock/Categories";

/**
 * @param {{ product:{productCode:string, name:string, imageUrl?:string, unitPrice?:number}, onClick?:(product)=>void }} props
 */

export default function ProductCard({ product, onClick }) {
  const nav = useNavigate();
  const { storeId = "S001" } = useParams();
  const img = product.imageUrl || placeholder(product.productCode, 300);

  const goToPO = () => {
    nav("/po", {
      state: {
        from: "pr",
        storeId,
        items: [{ productCode: product.productCode, qty: 1 }], // 여기서 수량 1 기본
      },
    });
  };

  return (
    <div className="border rounded-2xl p-3 flex flex-col">
      <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden mb-2">
        <img src={img} alt={product.name} className="w-full h-full object-cover" />
      </div>
      <div className="font-medium line-clamp-2">{product.name}</div>
      <div className="text-sm text-gray-600 mt-1">
        {product.unitPrice != null ? product.unitPrice.toLocaleString() + "원" : "-"}
      </div>
      <button className="mt-auto px-3 py-2 rounded-xl border shadow-sm" onClick={() => (onClick ? onClick(product) : goToPO())}>
        발주로 이동
      </button>
    </div>
  );
}
