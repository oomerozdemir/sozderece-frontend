import { useState } from "react";
import axios from "../utils/axios";
import "../cssFiles/login.css";

const ForgotPassword = () => {
  const [input, setInput] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await axios.post("/api/auth/forgot-password", { input });
      setMessage(res.data.message || "Şifre sıfırlama bağlantısı e-postanıza gönderildi.");
    } catch (err) {
      setError("Gönderim başarısız. Lütfen e-posta adresinizi kontrol edin.");
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

        <button type="submit">Bağlantı Gönder</button>
      </form>
    </div>
  );
};

export default ForgotPassword;
