import { useState } from "react";
import { motion } from "framer-motion";
import axios from "../utils/axios";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import Seo from "../components/Seo";

const inputCls = "w-full py-3 px-4 border-2 border-[#e2e8f0] rounded-lg text-[15px] font-[inherit] transition-all outline-none focus:border-[#100481] focus:shadow-[0_0_0_3px_rgba(16,4,129,0.1)] bg-white max-[480px]:text-sm max-[480px]:py-[10px] max-[480px]:px-[14px]";

const InstructorApplicationPage = () => {
  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: "",
    category: "",
    university: "",
    department: "",
    ranking: "",
    message: "",
  });

  const [cvFile, setCvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Category options
  const categories = [
    { value: "PDR_GRADUATE", label: "PDR Mezunu" },
    { value: "PDR_STUDENT", label: "PDR Öğrencisi" },
    { value: "UNIVERSITY_STUDENT", label: "Üniversite Öğrencisi" },
  ];

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(""); // Clear error on input
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      // File size validation (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("CV dosyası 5MB'dan küçük olmalıdır.");
        return;
      }

      // File type validation
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!allowedTypes.includes(file.type)) {
        setError("CV dosyası PDF veya Word formatında olmalıdır.");
        return;
      }

      setCvFile(file);
      setError("");
    }
  };

  // Remove uploaded file
  const removeFile = () => {
    setCvFile(null);
  };

  // Form validation
  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError("Ad alanı zorunludur.");
      return false;
    }

    if (!formData.lastName.trim()) {
      setError("Soyad alanı zorunludur.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Geçerli bir e-posta adresi giriniz.");
      return false;
    }

    const phoneRegex = /^(05)([0-9]{9})$/;
    const cleanPhone = formData.phone.replace(/\s/g, "");
    if (!phoneRegex.test(cleanPhone)) {
      setError("Telefon numarası 05XX XXX XX XX formatında olmalıdır.");
      return false;
    }

    if (!formData.category) {
      setError("Lütfen bir kategori seçiniz.");
      return false;
    }

    if (formData.category === "UNIVERSITY_STUDENT") {
      if (!formData.university.trim()) {
        setError("Üniversite öğrencileri için üniversite bilgisi zorunludur.");
        return false;
      }
      if (!formData.department.trim()) {
        setError("Üniversite öğrencileri için bölüm bilgisi zorunludur.");
        return false;
      }
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare FormData for file upload
      const submitData = new FormData();

      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          submitData.append(key, formData[key]);
        }
      });

      if (cvFile) {
        submitData.append("cv", cvFile);
      }

   const response = await axios.post("/api/v1/applications/apply", formData, {
    headers: { "Content-Type": "multipart/form-data" },
});

      if (response.data.success) {
        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          birthDate: "",
          category: "",
          university: "",
          department: "",
          ranking: "",
          message: "",
        });
        setCvFile(null);
        setShowSuccess(true);
      }
    } catch (err) {
      console.error("Başvuru hatası:", err);
      setError(
        err.response?.data?.message ||
          "Başvuru gönderilirken bir hata oluştu. Lütfen tekrar deneyiniz."
      );
    } finally {
      setLoading(false);
    }
  };

  // Check if university fields should be shown
  const showUniversityFields = formData.category === "UNIVERSITY_STUDENT";

  return (
    <>
      <Seo
        title="Sözderece'de Koç Başvurusu"
        description="Üniversite öğrencisi misin? Sözderece Koçluk bünyesinde LGS ve YKS öğrencilerine koçluk yap. Başvuru formu ile hemen başvur."
        canonical="/basvuru"
      />
      <Navbar />

      <motion.div
        className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0] py-10 px-5 max-[768px]:py-5 max-[768px]:px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-[800px] mx-auto bg-white rounded-2xl shadow-[0_4px_24px_rgba(16,4,129,0.08)] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-[#100481] to-[#FF6B35] py-10 px-[30px] text-center text-white max-[768px]:py-[30px] max-[768px]:px-5">
            <h1 className="text-[32px] font-bold m-0 mb-3 max-[768px]:text-2xl max-[480px]:text-xl">🎓 Öğrenci Koçu Başvuru Formu</h1>
            <p className="text-base m-0 opacity-[0.95] leading-[1.6] max-[768px]:text-sm">
              Sözderece ailesine katılmak için başvuru formunu doldurun.
              <br />
              Başvurunuzu değerlendirip en kısa sürede size dönüş yapacağız.
            </p>
          </div>

          {/* Form */}
          <div className="py-10 px-[30px] max-[768px]:py-6 max-[768px]:px-5">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 py-3 px-4 bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] text-sm rounded-lg mb-5">
                  <span>⚠️</span>
                  {error}
                </div>
              )}

              {/* Personal Information */}
              <div className="p-6 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] max-[768px]:p-5">
                <h2 className="text-xl text-[#100481] m-0 mb-5 pb-3 border-b-2 border-[#FF6B35] font-semibold max-[768px]:text-lg">Kişisel Bilgiler</h2>

                <div className="grid grid-cols-2 gap-4 max-[768px]:grid-cols-1 max-[768px]:gap-0">
                  <div className="mb-5 last:mb-0">
                    <label htmlFor="firstName" className="block font-semibold text-[#334155] mb-2 text-sm">
                      Ad <span className="text-[#ef4444] ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Adınız"
                      className={inputCls}
                      required
                    />
                  </div>

                  <div className="mb-5 last:mb-0">
                    <label htmlFor="lastName" className="block font-semibold text-[#334155] mb-2 text-sm">
                      Soyad <span className="text-[#ef4444] ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Soyadınız"
                      className={inputCls}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 max-[768px]:grid-cols-1 max-[768px]:gap-0">
                  <div className="mb-5 last:mb-0">
                    <label htmlFor="email" className="block font-semibold text-[#334155] mb-2 text-sm">
                      E-posta <span className="text-[#ef4444] ml-1">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="ornek@email.com"
                      className={inputCls}
                      required
                    />
                  </div>

                  <div className="mb-5 last:mb-0">
                    <label htmlFor="phone" className="block font-semibold text-[#334155] mb-2 text-sm">
                      Telefon <span className="text-[#ef4444] ml-1">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="05XX XXX XX XX"
                      className={inputCls}
                      required
                    />
                  </div>
                </div>

                <div className="mb-5 last:mb-0">
                  <label htmlFor="birthDate" className="block font-semibold text-[#334155] mb-2 text-sm">Doğum Tarihi</label>
                  <input
                    type="date"
                    id="birthDate"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Category Selection */}
              <div className="p-6 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] max-[768px]:p-5">
                <h2 className="text-xl text-[#100481] m-0 mb-5 pb-3 border-b-2 border-[#FF6B35] font-semibold max-[768px]:text-lg">Kategori Seçimi <span className="text-[#ef4444] ml-1">*</span></h2>

                <div className="flex flex-col gap-3">
                  {categories.map((cat) => (
                    <div
                      key={cat.value}
                      className="flex items-center py-[14px] px-[18px] bg-white border-2 border-[#e2e8f0] rounded-lg cursor-pointer transition hover:border-[#100481] hover:bg-[#f8fafc] max-[768px]:py-3 max-[768px]:px-[14px]"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, category: cat.value }))
                      }
                    >
                      <input
                        type="radio"
                        id={cat.value}
                        name="category"
                        value={cat.value}
                        checked={formData.category === cat.value}
                        onChange={handleChange}
                        className="peer w-5 h-5 mr-3 cursor-pointer accent-[#100481]"
                      />
                      <label
                        htmlFor={cat.value}
                        className={`m-0 cursor-pointer font-medium flex-1 transition-colors ${formData.category === cat.value ? "text-[#100481] font-semibold" : "text-[#475569]"}`}
                      >
                        {cat.label}
                      </label>
                    </div>
                  ))}
                </div>

                {/* Conditional University Fields */}
                {showUniversityFields && (
                  <div className="mt-4 pt-4 border-t border-dashed border-[#cbd5e1] animate-slide-down">
                    <div className="mb-5 last:mb-0">
                      <label htmlFor="university" className="block font-semibold text-[#334155] mb-2 text-sm">
                        Üniversite <span className="text-[#ef4444] ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        id="university"
                        name="university"
                        value={formData.university}
                        onChange={handleChange}
                        placeholder="Üniversite adı"
                        className={inputCls}
                        required={showUniversityFields}
                      />
                    </div>

                    <div className="mb-5 last:mb-0">
                      <label htmlFor="department" className="block font-semibold text-[#334155] mb-2 text-sm">
                        Bölüm <span className="text-[#ef4444] ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        placeholder="Bölüm adı"
                        className={inputCls}
                        required={showUniversityFields}
                      />
                    </div>

                    <div className="mb-5 last:mb-0">
                      <label htmlFor="ranking" className="block font-semibold text-[#334155] mb-2 text-sm">YKS Derecesi</label>
                      <input
                        type="text"
                        id="ranking"
                        name="ranking"
                        value={formData.ranking}
                        onChange={handleChange}
                        placeholder="Örn: 1234"
                        className={inputCls}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Information */}
              <div className="p-6 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] max-[768px]:p-5">
                <h2 className="text-xl text-[#100481] m-0 mb-5 pb-3 border-b-2 border-[#FF6B35] font-semibold max-[768px]:text-lg">Ek Bilgiler</h2>

                <div className="mb-5 last:mb-0">
                  <label htmlFor="message" className="block font-semibold text-[#334155] mb-2 text-sm">Mesajınız</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Kendinizden bahsedin, neden bizle çalışmak istiyorsunuz?"
                    rows="5"
                    className={`${inputCls} resize-y min-h-[120px] leading-[1.6]`}
                  />
                </div>

                {/* CV Upload */}
                <div className="mb-5 last:mb-0">
                  <label className="block font-semibold text-[#334155] mb-2 text-sm">CV Yükle (Opsiyonel)</label>
                  <div className="relative">
                    <div
                      className={`border-2 border-dashed rounded-xl py-8 px-6 text-center transition cursor-pointer max-[480px]:py-6 max-[480px]:px-4 ${cvFile ? "border-[#10b981] bg-[#ecfdf5]" : "border-[#cbd5e1] bg-white hover:border-[#100481] hover:bg-[#f8fafc]"}`}
                      onClick={() => document.getElementById("cv-upload").click()}
                    >
                      <div className={`text-5xl mb-3 max-[480px]:text-[36px] ${cvFile ? "text-[#10b981]" : "text-[#94a3b8]"}`}>
                        {cvFile ? "📄" : "☁️"}
                      </div>
                      <div className={`text-[15px] mb-2 ${cvFile ? "text-[#059669] font-semibold" : "text-[#64748b]"}`}>
                        {cvFile ? cvFile.name : "CV dosyanızı yüklemek için tıklayın"}
                      </div>
                      <div className="text-[13px] text-[#94a3b8]">
                        PDF veya Word formatı • Maks 5MB
                      </div>
                      <input
                        type="file"
                        id="cv-upload"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                      />
                    </div>
                    {cvFile && (
                      <button
                        type="button"
                        className="mt-3 bg-[#ef4444] text-white border-0 py-2 px-4 rounded-md text-[13px] cursor-pointer transition hover:bg-[#dc2626]"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile();
                        }}
                      >
                        Dosyayı Kaldır
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-8 text-center">
                <button
                  type="submit"
                  className="bg-gradient-to-br from-[#100481] to-[#FF6B35] text-white border-0 py-4 px-12 text-base font-semibold rounded-lg cursor-pointer transition shadow-[0_4px_12px_rgba(16,4,129,0.2)] inline-flex items-center gap-2.5 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(16,4,129,0.3)] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none max-[768px]:w-full max-[768px]:justify-center max-[768px]:py-[14px] max-[768px]:px-6"
                  disabled={loading}
                >
                  {loading && (
                    <span className="inline-block w-[18px] h-[18px] border-[3px] border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  )}
                  {loading ? "Gönderiliyor..." : "Başvuruyu Gönder"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Success Modal */}
        {showSuccess && (
          <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000] p-5"
            onClick={() => setShowSuccess(false)}
          >
            <motion.div
              className="bg-white rounded-2xl py-10 px-10 max-w-[500px] w-full text-center shadow-[0_20px_60px_rgba(0,0,0,0.3)] max-[768px]:py-[30px] max-[768px]:px-5"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-[64px] mb-4">✅</div>
              <h2 className="text-[24px] text-[#100481] m-0 mb-3 max-[768px]:text-xl">Başvurunuz Alındı!</h2>
              <p className="text-base text-[#64748b] leading-[1.6] m-0 mb-6 max-[768px]:text-sm">
                Teşekkür ederiz! Başvurunuz başarıyla iletildi. Ekibimiz en kısa
                sürede değerlendirip size dönüş yapacaktır.
              </p>
              <button
                className="bg-[#100481] text-white border-0 py-3 px-8 rounded-lg text-[15px] font-semibold cursor-pointer transition hover:bg-[#0a0351]"
                onClick={() => setShowSuccess(false)}
              >
                Kapat
              </button>
            </motion.div>
          </div>
        )}
      </motion.div>

      <Footer />
    </>
  );
};

export default InstructorApplicationPage;
