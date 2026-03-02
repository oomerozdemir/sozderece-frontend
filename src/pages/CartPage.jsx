import { useState, useMemo } from "react";
import useCart from "../hooks/useCart";
import { CgTrash } from "react-icons/cg";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import TopBar from "../components/TopBar";
import StepIndicator from "../components/StepIndicator";

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

      <div className="max-w-[900px] mx-10 my-10 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] px-[50px] max-[768px]:mx-2.5 max-[768px]:my-5 max-[768px]:px-5 max-[768px]:rounded-lg">
        <StepIndicator currentStep={1} />
        <h2 className="text-[3rem] text-center mb-5 py-5 border-b border-[#e65e04] text-[#e45e04] font-normal max-[768px]:text-[2rem] max-[768px]:mb-4">Sepet</h2>

        {loading && <div>Sepet yükleniyor…</div>}
        {error && !loading && <div>{error}</div>}

        {!loading && !error && items.length === 0 ? (
          <div className="text-center py-10">
            <p>Sepetiniz boş.</p>
            <button
              className="mt-3 bg-[#e45e04] text-white py-2.5 px-[18px] text-base border-0 rounded-lg cursor-pointer transition-colors hover:bg-[#c94d03] max-[768px]:w-full"
              onClick={() => navigate("/paket-detay")}
            >
              Paketlere Göz At
            </button>
          </div>
        ) : !loading && !error ? (
          <>
            <ul className="list-none p-5 m-0">
              {items.map((item, i) => {
                const slug = getSlug(item);
                const title = getTitle(item);
                const unitTL = getUnitPriceTL(item);
                const qty = 1; // Sabit 1 adet gösteriyoruz
                const totalItemTL = (unitTL * qty).toFixed(2);

                return (
                  <li key={`${slug}-${i}`} className="flex justify-between items-start py-5 border-b border-[#e74d05] text-[1.3rem] mb-4 max-[768px]:flex-col max-[768px]:items-start max-[768px]:text-base max-[768px]:py-4">
                    <div className="flex gap-4 flex-1 max-[768px]:flex-col max-[768px]:gap-3">
                      <div>
                        <img src="/images/hero-logo.webp" alt={title} className="w-20 h-20 rounded-lg object-cover max-[768px]:w-[60px] max-[768px]:h-[60px]" />
                      </div>
                      <div>
                        <strong>{title}</strong>
                      </div>
                    </div>

                    {/* Miktar Kısmı Değiştirildi: Butonlar kaldırıldı, sabit metin eklendi */}
                    <div className="flex items-center gap-2 mb-1.5 justify-center cursor-default">
                      <span className="text-[0.9rem] text-[#555]">1 Adet</span>
                    </div>

                    <div className="flex flex-col items-end gap-1 min-w-[100px] max-[768px]:items-start max-[768px]:text-left">
                      <div className="text-[0.85rem] text-[#666]">₺{unitTL.toFixed(2)}</div>
                      <div className="text-[1.2rem] font-normal text-black">
                        <strong>₺{totalItemTL}</strong>
                      </div>
                    </div>

                    <button className="border-none bg-transparent cursor-pointer text-[#e53e3e]" onClick={() => onRemove(slug)}>
                      <CgTrash size={22} />
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="mt-[30px] text-center p-5 max-[768px]:p-4">
              <hr />
              <p className="text-[1.5rem] font-bold">
                <strong>Toplam:</strong> ₺{total.toFixed(2)}
              </p>
              {hasTutoring && (
                <p className="text-[0.85rem] text-[#888] mt-2">
                  Özel ders seçimleri için <strong>KDV</strong> ödeme adımında hesaplanır ve eklenir.
                </p>
              )}

              <div className="mt-4 text-[0.9rem] flex items-center gap-2 justify-center">
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

              <button onClick={handleCheckout} className="mt-5 bg-black text-white py-3 px-6 rounded-md border-0 text-base font-bold cursor-pointer max-[768px]:w-full max-[768px]:text-[0.95rem] max-[768px]:py-2.5">
                ÖDEMEYE GEÇ!
              </button>

              <p
                className="mt-3 text-[0.9rem] text-[rgb(11,11,12)] cursor-pointer"
                onClick={handleContinueShopping}
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
