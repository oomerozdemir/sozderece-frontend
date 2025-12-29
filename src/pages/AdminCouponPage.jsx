import { useState, useEffect } from "react";
import axios from "../utils/axios";

const AdminCouponPage = () => {
  // Temel Bilgiler
  const [code, setCode] = useState("");
  const [maxUsage, setMaxUsage] = useState("");
  
  // YENİ: Kupon Ayarları
  const [type, setType] = useState("RATE"); // "RATE" (Yüzde) veya "FIXED" (Sabit)
  const [discountRate, setDiscountRate] = useState(""); // Örn: 10 (%)
  const [discountAmount, setDiscountAmount] = useState(""); // Örn: 200 (TL)
  const [isFirstOrder, setIsFirstOrder] = useState(false); // Sadece ilk sipariş mi?

  const [message, setMessage] = useState("");
  const [coupons, setCoupons] = useState([]);

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

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      
      // Backend'e gönderilecek veri paketi
      const payload = {
        code,
        maxUsage,
        type, 
        isFirstOrder,
        // Eğer tip RATE ise oranı gönder, FIXED ise tutarı gönder
        discountRate: type === "RATE" ? parseInt(discountRate) : null,
        // Sabit tutarı kuruşa çevirip gönderiyoruz (Backend kuruş bekliyorsa)
        // Eğer backend TL bekliyorsa * 100 işlemini kaldırın.
        discountAmount: type === "FIXED" ? parseFloat(discountAmount) * 100 : null 
      };

      await axios.post("/api/coupon/create", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage("✅ Kupon başarıyla oluşturuldu.");
      
      // Formu temizle
      setCode("");
      setDiscountRate("");
      setDiscountAmount("");
      setMaxUsage("");
      setIsFirstOrder(false);
      setType("RATE");
      
      fetchCoupons(); // Listeyi yenile
    } catch (err) {
      setMessage(err.response?.data?.error || "❌ Bir hata oluştu.");
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
      alert("❌ Kupon silinemedi.");
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  return (
    <div className="p-4 max-w-2xl mx-auto bg-white shadow rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">🎟️ Kupon Yönetimi</h2>
      
      {/* --- OLUŞTURMA FORMU --- */}
      <form onSubmit={handleCreateCoupon} className="space-y-5 mb-8">
        
        {/* Kupon Kodu */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kupon Kodu</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Örn: SOZDERECE200"
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none uppercase"
            required
          />
        </div>

        {/* İndirim Tipi Seçimi */}
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

          {/* Dinamik Input: Tipe göre değişir */}
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

        {/* Kullanım Limiti */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Maksimum Kullanım Adedi</label>
          <input
            type="number"
            value={maxUsage}
            onChange={(e) => setMaxUsage(e.target.value)}
            placeholder="Örn: 100"
            className="w-full border p-2 rounded"
            required
          />
        </div>

        {/* Checkbox: İlk Sipariş */}
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
          <div className={`p-3 rounded text-center ${message.includes("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {message}
          </div>
        )}
      </form>

      {/* --- KUPON LİSTESİ --- */}
      <h3 className="text-lg font-semibold mb-3 border-t pt-4">📋 Aktif Kuponlar</h3>
      <div className="space-y-3">
        {coupons.length === 0 && <p className="text-gray-500">Henüz kupon oluşturulmamış.</p>}
        
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between border p-3 rounded bg-gray-50 hover:bg-white transition"
          >
            <div>
              <div className="flex items-center gap-2">
                <strong className="text-lg text-blue-900">{coupon.code}</strong>
                {/* İlk Sipariş Etiketi */}
                {coupon.isFirstOrder && (
                  <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-bold">
                    YENİ MÜŞTERİ
                  </span>
                )}
              </div>
              
              <div className="text-sm text-gray-600 mt-1">
                {coupon.type === "FIXED" 
                  ? `👉 ${(coupon.discountAmount / 100).toFixed(2)} TL İndirim`
                  : `👉 %${coupon.discountRate} İndirim`
                }
                <span className="mx-2 text-gray-300">|</span>
                Kullanım: <strong>{coupon.usedCount}</strong> / {coupon.usageLimit}
              </div>
            </div>

            <button
              onClick={() => handleDeleteCoupon(coupon.id)}
              className="mt-2 sm:mt-0 bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200 text-sm font-semibold"
            >
              Sil
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCouponPage;