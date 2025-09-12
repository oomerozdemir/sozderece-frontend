// src/hooks/useCart.js
import { useEffect, useState, useCallback } from "react";
import axios from "../utils/axios";

const toUiItems = (serverCart) => {
  const items = serverCart?.items || [];
 return items.map(i => ({
   slug: i.slug,
   name: i.title,
   price: `₺${(Number(i.unitPrice || 0) / 100).toFixed(2)}`,
   quantity: i.quantity || 1,
   description: i.description || "",
   itemType: i.itemType || i?.meta?.itemType,
   source:   i.source   || i?.meta?.source,
   meta:     i.meta ?? null,
 }))
};


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
      // Backend tek tip: { success, cart:{ items:[] } } ya da { items:[] }
      const serverCart = res.data?.cart?.items ? res.data.cart : (res.data?.items ? res.data : { items: [] });
      setCart(toUiItems(serverCart));
    } catch (e) {
      setError(e?.response?.data?.message || "Sepet getirilemedi");
      setCart([]);
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


  const increaseQuantity = useCallback(async (slug) => {
    await axios.patch(
      "/api/cart/items",
      { slug, op: "increase" },
      { headers: authHeaders() }
    );
    await refresh();
  }, [refresh]);

const decreaseQuantity = useCallback(async (slug) => {
    await axios.patch(
      "/api/cart/items",
      { slug, op: "decrease" },
      { headers: authHeaders() }
    );
    await refresh();
  }, [refresh]);

    const removeFromCart = useCallback(async (slug) => {
    await axios.delete(`/api/cart/items/${encodeURIComponent(slug)}`, {
      headers: authHeaders()
    });
    await refresh();
  }, [refresh]);

  const clearCart = useCallback(async () => {
    // İsteğe göre backend toplu temizleme route’u yazılabilir;
    // şimdilik UI’dan temizle (order success’te zaten backend completed:true işaretliyor)
    setCart([]);
  }, []);

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
