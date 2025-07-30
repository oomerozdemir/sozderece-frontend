import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import "../cssFiles/login.css";

const VerifyEmailPage = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

  const email = localStorage.getItem("pending_email");
  const userId = localStorage.getItem("pending_userId");

  // Email maskeleme fonksiyonu
  const maskEmail = (email) => {
    if (!email) return "";
    const [username, domain] = email.split("@");
    if (!username || !domain) return email;
    if (username.length <= 2) {
      return "*".repeat(username.length) + "@" + domain;
    }
    const visible = username.slice(0, 2);
    return `${visible}***@${domain}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    try {
      await axios.post("/api/verification/verify-code", {
        type: "email",
        code: code.trim(),
        userId,
        target: email,
      });

      // Temizlik ve yönlendirme
      localStorage.removeItem("pending_email");
      localStorage.removeItem("pending_userId");

      setSuccessMsg("E-posta doğrulandı! Giriş sayfasına yönlendiriliyorsunuz...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError("Kod geçersiz veya süresi dolmuş.");
    }
  };

  useEffect(() => {
  if (!email || !userId) {
    navigate("/login");
  }
}, []);

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>E-posta Doğrulama</h2>

        <p>
          Kod <strong>{maskEmail(email)}</strong> adresine gönderildi.
        </p>

        <p style={{ fontSize: "0.9rem" }}>
          Lütfen e-posta adresinize gönderilen 6 haneli kodu girin.
        </p>

        {successMsg && <p className="success-message">{successMsg}</p>}
        {error && <p className="error-message">{error}</p>}

        <input
          type="text"
          placeholder="Doğrulama Kodu"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength={6}
          required
        />

        <button type="submit">Doğrula</button>
      </form>
    </div>
  );
};

export default VerifyEmailPage;
