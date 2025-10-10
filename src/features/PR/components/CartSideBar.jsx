import React from "react";

const CartSidebar = ({ cart }) => {
  return (
    <div className="w-1/4 border p-4 rounded-xl">
      <h2 className="font-bold mb-2">장바구니</h2>
      {cart.length === 0 ? (
        <p>장바구니가 비어 있습니다.</p>
      ) : (
        <ul>
          {cart.map((item) => (
            <li key={item.id}>
              {item.name} x {item.quantity}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CartSidebar;