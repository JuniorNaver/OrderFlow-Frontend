import React, { useState, useEffect } from "react";
import { getProducts } from "../api/productApi";
import { addToCart, getCart } from "../api/cartApi";
import ProductCard from "../components/ProductCard";
import CartSidebar from "../components/CartSidebar";
import { data } from "react-router-dom";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    getProducts().then(setProducts);
    console.log("Products:", data);
    getCart().then(setCart);
  }, []);

  const handleAddToCart = async (product) => {
    await addToCart(product.id, 1);
    const updatedCart = await getCart();
    setCart(updatedCart);
  };

  return (
    <div className="flex p-6 gap-6">
      <div className="grid grid-cols-4 gap-4 flex-1">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} onAdd={handleAddToCart} />
        ))}
      </div>
      <CartSidebar cart={cart} />
    </div>
  );
};


export default ProductList;