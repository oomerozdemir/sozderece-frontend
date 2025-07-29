import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "../utils/axios";
import "../cssFiles/login.css";


const ResetPassword = () => {
  const navigate = useNavigate();
  const token = new URLSearchParams(useLocation().search).get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("/api/auth/reset-password", {
        token,
        newPassword,
        confirmPassword,
      });
      setMessage(res.data.message);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError("Şifre sıfırlama başarısız.");
    }
  };

  if (!token) return <p>Geçersiz bağlantı.</p>;

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Yeni Şifre Belirle</h2>
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}

        <input
          type="password"
          placeholder="Yeni Şifre"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Yeni Şifre (Tekrar)"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button type="submit">Şifreyi Güncelle</button>
      </form>
    </div>
  );
};

export default ResetPassword;
