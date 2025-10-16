import React from "react";
import { ShoppingCart } from "lucide-react";

export default function Empty({handleLoad}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-gray-600">
      <ShoppingCart size={80} className="text-gray-400 mb-6" />
      <h2 className="text-2xl font-semibold mb-2">장바구니가 비어 있습니다</h2>
      <p className="text-gray-500 mb-6">원하는 상품을 추가해보세요.</p>
      
      <button
        onClick={handleLoad}
        className="bg-gray-300 hover:bg-gray-300 text-white font-semibold px-4 py-2 rounded border border-gray-300"
        >
        불러오기
       </button>
      
      
      {/* <button
        onClick={() => window.location.href = "/products"}
        className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg shadow"
      >
        상품 보러가기
      </button> */}
    </div>
  );
}
