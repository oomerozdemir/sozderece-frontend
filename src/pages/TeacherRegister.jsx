import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../utils/axios";
import Navbar from "../components/navbar";
import { isValidName, isValidEmail, isValidPhone } from "../utils/validation";
import { getRoleFromToken, isTokenValid } from "../utils/auth";
import { TR_CITIES, TR_DISTRICTS } from "../data/tr-geo";

export default function TeacherRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName:"", lastName:"", email:"", password:"", phone:"",
    subjects:[], grades:[], city:"", district:"",
    mode:"BOTH", priceOnline:"", priceF2F:"", bio:"", whyMe: "",
  });

  const [step] = useState("form"); 
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);


  // İl değişince ilçe’yi sıfırla
  useEffect(() => {
    if (!form.city) return;
    const list = TR_DISTRICTS[form.city] || [];
    setForm((s) => ({ ...s, district: list[0] || "" }));
  }, [form.city]);

  const districts = useMemo(() => TR_DISTRICTS[form.city] || [], [form.city]);

  const modeKey = String(form.mode || "").toUpperCase();
  const isOnlineOnly = modeKey === "ONLINE";
  const isFaceOnly   = modeKey === "FACE_TO_FACE";
  const both         = modeKey === "BOTH";

  const onChange = (k, v) => setForm((s)=>({ ...s, [k]: v }));
  const toggleInArray = (key, value) => {
    setForm(s => {
      const arr = new Set(s[key]);
      if (arr.has(value)) arr.delete(value); else arr.add(value);
      return { ...s, [key]: Array.from(arr) };
    });
  };
  const onModeChange = (raw) => {
    const v = String(raw || "").toUpperCase();
    setForm(s => ({
      ...s,
      mode: v,
      priceOnline: v === "FACE_TO_FACE" ? "" : s.priceOnline,
      priceF2F:    v === "ONLINE"      ? "" : s.priceF2F
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!isValidName(form.firstName) || !isValidName(form.lastName)) return setErr("İsim soyisim geçersiz.");
    if (!isValidEmail(form.email)) return setErr("E-posta geçersiz.");
    if (form.phone && !isValidPhone(form.phone)) return setErr("Telefon geçersiz (05XXXXXXXXX).");
    if (!form.city || !form.district) return setErr("İl ve ilçe seçiniz.");
    if (!form.subjects.length) return setErr("En az bir ders alanı seçiniz.");
    if (!form.grades.length) return setErr("En az bir sınıf seviyesi seçiniz.");
    if (isOnlineOnly && form.priceOnline === "") return setErr("Online ders için fiyat giriniz.");
    if (isFaceOnly && form.priceF2F === "") return setErr("Yüz yüze ders için fiyat giriniz.");

    setLoading(true);
    try {
      const payload = {
        ...form,
        priceOnline: form.priceOnline === "" ? undefined : Number(form.priceOnline),
        priceF2F:    form.priceF2F    === "" ? undefined : Number(form.priceF2F),
      };
      const { data } = await axios.post("/api/v1/ogretmen/auth/kayit", payload);

      // token & user'ı sakla ama panele gitme — doğrulama adımına geç
      const token = data?.token;
      const user  = data?.user;
      if (token) localStorage.setItem("token", token);
      if (user)  localStorage.setItem("user", JSON.stringify(user));
navigate("/ogretmen/panel/profil", { replace: true });
    } catch (e) {
      setErr(e?.response?.data?.message || "Kayıt başarısız.");
    } finally {
      setLoading(false);
    }
  };

 
  return (
    <>
      <Navbar />
      <div className="max-w-[1100px] mx-auto my-5 mb-10 px-4">
        <header className="mb-4">
          <h1 className="text-[1.8rem] m-0 text-slate-900">Özel Ders Öğretmeni Kaydı</h1>
          <p className="mt-1.5 mb-4 text-slate-500">Bilgilerinle profilini oluştur; öğrenciler seni kolayca bulsun.</p>
        </header>

        {step === "form" && (
          <form onSubmit={submit}>
            {!!err && (
              <p className="bg-red-100 text-red-800 border border-red-300 px-3 py-2.5 rounded-xl mb-2.5 text-sm">{err}</p>
            )}

            <div className="grid grid-cols-2 gap-3.5 max-[900px]:grid-cols-1">
              {/* Kimlik */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                <div className="font-bold text-gray-900 mb-2.5">Kimlik</div>
                <div className="grid grid-cols-2 gap-2.5">
                  <input className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none" placeholder="Ad" value={form.firstName} onChange={(e)=>onChange("firstName", e.target.value)} required />
                  <input className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none" placeholder="Soyad" value={form.lastName} onChange={(e)=>onChange("lastName", e.target.value)} required />
                </div>
                <input className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none mt-2.5" type="email" placeholder="E-posta" value={form.email} onChange={(e)=>onChange("email", e.target.value)} required />
                <input className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none mt-2.5" type="password" placeholder="Şifre" value={form.password} onChange={(e)=>onChange("password", e.target.value)} required />
                <input className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none mt-2.5" placeholder="Telefon (05XXXXXXXXX)" value={form.phone} onChange={(e)=>onChange("phone", e.target.value)} />
              </div>

              {/* Lokasyon */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                <div className="font-bold text-gray-900 mb-2.5">Lokasyon</div>
                <div className="grid grid-cols-2 gap-2.5">
                  <select className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none" value={form.city} onChange={(e)=>onChange("city", e.target.value)} required>
                    <option value="">İl seçin</option>
                    {TR_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none disabled:bg-slate-50 disabled:text-gray-400" value={form.district} onChange={(e)=>onChange("district", e.target.value)} required disabled={!form.city || districts.length === 0}>
                    <option value="">{!form.city ? "Önce il seçin" : (districts.length ? "İlçe seçin" : "Bu il için ilçe listesi yakında")}</option>
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              {/* Ders Alanları */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                <div className="font-bold text-gray-900 mb-2.5">Ders Alanları</div>
                <div className="flex flex-wrap gap-2">
                  {["Matematik","Fen Bilimleri","Türkçe","Tarih","Coğrafya","Fizik","Kimya","Biyoloji","İngilizce","Almanca","Geometri","Edebiyat","Bilgisayar"].map(s => (
                    <label
                      key={s}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-2 border rounded-full cursor-pointer select-none text-[0.92rem] text-gray-900 ${
                        form.subjects.includes(s) ? "bg-indigo-50 border-indigo-200" : "bg-slate-50 border-gray-200"
                      }`}
                    >
                      <input type="checkbox" className="hidden" checked={form.subjects.includes(s)} onChange={() => toggleInArray("subjects", s)} />
                      {s}
                    </label>
                  ))}
                </div>
              </div>

              {/* Sınıf Seviyeleri */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                <div className="font-bold text-gray-900 mb-2.5">Ders Verilen Seviyeler</div>
                <div className="flex flex-wrap gap-2">
                  {["İlkokul","Ortaokul","Lise","Üniversite","Mezun"].map(g => (
                    <label
                      key={g}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-2 border rounded-full cursor-pointer select-none text-[0.92rem] text-gray-900 ${
                        form.grades.includes(g) ? "bg-indigo-50 border-indigo-200" : "bg-slate-50 border-gray-200"
                      }`}
                    >
                      <input type="checkbox" className="hidden" checked={form.grades.includes(g)} onChange={() => toggleInArray("grades", g)} />
                      {g}
                    </label>
                  ))}
                </div>
              </div>

              {/* Mod & Fiyat */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                <div className="font-bold text-gray-900 mb-2.5">Saatlik ders ücreti ve yer seçimi</div>
                <label className="mb-2 block text-sm text-gray-700">Dersin Yapılacağı Yeri Seçin</label>
                <select className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none" value={form.mode} onChange={(e)=>onModeChange(e.target.value)}>
                  <option value="ONLINE">Online</option>
                  <option value="FACE_TO_FACE">Yüz yüze</option>
                  <option value="BOTH">Online ve Yüz Yüze</option>
                </select>
                <div className="grid grid-cols-2 gap-2.5 mt-2">
                  {(isOnlineOnly || both) && (
                    <div>
                      <label className="block text-[0.85rem] text-gray-700 mb-1.5">Online Fiyat (₺)</label>
                      <input className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none" type="number" placeholder="Online ders ücreti" value={form.priceOnline} onChange={(e)=>onChange("priceOnline", e.target.value)} min={0} required={isOnlineOnly} />
                    </div>
                  )}
                  {(isFaceOnly || both) && (
                    <div>
                      <label className="block text-[0.85rem] text-gray-700 mb-1.5">Yüz Yüze Fiyat (₺)</label>
                      <input className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none" type="number" placeholder="Yüz yüze ders ücreti" value={form.priceF2F} onChange={(e)=>onChange("priceF2F", e.target.value)} min={0} required={isFaceOnly} />
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                <div className="font-bold text-gray-900 mb-2.5">Hakkımda</div>
                <textarea className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none" placeholder="Kendinden ve tecrübenden bahset..." value={form.bio} onChange={(e)=>onChange("bio", e.target.value)} rows={4} />
              </div>
            </div>

            {/* WhyMe */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm mt-3.5">
              <div className="font-bold text-gray-900 mb-2.5">Neden benden ders almalısınız?</div>
              <textarea
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none"
                placeholder="Öğrencilerin sizi seçmesi için güçlü yanlarınızı, yöntemlerinizi, sonuçlarınızı yazın"
                value={form.whyMe}
                onChange={(e)=>onChange("whyMe", e.target.value)}
                rows={5}
              />
            </div>

            <div className="flex gap-3 items-center justify-end mt-4">
              <button
                className="px-3.5 py-2.5 rounded-xl border border-gray-200 bg-[#02095f] text-white font-bold disabled:opacity-60"
                type="submit"
                disabled={loading}
              >
                {loading ? "Kaydediliyor..." : "Kayıt Ol"}
              </button>
              <div> Zaten hesabın var mı? <Link to="/ogretmen/giris" className="text-[#02095f] font-semibold">Giriş yap</Link> </div>
            </div>
          </form>
        )}

      
      </div>
    </>
  );
}
