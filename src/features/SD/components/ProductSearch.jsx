import { useState } from "react";
import ProductSearchModal from "./ProductSearchModal";

function ProductSearch() {
  const [showModal, setShowModal] = useState(false);

  const handleSelectProduct = () => {
    setShowModal(false); // 모달 닫기만
  };

  return (
    <div>
      <button
        onClick={() => setShowModal(true)}
        className="bg-yellow-400 text-white w-40 h-20 rounded-2xl 
                   hover:bg-yellow-500 text-xl font-bold shadow-lg 
                   transition-transform active:scale-95"
      >
        상품 검색
      </button>

      {showModal && (
        <ProductSearchModal
          onClose={() => setShowModal(false)}
          onSelect={handleSelectProduct}
        />
      )}
    </div>
  );
}

export default ProductSearch;