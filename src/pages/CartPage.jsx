import { useState, useMemo } from "react";
import useCart from "../hooks/useCart";
import "../cssFiles/cart.css";
import { CgTrash } from "react-icons/cg";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import TopBar from "../components/TopBar";

const CartPage = () => {
  const {
    cart,
    loading,
    error,
    // increaseQuantity, // KALDIRILDI: Miktar artırma fonksiyonuna gerek yok
    // decreaseQuantity, // KALDIRILDI: Miktar azaltma fonksiyonuna gerek yok
    removeFromCart,
  } = useCart();

  const navigate = useNavigate();
  const [isAgreed, setIsAgreed] = useState(false);

  const items = useMemo(() => {
    if (!cart) return [];
    if (Array.isArray(cart)) return cart;
    if (Array.isArray(cart.items)) return cart.items;
    return [];
  }, [cart]);

  const getUnitPriceTL = (it) => {
    if (typeof it.unitPrice === "number") {
      return it.unitPrice / 100;
    }
    if (typeof it.price === "string") {
      const n = parseFloat(it.price.replace("₺", "").replace(/[^\d.]/g, ""));
      return isNaN(n) ? 0 : n;
    }
    return 0;
  };

  const getTitle = (it) => it.title || it.name || "Ürün";

  const getSlug = (it) => it.slug || it.id || getTitle(it);

  // EKLE —— özel dersi tespit et
  const isTutoringItem = (it) => {
    if (it?.itemType === "tutoring") return true;
    const slug = (it?.slug || "").toLowerCase();
    const name = (it?.name || it?.title || "").toLowerCase();
    return (
      /^tek-ders$/.test(slug) ||
      /^paket-\d+$/.test(slug) ||
      /ozel-ders/.test(slug) ||
      /özel ders|tutor|ders/.test(name)
    );
  };

  const hasTutoring = items.some(isTutoringItem);

  const total = useMemo(() => {
    return items.reduce((sum, it) => {
      const unit = getUnitPriceTL(it);
      const qty = 1; // Miktar her zaman 1 olarak hesaplansın (UI tarafında)
      return sum + unit * qty;
    }, 0);
  }, [items]);

  const handleCheckout = () => {
    if (!isAgreed) {
      alert("Lütfen sözleşmeyi onaylayın.");
      return;
    }
    if (items.length === 0) {
      alert("Lütfen önce bir paket seçin.");
      return;
    }
    navigate("/payment");
  };

  const handleContinueShopping = () => {
    window.location.href = "/#paketler";
  };

  // const canDecrease = typeof decreaseQuantity === "function"; // KALDIRILDI
  const canRemove = typeof removeFromCart === "function";

  // onDecrease fonksiyonu KALDIRILDI

  const onRemove = (slug) => {
    if (canRemove) return removeFromCart(slug);
    alert("Sepetten kaldırma yakında aktif olacak.");
  };

  return (
    <div>
      <TopBar />
      <Navbar />

      <div className="cart-page">
        <h2 className="cart-title">Sepet</h2>

        {loading && <div className="empty-message">Sepet yükleniyor…</div>}
        {error && !loading && <div className="empty-message">{error}</div>}

        {!loading && !error && items.length === 0 ? (
          <div className="empty-message-container">
            <p className="empty-message">Sepetiniz boş.</p>
            <button
              className="browse-packages-button"
              onClick={() => navigate("/paket-detay")}
            >
              Paketlere Göz At
            </button>
          </div>
        ) : !loading && !error ? (
          <>
            <ul className="cart-list">
              {items.map((item, i) => {
                const slug = getSlug(item);
                const title = getTitle(item);
                const unitTL = getUnitPriceTL(item);
                const qty = 1; // Sabit 1 adet gösteriyoruz
                const totalItemTL = (unitTL * qty).toFixed(2);

                return (
                  <li key={`${slug}-${i}`} className="cart-item">
                    <div className="cart-item-details">
                      <div className="cart-item-image">
                        <img src="/images/hero-logo.webp" alt={title} />
                      </div>
                      <div className="cart-item-text">
                        <strong>{title}</strong>
                      </div>
                    </div>

                    {/* Miktar Kısmı Değiştirildi: Butonlar kaldırıldı, sabit metin eklendi */}
                    <div className="cart-item-quantity" style={{ justifyContent: 'center', cursor: 'default' }}>
                      <span style={{ fontSize: '0.9rem', color: '#555' }}>1 Adet</span>
                    </div>

                    <div className="cart-item-pricing">
                      <div className="unit-price">₺{unitTL.toFixed(2)}</div>
                      <div className="total-price">
                        <strong>₺{totalItemTL}</strong>
                      </div>
                    </div>

                    <button className="trashCan" onClick={() => onRemove(slug)}>
                      <CgTrash size={22} />
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="cart-summary">
              <hr />
              <p className="cart-total">
                <strong>Toplam:</strong> ₺{total.toFixed(2)}
              </p>
              {hasTutoring && (
                <p className="cart-note">
                  Özel ders seçimleri için <strong>KDV</strong> ödeme adımında hesaplanır ve eklenir.
                </p>
              )}

              <div className="cart-check">
                <input
                  type="checkbox"
                  id="agreement"
                  checked={isAgreed}
                  onChange={() => setIsAgreed(!isAgreed)}
                />
                <label htmlFor="agreement">
                  Okudum ve onaylıyorum:{" "}
                  <a href="/mesafeli-hizmet-sozlesmesi">Mesafeli Satış Sözleşmesi</a>
                </label>
              </div>

              <button onClick={handleCheckout} className="checkout-button">
                ÖDEMEYE GEÇ!
              </button>

              <p
                className="continue-link"
                onClick={handleContinueShopping}
                style={{ cursor: "pointer" }}
              >
                Alışverişe devam et.
              </p>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default CartPage;