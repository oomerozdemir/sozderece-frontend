import { useState, useEffect } from "react";

const useCart = () => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) setCart(JSON.parse(storedCart));
  }, []);

  const addToCart = (item) => {
    const updated = [{ ...item, quantity: 1 }];
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const removeFromCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };


  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  const increaseQuantity = () => {
    const updated = [...cart];
    if (updated.length > 0) {
      updated[0].quantity += 1;
      setCart(updated);
      localStorage.setItem("cart", JSON.stringify(updated));
    }
  };

  const decreaseQuantity = () => {
    const updated = [...cart];
    if (updated.length > 0 && updated[0].quantity > 1) {
      updated[0].quantity -= 1;
      setCart(updated);
      localStorage.setItem("cart", JSON.stringify(updated));
    }
  };

  return {
    cart,
    addToCart,
    removeFromCart,
    clearCart, 
    increaseQuantity,
    decreaseQuantity,
  };
};

export default useCart;
