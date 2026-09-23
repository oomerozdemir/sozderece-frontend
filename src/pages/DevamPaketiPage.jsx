import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaWhatsapp, FaCheckCircle } from "react-icons/fa";
import axios from "../utils/axios";
import Navbar from "../components/navbar";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import Seo from "../components/Seo";

const inputCls =
  "w-full px-4 py-3 rounded-xl border border-[#e2e8f0] outline-none text-sm text-[#0f172a] font-nunito focus:border-page-navy transition-colors bg-white";

const fmtTL = (kurus) => `${(kurus / 100).toLocaleString("tr-TR", { maximumFractionDigits: 2 })} TL`;

// Gizli bağlantıyla erişilen, arama motorlarına ve site içi menülere kapalı
// sayfa: fiyat herkese sabit gösterilmiyor, kişinin e-posta/telefonuna bağlı
// kilitli fiyattan geliyor. Asıl koruma sunucuda (prepareOrder) — bu sayfa
// yalnızca kimliği doğrulayıp ödeme adımına taşıyor.
export default function DevamPaketiPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // null | {eligible, unitPrice, label}
  const [error, setError] = useState("");

  const check = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    if (!email.trim() && !phone.trim()) {
      setError("E-posta adresini veya telefon numaranı gir.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post("/api/price-locks/check", { email: email.trim(), phone: phone.trim() });
      setResult(data);
    } catch (err) {
      setError(err?.response?.data?.message || "Kontrol sırasında bir sorun oluştu. Lütfen tekrar dene.");
    } finally {
      setLoading(false);
    }
  };

  const proceed = () => {
    sessionStorage.setItem("sd_lock_identity", JSON.stringify({ email: email.trim(), phone: phone.trim() }));
    navigate(`/hemen-basla/odeme?slug=${encodeURIComponent(result?.package?.slug || "devam-paketi")}&alan=${encodeURIComponent("Mevcut Öğrenci")}&devam=1`);
  };

  return (
    <>
      <Seo title="Mevcut Öğrenci Devam Paketi" noindex />
      <TopBar />
      <Navbar />
      <main className="bg-[#f8f7ff] min-h-[70vh] px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-[560px] mx-auto"
        >
          <p className="font-fredoka font-bold text-[11px] uppercase text-[#FF6B35]" style={{ letterSpacing: 2 }}>
            Mevcut Öğrenciler
          </p>
          <h1 className="font-fredoka font-bold text-page-navy text-3xl mt-2 mb-3">Mevcut Öğrenci Devam Paketi</h1>
          <p className="font-nunito text-[#475569] text-[15px] leading-relaxed mb-8">
            Bu ödeme sayfası Sözderece Koçluk'a daha önce kayıt olmuş ve koçluk sürecine devam eden öğrencilerimiz içindir.
            Aylık devam ücretini görmek için kayıtlı e-posta adresini veya telefon numaranı gir.
          </p>

          <form onSubmit={check} className="bg-white rounded-2xl border border-[#f1f5f9] shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-6 flex flex-col gap-4">
            <div>
              <label className="block mb-1.5 font-nunito text-sm font-semibold text-[#0f172a]">E-posta</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@mail.com" className={inputCls} autoComplete="email" />
            </div>
            <div>
              <label className="block mb-1.5 font-nunito text-sm font-semibold text-[#0f172a]">Telefon <span className="text-[#94a3b8] font-normal">(e-posta yerine)</span></label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05XX XXX XX XX" className={inputCls} autoComplete="tel" />
            </div>
            {error && <p className="font-nunito text-sm text-[#dc2626]">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="py-3 rounded-xl font-fredoka font-bold text-white text-sm disabled:opacity-50"
              style={{ background: "#1C1B8A" }}
            >
              {loading ? "Kontrol ediliyor…" : "Devam Ücretimi Göster"}
            </button>
          </form>

          {result?.eligible && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 bg-white rounded-2xl border border-[#bbf7d0] p-6"
            >
              <p className="flex items-center gap-2 font-nunito font-bold text-[#059669] text-sm mb-2">
                <FaCheckCircle /> Kaydın bulundu
              </p>
              <p className="font-nunito text-[#334155] text-[15px]">
                Aylık devam ücreti: <span className="font-fredoka font-bold text-page-navy text-xl">{fmtTL(result.unitPrice)}</span>
              </p>
              <p className="font-nunito text-[#64748b] text-sm mt-2 leading-relaxed">
                Ödemen tamamlandıktan sonra mevcut koçluk sürecin kaldığı yerden devam eder.
              </p>
              <button
                type="button"
                onClick={proceed}
                className="mt-4 w-full py-3 rounded-xl font-fredoka font-bold text-sm"
                style={{ background: "#c8ff00", color: "#1C1B8A" }}
              >
                Ödemeye Devam Et
              </button>
            </motion.div>
          )}

          {result && !result.eligible && (
            <div className="mt-5 bg-white rounded-2xl border border-[#fde68a] p-6">
              <p className="font-nunito text-[#334155] text-sm leading-relaxed">
                Bu bilgilerle kayıtlı bir devam ücreti bulamadık. Kayıt olurken kullandığın diğer e-posta veya telefonu deneyebilirsin.
                Yardım için bize yazabilirsin.
              </p>
              <a
                href="https://wa.me/905312546701"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 mt-3 font-nunito font-bold text-sm no-underline text-[#7340C8]"
              >
                <FaWhatsapp size={13} /> WhatsApp ile yaz
              </a>
            </div>
          )}
        </motion.div>
      </main>
      <Footer />
    </>
  );
}
