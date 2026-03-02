import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "../utils/axios";


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
    <div className="flex justify-center items-center h-[50vh] bg-white">
      <form onSubmit={handleSubmit} className="w-full max-w-[400px] text-center px-6">
        <h2 className="text-[2rem] mb-8 text-[#100383] font-semibold tracking-wide">Yeni Şifre Belirle</h2>
        {message && <p className="text-green-600 text-sm mt-0 mb-2">{message}</p>}
        {error && <p className="text-red-500 text-sm mt-0 mb-2">{error}</p>}

        <input
          type="password"
          placeholder="Yeni Şifre"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          className="w-full border-0 border-b-2 border-black py-3 px-2 text-base mb-6 bg-transparent text-black focus:outline-none focus:border-gray-800"
        />

        <input
          type="password"
          placeholder="Yeni Şifre (Tekrar)"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full border-0 border-b-2 border-black py-3 px-2 text-base mb-6 bg-transparent text-black focus:outline-none focus:border-gray-800"
        />

        <button
          type="submit"
          className="w-full py-3.5 bg-[#02095f] text-white font-bold text-[0.95rem] tracking-widest border-0 rounded mt-2.5 cursor-pointer transition-colors hover:bg-[#ec5802]"
        >
          Şifreyi Güncelle
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
