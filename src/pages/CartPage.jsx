import { useState } from "react";
import useCart from "../hooks/useCart";
import "../cssFiles/cart.css";
import { CgTrash } from "react-icons/cg";
import { TbRefresh } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import TopBar from "../components/TopBar";

const CartPage = () => {
  const {
    cart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
  } = useCart();
  const navigate = useNavigate();
  const [isAgreed, setIsAgreed] = useState(false);

  const total = cart.reduce((sum, item) => {
    const priceNumber = parseFloat(item.price.replace("₺", "").replace(/[^\d.]/g, ""));
    return sum + priceNumber * (item.quantity || 1);
  }, 0);

  const handleCheckout = () => {
    if (!isAgreed) {
      alert("Lütfen sözleşmeyi onaylayın.");
      return;
    }

    if (cart.length === 0) {
      alert("Lütfen önce bir paket seçin.");
      return;
    }

    const hasOnlySingleLessonPackage =
      cart.length === 1 && cart[0].name.toLowerCase().includes("tek ders");


    navigate("/payment");
  };

  const handleContinueShopping = () => {
    window.location.href = "/#paketler";
  };

  const handleRemoveFromCart = (index) => {
    removeFromCart(index);

  };

  return (
    <div>
      <TopBar />
      <Navbar />
      <div className="cart-page">
        <h2 className="cart-title">Sepet</h2>

        {cart.length === 0  ? (
  <div className="empty-message-container">
    <p className="empty-message">Sepetiniz boş.</p>
    <button
      className="browse-packages-button"
      onClick={() => navigate("/package-detail")}
    >
      Paketlere Göz At
    </button>
  </div>
) : (

          <>
            {cart.length > 0 && (
              <ul className="cart-list">
                {cart.map((item, i) => {
                  const unitPrice = parseFloat(item.price.replace("₺", "").replace(/[^\d.]/g, ""));
                  const totalItemPrice = (unitPrice * item.quantity).toFixed(2);

                  return (
                    <li key={i} className="cart-item">
                      <div className="cart-item-details">
                        <div className="cart-item-image">
                          <img src="/images/hero-logo.png" alt={item.name} />
                        </div>
                        <div className="cart-item-text">
                          <strong>{item.name}</strong>
                          <p>{item.description}</p>
                        </div>
                      </div>

                      <div className="cart-item-quantity">
                        <button onClick={() => decreaseQuantity(i)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => increaseQuantity(i)}>+</button>
                      </div>

                      <div className="cart-item-pricing">
                        <div className="unit-price">₺{unitPrice.toFixed(2)} / adet</div>
                        <div className="total-price"><strong>₺{totalItemPrice}</strong></div>
                      </div>

                      <button className="trashCan" onClick={() => handleRemoveFromCart(i)}><CgTrash size={22} /></button>
                    </li>
                  );
                })}
              </ul>
            )}

            
            <div className="cart-summary">
              <hr />
              <p className="cart-total"><strong>Toplam:</strong> ₺{total.toFixed(2)}</p>
              <p className="cart-note">Kargo ve indirim kuponları ödeme kısmında hesaplanır.</p>
              <div className="cart-check">
                <input
                  type="checkbox"
                  id="agreement"
                  checked={isAgreed}
                  onChange={() => setIsAgreed(!isAgreed)}
                />
                <label htmlFor="agreement">
                  Okudum ve onaylıyorum: <a href="#">Mesafeli Satış Sözleşmesi</a>
                </label>
              </div>

              <button onClick={handleCheckout} className="checkout-button">
                ÖDEMEYE GEÇ!
              </button>

              <p className="continue-link" onClick={handleContinueShopping} style={{ cursor: "pointer" }}>
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
