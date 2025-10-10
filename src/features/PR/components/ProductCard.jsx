import React from "react";

const ProductCard = ({ product, onAdd }) => {
     return (
    <div className="border p-2 rounded-xl">
      <img
        src={product.imageUrl || "/no-image.png"}
        alt={product.name}
        className="h-40 w-full object-cover"
      />
      <p>{product.name}</p>
      <p>{product.price}원</p>
      <button
        className="bg-blue-500 text-white px-2 py-1 rounded"
        onClick={() => onAdd(product)}
      >
        발주추가
      </button>
    </div>
  );
};

export default ProductCard;