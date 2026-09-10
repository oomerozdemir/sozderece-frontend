import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  FaCheck,
  FaUserGraduate,
  FaFileUpload,
  FaTimes,
  FaExclamationTriangle,
} from "react-icons/fa";
import axios from "../utils/axios";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import Seo from "../components/Seo";

const inputCls =
  "w-full py-3 px-4 border border-[#e2e8f0] rounded-xl text-[15px] bg-white transition-all outline-none focus:border-page-navy focus:shadow-[0_0_0_3px_rgba(28,27,138,0.1)] placeholder:text-[#aaa] text-[#0f172a] font-nunito";

const CATEGORIES = [
  { value: "PDR_GRADUATE", label: "PDR Mezunu", desc: "Rehberlik ve Psikolojik Danışmanlık bölümünü bitirdim." },
  { value: "PDR_STUDENT", label: "PDR Öğrencisi", desc: "Hâlen PDR bölümünde okuyorum." },
  { value: "UNIVERSITY_STUDENT", label: "Üniversite Öğrencisi / Mezunu", desc: "Farklı bir bölümde okuyorum ya da mezunum (derece öğrencisi dahil)." },
];

const CRITERIA = [
  { title: "27 yaş altı", desc: "Öğrencilerle yakın bir yaş bandında, güncel sınav deneyimine sahip." },
  { title: "Güçlü iletişim", desc: "Öğrenciyle sağlıklı, güven veren bir bağ kurabilmek." },
  { title: "YKS / LGS'ye hâkimiyet", desc: "Sürecin işleyişini, konuları ve deneme kültürünü içeriden bilmek." },
  { title: "Takip deneyimi", desc: "Koçluk ya da öğrenci takibi konusunda daha önce çalışmış olmak." },
  { title: "PDR / derece avantajı", desc: "PDR öğrencisi/mezunu veya derece öğrencisi olmak öne çıkarır." },
  { title: "Düzen ve ekip uyumu", desc: "Sorumluluk sahibi, düzenli ve ekip çalışmasına yatkın olmak." },
];

const CV_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const SAMPLE_TYPES = [...CV_TYPES, "image/jpeg", "image/png", "image/webp"];
const MAX_MB = 5;
const MAX_SAMPLES = 5;

function calcAge(birthDate) {
  if (!birthDate) return null;
  const b = new Date(birthDate);
  if (Number.isNaN(b.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}

function Eyebrow({ children }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="inline-block w-6 h-[3px] rounded-full" style={{ background: "#FF6B35" }} />
      <span className="font-fredoka font-bold text-[12px] uppercase text-accent-orange" style={{ letterSpacing: 3 }}>
        {children}
      </span>
    </div>
  );
}

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  birthDate: "",
  category: "",
  university: "",
  department: "",
  ranking: "",
  experience: "",
  message: "",
};

// Boş bırakılan alanı ekranda ortala + odakla; hata mesajı formun tepesinde
// kalıp kullanıcı fark etmediği için (sayfa uzun, gönder butonu altta).
function focusField(id) {
  if (typeof document === "undefined") return;
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  // Radyo/label gibi odaklanamayan öğelerde focus sessizce yok sayılır.
  if (typeof el.focus === "function") {
    try { el.focus({ preventScroll: true }); } catch { /* noop */ }
  }
}

