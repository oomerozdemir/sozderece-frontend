import { useState } from "react";
import axios from "../utils/axios";
import "../cssFiles/login.css";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [input, setInput] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await axios.post("/api/auth/forgot-password", { input });

      setMessage(res.data.message || "Doğrulama kodu gönderildi.");
      setError("");

      // Başarılıysa reset-password sayfasına email ile yönlendir
      setTimeout(() => {
        navigate("/reset-password", { state: { email: input } });
      }, 1000);
    } catch (err) {
      setError("Kod gönderilemedi. Bilgileri kontrol edin.");
      setMessage("");
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Şifremi Unuttum</h2>

        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}

        <input
          type="email"
          placeholder="E-posta adresiniz"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          required
        />

        <button type="submit">Kod Gönder</button>
      </form>
    </div>
  );
};

export default ForgotPassword;
