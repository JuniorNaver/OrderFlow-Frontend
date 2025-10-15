// ProductDetailPage.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { MOCK_PRODUCTS, placeholder } from "../mock/Categories.mock";



export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const prod = MOCK_PRODUCTS.find(p => p.productCode === id);
    setProduct(prod);
  }, [id]);

  if (!product) return <div>상품을 찾을 수 없습니다.</div>;

  const totalPrice = (product.unitPrice * qty).toLocaleString();

  return (
    <div className="flex gap-10 p-10">
      {/* 이미지 */}
      <div>
        <img src={placeholder(product.productCode)} alt={product.name} className="w-96" />
      </div>

      {/* 상품 정보 */}
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <div className="text-lg">{product.category} / {product.subCategory}</div>
        <div className="text-xl">{product.unitPrice.toLocaleString()}원</div>

        {/* 수량 조절 */}
        <div className="flex items-center gap-2">
          <button onClick={() => setQty(q => Math.max(1, q - 1))}>-</button>
          <span>{qty}</span>
          <button onClick={() => setQty(q => q + 1)}>+</button>
        </div>

        <div className="text-lg">총 금액: {totalPrice}원</div>

        {/* 버튼 */}
        <div className="flex gap-4">
          <button className="bg-black text-white px-4 py-2">BUY NOW</button>
          <button className="border px-4 py-2">CART</button>
        </div>
      </div>
    </div>
  );
}
