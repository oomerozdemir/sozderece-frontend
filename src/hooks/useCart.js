import { useState, useEffect } from "react";

const useCart = () => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) setCart(JSON.parse(storedCart));
  }, []);

  // ✅ Sepette yalnızca 1 paket tutulsun
  const addToCart = (item) => {
    const updated = [{ ...item, quantity: 1 }]; // sadece bir paket
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };



  // Paket zaten tek olduğu için her zaman index 0 kullanılacak
  const removeFromCart = () => {
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
    increaseQuantity,
    decreaseQuantity,
  };
};

export default useCart;
