// src/hooks/useCart.js
import { useEffect, useState, useCallback } from "react";
import axios from "../utils/axios";

export default function useCart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get("/api/cart", { headers: authHeaders() });
      // Backend bazen direkt cart döner ( { items: [...] } )
      // bazen { cart: {...} } olabilir; ikisini de karşılayalım
      setCart(
        res.data && res.data.items
          ? res.data
          : (res.data?.cart || { items: [] })
      );
    } catch (e) {
      setError(e?.response?.data?.message || "Sepet getirilemedi");
      setCart({ items: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = useCallback(
    async ({ slug, title, unitPrice, quantity = 1, email, name }) => {
      await axios.post(
        "/api/cart/items",
        { slug, title, unitPrice, quantity, ...(email ? { email } : {}), ...(name ? { name } : {}) },
        { headers: authHeaders() }
      );
      await refresh();
    },
    [refresh]
  );

  const increaseQuantity = useCallback(
    async (slug) => {
      const item = cart?.items?.find((i) => i.slug === slug);
      if (!item) return;
      await addToCart({
        slug,
        title: item.title,
        unitPrice: item.unitPrice,
        quantity: 1,
      });
    },
    [cart, addToCart]
  );

  const decreaseQuantity = async () => {
    console.warn("decreaseQuantity: backend endpoint eklenmeli");
  };
  const removeFromCart = async () => {
    console.warn("removeFromCart: backend endpoint eklenmeli");
  };
  const clearCart = async () => {
    console.warn("clearCart: backend endpoint eklenmeli");
  };

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    cart,
    loading,
    error,
    refresh,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  };
}
