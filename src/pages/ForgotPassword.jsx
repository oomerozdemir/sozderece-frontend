import { useState } from "react";
import axios from "../utils/axios";

const ForgotPassword = () => {
  const [input, setInput] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage("");
  setError("");
  setIsLoading(true);

  try {
    const res = await axios.post("/api/auth/forgot-password", { input });
    setMessage(res.data.message || "Şifre sıfırlama bağlantısı e-postanıza gönderildi.Lütfen spam dosyanızı kontrol etmeyi unutmayın");
  } catch (err) {
    setError("Gönderim başarısız. Lütfen e-posta adresinizi kontrol edin.");
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="flex justify-center items-center h-[50vh] bg-white">
      <form onSubmit={handleSubmit} className="w-full max-w-[400px] text-center px-6">
        <h2 className="text-[2rem] mb-8 text-[#100383] font-semibold tracking-wide">Şifremi Unuttum</h2>

        {message && <p className="text-green-600 text-sm mt-0 mb-2">{message}</p>}
        {error && <p className="text-red-500 text-sm mt-0 mb-2">{error}</p>}

        <input
          type="email"
          placeholder="E-posta adresiniz"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          required
          className="w-full border-0 border-b-2 border-black py-3 px-2 text-base mb-6 bg-transparent text-black focus:outline-none focus:border-gray-800"
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-[#02095f] text-white font-bold text-[0.95rem] tracking-widest border-0 rounded mt-2.5 cursor-pointer transition-colors hover:bg-[#ec5802] disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? "Gönderiliyor..." : "Bağlantı Gönder"}
        </button>

      </form>
    </div>
  );
};

export default ForgotPassword;
