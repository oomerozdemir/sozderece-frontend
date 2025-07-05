import { useState, useEffect } from "react";
import axios from "../utils/axios";

const AdminCouponPage = () => {
  const [code, setCode] = useState("");
  const [discountRate, setDiscountRate] = useState("");
  const [maxUsage, setMaxUsage] = useState("");
  const [message, setMessage] = useState("");
  const [coupons, setCoupons] = useState([]);

  const fetchCoupons = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/coupon/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
      await axios.post(
        "/api/coupon/create",
        { code, discountRate, maxUsage },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage("✅ Kupon başarıyla oluşturuldu.");
      setCode("");
      setDiscountRate("");
      setMaxUsage("");
      fetchCoupons(); // yeniden listele
    } catch (err) {
      setMessage(err.response?.data?.error || "❌ Bir hata oluştu.");
    }
  };

  const handleDeleteCoupon = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/coupon/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">🎟️ Kupon Oluştur</h2>
      <form onSubmit={handleCreateCoupon} className="space-y-4 mb-6">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Kupon Kodu (ör: INDIRIM10)"
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="number"
          value={discountRate}
          onChange={(e) => setDiscountRate(e.target.value)}
          placeholder="İndirim Oranı (%)"
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="number"
          value={maxUsage}
          onChange={(e) => setMaxUsage(e.target.value)}
          placeholder="Maksimum Kullanım Adedi"
          className="w-full border p-2 rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Oluştur
        </button>
        {message && <p className="mt-2 text-sm text-gray-700">{message}</p>}
      </form>

      <h3 className="text-lg font-semibold mb-2">📋 Oluşturulan Kuponlar</h3>
      <ul className="space-y-2">
        {coupons.map((coupon) => (
          <li
            key={coupon.id}
            className="flex items-center justify-between border p-2 rounded"
          >
            <div>
              <strong>{coupon.code}</strong> – %{coupon.discountRate} indirim
              {" • "}Kullanım: {coupon.usedCount}/Maks:{coupon.usageLimit}
            </div>
            <button
              onClick={() => handleDeleteCoupon(coupon.id)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Sil
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminCouponPage;