export default function InstructorApplicationPage() {
  const [formData, setFormData] = useState(emptyForm);
  const [cvFile, setCvFile] = useState(null);
  const [sampleFiles, setSampleFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const errorBoxRef = useRef(null);

  const age = useMemo(() => calcAge(formData.birthDate), [formData.birthDate]);

  const fail = (msg, focusId) => {
    setError(msg);
    // Hata kutusu bir sonraki render'da DOM'a giriyor — önce onu, alanı yoksa
    // yine de görünür kılmak için scroll ediyoruz.
    setTimeout(() => {
      if (focusId) focusField(focusId);
      else errorBoxRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 60);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setError("");
  };

  const handleCvChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_MB * 1024 * 1024) return setError(`CV dosyası ${MAX_MB}MB'dan küçük olmalı.`);
    if (!CV_TYPES.includes(file.type)) return setError("CV PDF veya Word formatında olmalı.");
    setCvFile(file);
    setError("");
  };

  const handleSampleChange = (e) => {
    const incoming = Array.from(e.target.files || []);
    let next = [...sampleFiles];
    for (const f of incoming) {
      if (next.length >= MAX_SAMPLES) {
        setError(`En fazla ${MAX_SAMPLES} örnek program yükleyebilirsin.`);
        break;
      }
      if (f.size > MAX_MB * 1024 * 1024) {
        setError(`"${f.name}" ${MAX_MB}MB'dan büyük.`);
        continue;
      }
      if (!SAMPLE_TYPES.includes(f.type)) {
        setError(`"${f.name}" PDF, Word veya resim olmalı.`);
        continue;
      }
      next.push(f);
    }
    setSampleFiles(next);
    e.target.value = "";
  };

  const removeSample = (idx) => setSampleFiles((p) => p.filter((_, i) => i !== idx));

  // İlk boş/hatalı alanı sırayla bulur — [mesaj, odaklanılacak DOM id'si].
  const findFirstError = () => {
    if (!formData.firstName.trim()) return ["Ad alanı zorunludur.", "firstName"];
    if (!formData.lastName.trim()) return ["Soyad alanı zorunludur.", "lastName"];
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return ["Geçerli bir e-posta adresi giriniz.", "email"];
    if (!/^(05)([0-9]{9})$/.test(formData.phone.replace(/\s/g, ""))) return ["Telefon 05XX XXX XX XX formatında olmalı.", "phone"];
    if (!formData.birthDate) return ["Doğum tarihi zorunludur.", "birthDate"];
    if (!formData.category) return ["Lütfen bir kategori seçiniz.", "category-section"];
    if (!formData.university.trim()) return ["Üniversite bilgisi zorunludur.", "university"];
    if (!formData.department.trim()) return ["Bölüm bilgisi zorunludur.", "department"];
    if (formData.experience.trim().length < 30)
      return ["Deneyimini biraz daha ayrıntılı anlat (en az birkaç cümle).", "experience"];
    if (!cvFile) return ["Lütfen CV'ni yükle.", "cv-section"];
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = findFirstError();
    if (v) {
      fail(v[0], v[1]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([k, val]) => {
        if (val) submitData.append(k, val);
      });
      if (cvFile) submitData.append("cv", cvFile);
      sampleFiles.forEach((f) => submitData.append("samplePrograms", f));

      const res = await axios.post("/api/v1/applications/apply", submitData);
      if (res.data.success) {
        setFormData(emptyForm);
        setCvFile(null);
        setSampleFiles([]);
        setShowSuccess(true);
      }
    } catch (err) {
      fail(
        err.response?.data?.message ||
          "Başvuru gönderilirken bir hata oluştu. Lütfen tekrar deneyiniz."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Seo
        title="Öğrenci Koçu Başvurusu"
        description="Sözderece Koçluk bünyesinde LGS ve YKS öğrencilerine koçluk yap. Aradığımız kriterleri incele, örnek programların ve CV'nle başvur."
        canonical="/basvuru"
      />
      <Navbar />

      <main className="bg-white">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden" style={{ borderBottom: "1px solid #F0EFF5" }}>
          <div className="absolute top-0 right-0" style={{ width: 300, height: 300, background: "#ede8fa", borderRadius: "0 0 0 100%", opacity: 0.6 }} />
          <div className="max-w-[760px] mx-auto px-6 py-16 text-center relative" style={{ zIndex: 1 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex justify-center">
              <Eyebrow>Koç Başvurusu</Eyebrow>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="font-fredoka font-bold text-page-navy m-0"
              style={{ fontSize: "clamp(30px, 4.5vw, 48px)", letterSpacing: -1, lineHeight: 1.1 }}
            >
              Öğrenci Koçu Ol
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-nunito text-[#475569] mt-4"
              style={{ fontSize: "clamp(15px, 1.5vw, 18px)", lineHeight: 1.6 }}
            >
              Sözderece'de öğrenciyle gün boyu iletişimde olan, onun sürecine gerçekten
              dokunan koçlarla çalışıyoruz. Aşağıdaki kriterleri okuyup formu doldur;
              örnek programların ve CV'nle birlikte başvurunu değerlendireceğiz.
            </motion.p>
          </div>
        </section>

        {/* ── Aradığımız Kriterler ── */}
        <section className="py-14 px-6" style={{ background: "#F8F7FC" }}>
          <div className="max-w-[900px] mx-auto">
            <Eyebrow>Aradığımız Kriterler</Eyebrow>
            <h2 className="font-fredoka font-bold text-page-navy m-0 mb-6" style={{ fontSize: "clamp(24px, 3vw, 32px)" }}>
              Koçlarımızda ne arıyoruz?
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {CRITERIA.map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="bg-white rounded-2xl p-5 border border-[#ECEAF5] flex items-start gap-3"
                >
                  <span
                    className="flex-shrink-0 flex items-center justify-center rounded-full mt-0.5"
                    style={{ width: 24, height: 24, background: "#ede8fa", color: "#1C1B8A" }}
                  >
                    <FaCheck size={11} />
                  </span>
                  <div>
                    <p className="font-fredoka font-bold text-page-navy text-[15px] m-0 mb-1">{c.title}</p>
                    <p className="font-nunito text-[#64748b] text-sm leading-relaxed m-0">{c.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Form ── */}
        <section className="py-16 px-6">
          <div className="max-w-[760px] mx-auto">
            <Eyebrow>Başvuru Formu</Eyebrow>
            <h2 className="font-fredoka font-bold text-page-navy m-0 mb-6" style={{ fontSize: "clamp(24px, 3vw, 32px)" }}>
              Başvurunu gönder
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {error && (
                <div
                  ref={errorBoxRef}
                  role="alert"
                  className="flex items-center gap-2 py-3 px-4 bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] text-sm rounded-xl font-nunito scroll-mt-24"
                >
                  <FaExclamationTriangle size={13} className="flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Kişisel Bilgiler */}
              <div className="bg-[#f8fafc] rounded-2xl border border-[#ECEAF5] p-6 max-[560px]:p-4">
                <h3 className="font-fredoka font-bold text-page-navy text-lg m-0 mb-4">Kişisel Bilgiler</h3>
                <div className="grid grid-cols-2 gap-4 max-[560px]:grid-cols-1">
                  <div>
                    <label htmlFor="firstName" className="block font-nunito font-bold text-[#334155] mb-1.5 text-sm">
                      Ad <span className="text-[#ef4444]">*</span>
                    </label>
                    <input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Adın" className={inputCls} />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block font-nunito font-bold text-[#334155] mb-1.5 text-sm">
                      Soyad <span className="text-[#ef4444]">*</span>
                    </label>
                    <input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Soyadın" className={inputCls} />
                  </div>
                  <div>
                    <label htmlFor="email" className="block font-nunito font-bold text-[#334155] mb-1.5 text-sm">
                      E-posta <span className="text-[#ef4444]">*</span>
                    </label>
                    <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="ornek@email.com" className={inputCls} />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block font-nunito font-bold text-[#334155] mb-1.5 text-sm">
                      Telefon <span className="text-[#ef4444]">*</span>
                    </label>
                    <input id="phone" type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="05XX XXX XX XX" className={inputCls} />
                  </div>
                  <div className="col-span-2 max-[560px]:col-span-1">
                    <label htmlFor="birthDate" className="block font-nunito font-bold text-[#334155] mb-1.5 text-sm">
                      Doğum Tarihi <span className="text-[#ef4444]">*</span>
                    </label>
                    <input id="birthDate" type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className={inputCls} />
                    {age !== null && (
                      <p
                        className={`font-nunito text-xs mt-1.5 flex items-center gap-1.5 ${
                          age >= 27 ? "text-[#b45309]" : "text-[#059669]"
                        }`}
                      >
                        {age >= 27 ? <FaExclamationTriangle size={11} /> : <FaCheck size={11} />}
                        Yaşın: {age}. {age >= 27 && "Koçlarımızda 27 yaş altı arıyoruz; yine de başvurabilirsin, ekip değerlendirir."}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Eğitim & Kategori */}
              <div className="bg-[#f8fafc] rounded-2xl border border-[#ECEAF5] p-6 max-[560px]:p-4">
                <h3 className="font-fredoka font-bold text-page-navy text-lg m-0 mb-4">
                  Eğitim <span className="text-[#ef4444]">*</span>
                </h3>
                <div id="category-section" className="flex flex-col gap-2.5 mb-4 scroll-mt-24">
                  {CATEGORIES.map((cat) => {
                    const active = formData.category === cat.value;
                    return (
                      <button
                        type="button"
                        key={cat.value}
                        onClick={() => setFormData((p) => ({ ...p, category: cat.value }))}
                        className={`text-left flex items-start gap-3 py-3.5 px-4 rounded-xl border-2 transition-colors ${
                          active ? "border-page-navy bg-white" : "border-[#e2e8f0] bg-white hover:border-[#c7d2fe]"
                        }`}
                      >
                        <span
                          className="flex-shrink-0 flex items-center justify-center rounded-full mt-0.5 border-2"
                          style={{
                            width: 18,
                            height: 18,
                            borderColor: active ? "#1C1B8A" : "#cbd5e1",
                            background: active ? "#1C1B8A" : "transparent",
                          }}
                        >
                          {active && <FaCheck size={8} className="text-white" />}
                        </span>
                        <span>
                          <span className={`block font-nunito font-bold text-sm ${active ? "text-page-navy" : "text-[#334155]"}`}>{cat.label}</span>
                          <span className="block font-nunito text-xs text-[#64748b] mt-0.5">{cat.desc}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 gap-4 max-[560px]:grid-cols-1">
                  <div>
                    <label htmlFor="university" className="block font-nunito font-bold text-[#334155] mb-1.5 text-sm">
                      Üniversite <span className="text-[#ef4444]">*</span>
                    </label>
                    <input id="university" name="university" value={formData.university} onChange={handleChange} placeholder="Okuduğun / bitirdiğin üniversite" className={inputCls} />
                  </div>
                  <div>
                    <label htmlFor="department" className="block font-nunito font-bold text-[#334155] mb-1.5 text-sm">
                      Bölüm <span className="text-[#ef4444]">*</span>
                    </label>
                    <input id="department" name="department" value={formData.department} onChange={handleChange} placeholder="Bölümün" className={inputCls} />
                  </div>
                  <div className="col-span-2 max-[560px]:col-span-1">
                    <label htmlFor="ranking" className="block font-nunito font-bold text-[#334155] mb-1.5 text-sm">
                      YKS Sıralaman / Dereceniz <span className="text-[#94a3b8] font-normal">(opsiyonel)</span>
                    </label>
                    <input id="ranking" name="ranking" value={formData.ranking} onChange={handleChange} placeholder="Örn: TYT 2.500 · AYT 1.800 ya da bölüm 1.'si" className={inputCls} />
                  </div>
                </div>
              </div>

              {/* Deneyim & Örnek Çalışmalar */}
              <div className="bg-[#f8fafc] rounded-2xl border border-[#ECEAF5] p-6 max-[560px]:p-4">
                <h3 className="font-fredoka font-bold text-page-navy text-lg m-0 mb-4">Deneyim & Örnek Çalışmalar</h3>

                <div className="mb-4">
                  <label htmlFor="experience" className="block font-nunito font-bold text-[#334155] mb-1.5 text-sm">
                    Koçluk / öğrenci takibi deneyimin <span className="text-[#ef4444]">*</span>
                  </label>
                  <textarea
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Kaç öğrenciyle, ne kadar süre çalıştın? Hangi sınav grubu (LGS/TYT/AYT)? Nasıl bir takip yöntemi kullandın, hangi sonuçları aldın?"
                    className={`${inputCls} resize-y min-h-[120px] leading-relaxed`}
                  />
                </div>

                {/* Örnek Programlar */}
                <div className="mb-4">
                  <label className="block font-nunito font-bold text-[#334155] mb-1.5 text-sm">
                    Örnek Program(lar) <span className="text-[#94a3b8] font-normal">(en fazla {MAX_SAMPLES} dosya)</span>
                  </label>
                  <p className="font-nunito text-xs text-[#64748b] mb-2">
                    Daha önce hazırladığın haftalık/aylık örnek çalışma programları. PDF, Word veya görsel.
                  </p>
                  <label
                    htmlFor="sample-upload"
                    className="flex flex-col items-center justify-center border-2 border-dashed border-[#cbd5e1] rounded-xl py-7 px-5 text-center cursor-pointer bg-white hover:border-page-navy hover:bg-[#f8fafc] transition-colors"
                  >
                    <FaFileUpload size={24} className="text-[#94a3b8] mb-2" />
                    <span className="font-nunito text-sm text-[#64748b]">Dosya seçmek için tıkla</span>
                    <span className="font-nunito text-xs text-[#94a3b8] mt-1">PDF / Word / Görsel • dosya başına maks {MAX_MB}MB</span>
                    <input
                      id="sample-upload"
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleSampleChange}
                    />
                  </label>
                  {sampleFiles.length > 0 && (
                    <ul className="mt-3 flex flex-col gap-2">
                      {sampleFiles.map((f, i) => (
                        <li key={i} className="flex items-center justify-between gap-3 bg-white border border-[#e2e8f0] rounded-lg px-3 py-2">
                          <span className="font-nunito text-sm text-[#334155] truncate">📄 {f.name}</span>
                          <button
                            type="button"
                            onClick={() => removeSample(i)}
                            className="flex-shrink-0 text-[#ef4444] hover:text-[#dc2626]"
                            aria-label="Dosyayı kaldır"
                          >
                            <FaTimes size={13} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* CV */}
                <div id="cv-section" className="scroll-mt-24">
                  <label className="block font-nunito font-bold text-[#334155] mb-1.5 text-sm">
                    CV <span className="text-[#ef4444]">*</span>
                  </label>
                  <p className="font-nunito text-xs text-[#64748b] mb-2">
                    Derece / sıralama bilgin, okuduğun okul ve geçmiş deneyimlerin. PDF veya Word.
                  </p>
                  <label
                    htmlFor="cv-upload"
                    className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl py-7 px-5 text-center cursor-pointer transition-colors ${
                      cvFile ? "border-[#10b981] bg-[#ecfdf5]" : "border-[#cbd5e1] bg-white hover:border-page-navy hover:bg-[#f8fafc]"
                    }`}
                  >
                    <FaUserGraduate size={24} className={cvFile ? "text-[#10b981] mb-2" : "text-[#94a3b8] mb-2"} />
                    <span className={`font-nunito text-sm ${cvFile ? "text-[#059669] font-bold" : "text-[#64748b]"}`}>
                      {cvFile ? cvFile.name : "CV dosyanı yüklemek için tıkla"}
                    </span>
                    <span className="font-nunito text-xs text-[#94a3b8] mt-1">PDF / Word • maks {MAX_MB}MB</span>
                    <input
                      id="cv-upload"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={handleCvChange}
                    />
                  </label>
                  {cvFile && (
                    <button
                      type="button"
                      onClick={() => setCvFile(null)}
                      className="mt-2 font-nunito text-xs text-[#ef4444] hover:underline"
                    >
                      CV'yi kaldır
                    </button>
                  )}
                </div>
              </div>

              {/* Ek Not */}
              <div className="bg-[#f8fafc] rounded-2xl border border-[#ECEAF5] p-6 max-[560px]:p-4">
                <label htmlFor="message" className="block font-fredoka font-bold text-page-navy text-lg mb-3">
                  Eklemek istediğin bir şey var mı? <span className="font-nunito text-sm text-[#94a3b8] font-normal">(opsiyonel)</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Neden Sözderece'de koçluk yapmak istiyorsun? Uygun olduğun günler / saatler..."
                  className={`${inputCls} resize-y min-h-[100px] leading-relaxed`}
                />
              </div>

              <motion.button
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                type="submit"
                disabled={loading}
                className="mt-2 py-4 font-fredoka font-bold text-white rounded-2xl text-base w-full disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: "#1C1B8A", boxShadow: "0 10px 26px rgba(28,27,138,0.25)" }}
              >
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Gönderiliyor…
                  </>
                ) : (
                  "Başvuruyu Gönder →"
                )}
              </motion.button>
            </form>
          </div>
        </section>
      </main>

      {showSuccess && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000] p-5"
          onClick={() => setShowSuccess(false)}
        >
          <motion.div
            className="bg-white rounded-3xl p-9 max-w-[460px] w-full text-center shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "#ecfdf5", color: "#059669" }}
            >
              <FaCheck size={26} />
            </div>
            <h2 className="font-fredoka font-bold text-page-navy text-xl m-0 mb-2">Başvurun alındı!</h2>
            <p className="font-nunito text-[#64748b] text-sm leading-relaxed m-0 mb-6">
              Teşekkürler. Başvurunu ekibimiz değerlendirip en kısa sürede sana dönüş yapacak.
            </p>
            <button
              onClick={() => setShowSuccess(false)}
              className="font-fredoka font-bold text-white rounded-xl py-3 px-8 text-sm"
              style={{ background: "#1C1B8A" }}
            >
              Kapat
            </button>
          </motion.div>
        </div>
      )}

      <Footer />
    </>
  );
}
