import { useState, useEffect } from "react";
import axios from "../utils/axios";
import Button from "../components/ui/Button";
// Paket listesini almak için import ediyoruz
import { PACKAGES } from "../hooks/packages";

const inputCls =
  "w-full px-3 py-2.5 rounded-xl border border-[#e5e7eb] outline-none text-sm focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10 transition-all bg-white";

const AdminCouponPage = () => {
  // Temel Bilgiler
  const [code, setCode] = useState("");
  const [maxUsage, setMaxUsage] = useState("");

  // Kupon Ayarları
  const [type, setType] = useState("RATE");
  const [discountRate, setDiscountRate] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [isFirstOrder, setIsFirstOrder] = useState(false);

  const [selectedPackages, setSelectedPackages] = useState([]);

  const [message, setMessage] = useState("");
  const [coupons, setCoupons] = useState([]);

  const packageList = Object.values(PACKAGES);

  const fetchCoupons = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/coupon/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoupons(res.data.coupons);
    } catch (err) {
      console.error("Kuponlar alınamadı:", err);
    }
  };

  const handlePackageChange = (slug) => {
    if (selectedPackages.includes(slug)) {
      setSelectedPackages(selectedPackages.filter((p) => p !== slug));
    } else {
      setSelectedPackages([...selectedPackages, slug]);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      const payload = {
        code,
        maxUsage,
        type,
        isFirstOrder,
        discountRate: type === "RATE" ? parseInt(discountRate) : null,
        discountAmount: type === "FIXED" ? parseFloat(discountAmount) * 100 : null,
        validPackages: selectedPackages,
      };

      await axios.post("/api/coupon/create", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage("Kupon başarıyla oluşturuldu.");

      setCode("");
      setDiscountRate("");
      setDiscountAmount("");
      setMaxUsage("");
      setIsFirstOrder(false);
      setType("RATE");
      setSelectedPackages([]);

      fetchCoupons();
    } catch (err) {
      setMessage(err.response?.data?.error || "Bir hata oluştu.");
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm("Bu kuponu silmek istediğine emin misin?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/coupon/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCoupons();
    } catch (err) {
      alert("Kupon silinemedi.");
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const isError = message && !message.includes("başarıyla");

  return (
    <div className="p-1 max-w-3xl mx-auto">
      <h2 className="text-lg font-black text-[#0f172a] mb-4">Kupon Yönetimi</h2>

      <form onSubmit={handleCreateCoupon} className="space-y-4 mb-8 bg-white p-5 rounded-2xl border border-[#f1f5f9] shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
        <div>
          <label className="block text-xs font-bold text-[#475569] mb-1.5">Kupon Kodu</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Örn: OZELDERS100"
            className={`${inputCls} uppercase`}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3 max-[480px]:grid-cols-1">
          <div>
            <label className="block text-xs font-bold text-[#475569] mb-1.5">İndirim Tipi</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
              <option value="RATE">Yüzde İndirim (%)</option>
              <option value="FIXED">Sabit Tutar (TL)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#475569] mb-1.5">
              {type === "RATE" ? "İndirim Oranı (%)" : "İndirim Tutarı (TL)"}
            </label>
            {type === "RATE" ? (
              <input
                type="number"
                value={discountRate}
                onChange={(e) => setDiscountRate(e.target.value)}
                placeholder="Örn: 10"
                className={inputCls}
                required={type === "RATE"}
              />
            ) : (
              <input
                type="number"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
                placeholder="Örn: 200"
                className={inputCls}
                required={type === "FIXED"}
              />
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#475569] mb-1.5">Maksimum Kullanım</label>
          <input
            type="number"
            value={maxUsage}
            onChange={(e) => setMaxUsage(e.target.value)}
            placeholder="Örn: 100"
            className={inputCls}
            required
          />
        </div>

        <div className="border border-[#e5e7eb] p-3.5 rounded-xl bg-[#f8fafc]">
          <label className="block text-xs font-bold text-[#0f172a] mb-1.5">Hangi Paketlerde Geçerli Olsun?</label>
          <p className="text-[11px] text-[#94a3b8] mb-2">* Hiçbirini seçmezseniz tüm paketlerde geçerli olur.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {packageList.map((pkg) => (
              <label key={pkg.slug} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  value={pkg.slug}
                  checked={selectedPackages.includes(pkg.slug)}
                  onChange={() => handlePackageChange(pkg.slug)}
                  className="w-4 h-4 accent-brand-navy rounded"
                />
                <span className="text-sm text-[#475569]">{pkg.title}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-3 bg-[#eff6ff] rounded-xl border border-[#bfdbfe]">
          <input
            type="checkbox"
            id="isFirstOrder"
            checked={isFirstOrder}
            onChange={(e) => setIsFirstOrder(e.target.checked)}
            className="w-4 h-4 accent-brand-navy rounded"
          />
          <label htmlFor="isFirstOrder" className="text-sm text-[#1d4ed8] cursor-pointer select-none">
            <strong>Sadece İlk Siparişte Geçerli</strong> (Yeni Müşteri)
          </label>
        </div>

        <Button type="submit" variant="secondary" fullWidth>
          Kuponu Oluştur
        </Button>

        {message && (
          <div className={`p-3 rounded-xl text-center text-sm font-semibold ${isError ? "bg-[#fef2f2] text-[#991b1b]" : "bg-[#ecfdf5] text-[#065f46]"}`}>
            {message}
          </div>
        )}
      </form>

      {/* Liste */}
      <div className="space-y-2.5">
        {coupons.map((coupon) => (
          <div key={coupon.id} className="border border-[#f1f5f9] p-3.5 rounded-xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] flex justify-between items-center flex-wrap gap-2">
            <div>
              <strong className="text-base text-[#0f172a]">{coupon.code}</strong>
              <div className="text-xs text-[#64748b] mt-1 flex items-center gap-3 flex-wrap">
                {coupon.validPackages && coupon.validPackages.length > 0 ? (
                  <span className="font-bold text-[#9a3412]">Sadece {coupon.validPackages.length} pakette geçerli</span>
                ) : (
                  <span className="font-bold text-[#065f46]">Tüm paketlerde geçerli</span>
                )}
                <span>
                  {coupon.type === "FIXED" ? `₺${(coupon.discountAmount / 100).toFixed(2)}` : `%${coupon.discountRate}`} indirim
                  {coupon.isFirstOrder ? " · Sadece ilk sipariş" : ""}
                </span>
                <span>Kullanım: {coupon.usedCount ?? 0}/{coupon.usageLimit}</span>
              </div>
            </div>
            <Button onClick={() => handleDeleteCoupon(coupon.id)} variant="danger" size="sm">Sil</Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCouponPage;
