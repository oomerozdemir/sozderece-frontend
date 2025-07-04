import { useState, useEffect } from "react";

const useCart = () => {
  const [cart, setCart] = useState([]);
  const [coach, setCoach] = useState(null);

  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    const storedCoach = localStorage.getItem("coach");
    if (storedCart) setCart(JSON.parse(storedCart));
    if (storedCoach) setCoach(JSON.parse(storedCoach));
  }, []);

  // ✅ Sepette yalnızca 1 paket tutulsun
  const addToCart = (item) => {
    const updated = [{ ...item, quantity: 1 }]; // sadece bir paket
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  // ✅ Sepete yalnızca 1 koç atanabilir
  const setCoachToCart = (coachData) => {
    setCoach(coachData);
    localStorage.setItem("coach", JSON.stringify(coachData));
  };

  const clearCoach = () => {
    setCoach(null);
    localStorage.removeItem("coach");
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
    clearCoach(); // koç da temizlenir
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
    coach,
    addToCart,
    setCoachToCart,
    clearCoach,
    clearCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
  };
};

export default useCart;
