import { useRef, useState } from "react";
import axios from "../utils/axios";

/**
 * ImageUpload — URL alanı + yerelden dosya yükleme (Cloudinary, WebP)
 *
 * Props:
 *   value       : string  — mevcut URL
 *   onChange    : (url: string) => void
 *   placeholder : string  — input placeholder
 *   previewClass: string  — önizleme görseline ek class (ör. "h-24 object-cover")
 */
export default function ImageUpload({ value, onChange, placeholder = "https://...", previewClass = "h-24 object-cover" }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const inp = "w-full border border-[#e2e8f0] rounded-xl px-3 py-2 text-sm text-[#0f172a] focus:outline-none focus:border-[#100481] bg-white";

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("image", file);
      const { data } = await axios.post("/api/admin/upload-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      onChange(data.url);
    } catch (err) {
      setError(err?.response?.data?.message || "Yükleme başarısız.");
    } finally {
      setUploading(false);
      // input'u sıfırla — aynı dosya tekrar seçilebilsin
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="url"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${inp} flex-1`}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] hover:bg-[#eff6ff] hover:border-[#100481] text-xs font-bold text-[#475569] hover:text-[#100481] transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {uploading ? (
            <>
              <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Yükleniyor...
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L11 6.414V13a1 1 0 11-2 0V6.414L7.707 7.707A1 1 0 016.293 6.293l3-3A1 1 0 0110 3z" />
                <path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
              </svg>
              Yükle
            </>
          )}
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      {error && <p className="text-xs text-[#ef4444]">{error}</p>}

      {value && !uploading && (
        <div className="relative inline-block">
          <img
            src={value}
            alt="önizleme"
            className={`rounded-xl border border-[#e2e8f0] ${previewClass}`}
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-2 -right-2 w-5 h-5 bg-[#ef4444] text-white rounded-full text-xs flex items-center justify-center hover:bg-[#b91c1c] transition-colors shadow"
            title="Görseli kaldır"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
