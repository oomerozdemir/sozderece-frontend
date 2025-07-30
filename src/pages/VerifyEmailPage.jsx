import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import "../cssFiles/login.css";


const VerifyEmailPage = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    try {
      const response = await axios.post("/api/verify-code", {
        type: "email",
        code: code.trim(),
      });

      setSuccessMsg("E-posta doğrulandı! Giriş sayfasına yönlendiriliyorsunuz...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError("Kod geçersiz veya süresi dolmuş.");
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>E-posta Doğrulama</h2>

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
