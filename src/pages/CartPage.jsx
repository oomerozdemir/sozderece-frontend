import { useState, useMemo } from "react";
import useCart from "../hooks/useCart";
import "../cssFiles/cart.css";
import { CgTrash } from "react-icons/cg";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import TopBar from "../components/TopBar";



const CartPage = () => {
  const { cart, loading, error, increaseQuantity } = useCart();
  const navigate = useNavigate();
  const [isAgreed, setIsAgreed] = useState(false);

  // Backend sepet yapısı: { items: [{ slug, title, unitPrice (int kuruş), quantity }]}
  const items = useMemo(() => cart?.items ?? [], [cart]);

  const formatTL = (krs) => (krs / 100).toFixed(2);

  const total = useMemo(() => {
    return items.reduce((sum, it) => sum + (it.unitPrice * (it.quantity || 1)), 0);
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
    // Ödeme sayfasında /api/order/prepare çağrısında useServerCart: true gönderiyoruz
    navigate("/payment");
  };

  const handleContinueShopping = () => {
    window.location.href = "/#paketler";
  };

  // Şimdilik kaldır/azalt backend endpoint'leri yok; butonları pasif gösteriyoruz
  const handleRemoveDisabled = () => {
    alert("Sepetten kaldırma yakında aktif olacak.");
  };
  const handleDecreaseDisabled = () => {
    alert("Adet azaltma yakında aktif olacak.");
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
        ) : (!loading && !error) && (
          <>
            <ul className="cart-list">
              {items.map((item, i) => {
                const unit = formatTL(item.unitPrice);
                const totalItemPrice = formatTL(item.unitPrice * (item.quantity || 1));
                return (
                  <li key={`${item.slug}-${i}`} className="cart-item">
                    <div className="cart-item-details">
                      <div className="cart-item-image">
                        <img src="/images/hero-logo.webp" alt={item.title} />
                      </div>
                      <div className="cart-item-text">
                        <strong>{item.title}</strong>
                        {/* İstersen buraya slug'a göre kısa açıklama ekleyebilirsin */}
                      </div>
                    </div>

                    <div className="cart-item-quantity">
                      <button onClick={handleDecreaseDisabled} disabled>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => increaseQuantity(item.slug)}>+</button>
                    </div>

                    <div className="cart-item-pricing">
                      <div className="unit-price">₺{unit} / adet</div>
                      <div className="total-price"><strong>₺{totalItemPrice}</strong></div>
                    </div>

                    <button className="trashCan" onClick={handleRemoveDisabled} disabled>
                      <CgTrash size={22} />
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="cart-summary">
              <hr />
              <p className="cart-total"><strong>Toplam:</strong> ₺{formatTL(total)}</p>
              <p className="cart-note">İndirim kuponları ödeme kısmında uygulanır.</p>

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
        )}
      </div>
    </div>
  );
};

export default CartPage;
