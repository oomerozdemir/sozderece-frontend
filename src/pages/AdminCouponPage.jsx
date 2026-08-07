import { useState, useEffect } from "react";
import axios from "../utils/axios";
// Paket listesini almak için import ediyoruz
import { PACKAGES } from "../hooks/packages"; 

const AdminCouponPage = () => {
  // Temel Bilgiler
  const [code, setCode] = useState("");
  const [maxUsage, setMaxUsage] = useState("");
  
  // Kupon Ayarları
  const [type, setType] = useState("RATE");
  const [discountRate, setDiscountRate] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [isFirstOrder, setIsFirstOrder] = useState(false);
  
  // YENİ: Seçilen Paketler State'i
  const [selectedPackages, setSelectedPackages] = useState([]); 

  const [message, setMessage] = useState("");
  const [coupons, setCoupons] = useState([]);

  // Paket Listesini Array formatına çeviriyoruz (Checkbox için)
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

  // Checkbox değiştiğinde çalışır
  const handlePackageChange = (slug) => {
    if (selectedPackages.includes(slug)) {
      // Zaten varsa çıkar
      setSelectedPackages(selectedPackages.filter(p => p !== slug));
    } else {
      // Yoksa ekle
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
        
        // YENİ: Seçilen paketleri gönderiyoruz
        validPackages: selectedPackages 
      };

      await axios.post("/api/coupon/create", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage("Kupon başarıyla oluşturuldu.");
      
      // Formu temizle
      setCode("");
      setDiscountRate("");
      setDiscountAmount("");
      setMaxUsage("");
      setIsFirstOrder(false);
      setType("RATE");
      setSelectedPackages([]); // Seçimi sıfırla
      
      fetchCoupons();
    } catch (err) {
      setMessage(err.response?.data?.error || "Bir hata oluştu.");
    }
  };

  const handleDeleteCoupon = async (id) => {
    if(!window.confirm("Bu kuponu silmek istediğine emin misin?")) return;
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

  return (
    <div className="p-4 max-w-3xl mx-auto bg-white shadow rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">🎟️ Kupon Yönetimi</h2>
      
      <form onSubmit={handleCreateCoupon} className="space-y-5 mb-8">
        
        {/* ... (Kod, Tipe, Tutar inputları aynı kalacak) ... */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kupon Kodu</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Örn: OZELDERS100"
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none uppercase"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">İndirim Tipi</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border p-2 rounded bg-white"
            >
              <option value="RATE">Yüzde İndirim (%)</option>
              <option value="FIXED">Sabit Tutar (TL)</option>
            </select>
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">
               {type === "RATE" ? "İndirim Oranı (%)" : "İndirim Tutarı (TL)"}
             </label>
             {type === "RATE" ? (
               <input
                 type="number"
                 value={discountRate}
                 onChange={(e) => setDiscountRate(e.target.value)}
                 placeholder="Örn: 10"
                 className="w-full border p-2 rounded"
                 required={type === "RATE"}
               />
             ) : (
               <input
                 type="number"
                 value={discountAmount}
                 onChange={(e) => setDiscountAmount(e.target.value)}
                 placeholder="Örn: 200"
                 className="w-full border p-2 rounded"
                 required={type === "FIXED"}
               />
             )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Maksimum Kullanım</label>
          <input
            type="number"
            value={maxUsage}
            onChange={(e) => setMaxUsage(e.target.value)}
            placeholder="Örn: 100"
            className="w-full border p-2 rounded"
            required
          />
        </div>

        {/* --- YENİ: PAKET SEÇİMİ (Checkboxlar) --- */}
        <div className="border p-3 rounded bg-gray-50">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Hangi Paketlerde Geçerli Olsun?
          </label>
          <p className="text-xs text-gray-500 mb-2">* Hiçbirini seçmezseniz tüm paketlerde geçerli olur.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {packageList.map((pkg) => (
              <label key={pkg.slug} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  value={pkg.slug}
                  checked={selectedPackages.includes(pkg.slug)}
                  onChange={() => handlePackageChange(pkg.slug)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{pkg.title}</span>
              </label>
            ))}
          </div>
        </div>

        {/* İlk Sipariş Checkbox */}
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded border border-blue-100">
          <input
            type="checkbox"
            id="isFirstOrder"
            checked={isFirstOrder}
            onChange={(e) => setIsFirstOrder(e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded"
          />
          <label htmlFor="isFirstOrder" className="text-gray-700 cursor-pointer select-none">
            <strong>Sadece İlk Siparişte Geçerli</strong> (Yeni Müşteri)
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-bold p-3 rounded hover:bg-blue-700 transition"
        >
          Kuponu Oluştur
        </button>

        {message && (
          <div className={`p-3 rounded text-center ${message.includes("") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {message}
          </div>
        )}
      </form>

      {/* Liste */}
      <div className="space-y-3">
        {coupons.map((coupon) => (
          <div key={coupon.id} className="border p-3 rounded bg-gray-50 flex justify-between items-center">
            <div>
              <strong className="text-lg text-blue-900">{coupon.code}</strong>
              <div className="text-sm text-gray-600">
                {coupon.validPackages && coupon.validPackages.length > 0 
                  ? <span className="text-orange-600 font-bold">⚠️ Sadece {coupon.validPackages.length} pakette geçerli</span>
                  : <span className="text-green-600 font-bold">✅ Tüm paketlerde geçerli</span>
                }
              </div>
            </div>
            <button onClick={() => handleDeleteCoupon(coupon.id)} className="text-red-500 text-sm font-bold">Sil</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCouponPage;