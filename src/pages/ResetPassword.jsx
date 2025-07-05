import { useState } from "react";
import axios from "../utils/axios";
import "../cssFiles/login.css";

const ResetPassword = () => {
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await axios.post("/api/auth/reset-password", {
        code,
        newPassword,
      });
      setMessage(res.data.message || "Şifreniz başarıyla güncellendi.");
    } catch (err) {
      setError("Kod geçersiz veya süresi dolmuş.");
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Şifre Sıfırla</h2>

        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}

        <input
          type="text"
          placeholder="Doğrulama Kodu"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Yeni Şifre"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <button type="submit">Şifreyi Güncelle</button>
      </form>
    </div>
  );
};

export default ResetPassword;
