import { useState } from "react";
import { motion } from "framer-motion";
import axios from "../utils/axios";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import "../cssFiles/instructorApplication.css";

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

   const response = await axios.post("/api/applications/apply", formData, { 
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
      <Navbar />
      
      <motion.div
        className="instructor-application-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="application-container">
          {/* Header */}
          <div className="application-header">
            <h1>🎓 Öğrenci Koçu Başvuru Formu</h1>
            <p>
              Sözderece ailesine katılmak için başvuru formunu doldurun.
              <br />
              Başvurunuzu değerlendirip en kısa sürede size dönüş yapacağız.
            </p>
          </div>

          {/* Form */}
          <div className="application-form-wrapper">
            <form onSubmit={handleSubmit} className="application-form">
              {/* Error Message */}
              {error && (
                <div className="error-message">
                  <span>⚠️</span>
                  {error}
                </div>
              )}

              {/* Personal Information */}
              <div className="form-section">
                <h2>Kişisel Bilgiler</h2>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">
                      Ad <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Adınız"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastName">
                      Soyad <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Soyadınız"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">
                      E-posta <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="ornek@email.com"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">
                      Telefon <span className="required">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="05XX XXX XX XX"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="birthDate">Doğum Tarihi</label>
                  <input
                    type="date"
                    id="birthDate"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Category Selection */}
              <div className="form-section">
                <h2>Kategori Seçimi <span className="required">*</span></h2>

                <div className="radio-group">
                  {categories.map((cat) => (
                    <div
                      key={cat.value}
                      className="radio-option"
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
                      />
                      <label htmlFor={cat.value}>{cat.label}</label>
                    </div>
                  ))}
                </div>

                {/* Conditional University Fields */}
                {showUniversityFields && (
                  <div className="conditional-fields">
                    <div className="form-group">
                      <label htmlFor="university">
                        Üniversite <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        id="university"
                        name="university"
                        value={formData.university}
                        onChange={handleChange}
                        placeholder="Üniversite adı"
                        required={showUniversityFields}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="department">
                        Bölüm <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        placeholder="Bölüm adı"
                        required={showUniversityFields}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="ranking">YKS Derecesi</label>
                      <input
                        type="text"
                        id="ranking"
                        name="ranking"
                        value={formData.ranking}
                        onChange={handleChange}
                        placeholder="Örn: 1234"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Information */}
              <div className="form-section">
                <h2>Ek Bilgiler</h2>

                <div className="form-group">
                  <label htmlFor="message">Mesajınız</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Kendinizden bahsedin, neden bizle çalışmak istiyorsunuz?"
                    rows="5"
                  />
                </div>

                {/* CV Upload */}
                <div className="form-group">
                  <label>CV Yükle (Opsiyonel)</label>
                  <div className="file-upload-wrapper">
                    <div
                      className={`file-upload-area ${cvFile ? "has-file" : ""}`}
                      onClick={() => document.getElementById("cv-upload").click()}
                    >
                      <div className="file-upload-icon">
                        {cvFile ? "📄" : "☁️"}
                      </div>
                      <div className="file-upload-text">
                        {cvFile ? cvFile.name : "CV dosyanızı yüklemek için tıklayın"}
                      </div>
                      <div className="file-upload-hint">
                        PDF veya Word formatı • Maks 5MB
                      </div>
                      <input
                        type="file"
                        id="cv-upload"
                        className="file-upload-input"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                      />
                    </div>
                    {cvFile && (
                      <button
                        type="button"
                        className="remove-file-btn"
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
              <div className="submit-section">
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading && <span className="loading-spinner"></span>}
                  {loading ? "Gönderiliyor..." : "Başvuruyu Gönder"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Success Modal */}
        {showSuccess && (
          <div className="success-modal-overlay" onClick={() => setShowSuccess(false)}>
            <motion.div
              className="success-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="success-icon">✅</div>
              <h2>Başvurunuz Alındı!</h2>
              <p>
                Teşekkür ederiz! Başvurunuz başarıyla iletildi. Ekibimiz en kısa
                sürede değerlendirip size dönüş yapacaktır.
              </p>
              <button className="close-modal-btn" onClick={() => setShowSuccess(false)}>
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