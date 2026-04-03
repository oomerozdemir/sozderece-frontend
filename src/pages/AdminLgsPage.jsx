import { useState, useEffect } from "react";
import axios from "../utils/axios";
import ImageUpload from "../components/ImageUpload";

const TABS = [
  { key: "applications", label: "📋 Başvurular" },
  { key: "content", label: "✏️ İçerik" },
  { key: "settings", label: "⚙️ Ayarlar" },
];

const CONTENT_TABS = [
  { key: "hero", label: "🎯 Hero" },
  { key: "painPoints", label: "😟 Acı Noktaları" },
  { key: "howItWorks", label: "🏗 Nasıl Çalışır" },
  { key: "socialProof", label: "⭐ Sosyal Kanıt" },
  { key: "offer", label: "💰 Teklif & Form" },
];

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ── Deep path helpers ─────────────────────────────────────────
const deepClone = (v) => JSON.parse(JSON.stringify(v));

const set = (setter, path, value) =>
  setter((prev) => {
    const next = deepClone(prev);
    const keys = path.split(".");
    let obj = next;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]] || typeof obj[keys[i]] !== "object") obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    return next;
  });

const arrSet = (setter, arrPath, index, field, value) =>
  setter((prev) => {
    const next = deepClone(prev);
    const keys = arrPath.split(".");
    let obj = next;
    for (const k of keys) obj = obj?.[k];
    if (Array.isArray(obj) && obj[index] !== undefined) obj[index][field] = value;
    return next;
  });

const arrAdd = (setter, arrPath, template) =>
  setter((prev) => {
    const next = deepClone(prev);
    const keys = arrPath.split(".");
    let obj = next;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]] || typeof obj[keys[i]] !== "object") obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    const lastKey = keys[keys.length - 1];
    if (!Array.isArray(obj[lastKey])) obj[lastKey] = [];
    obj[lastKey].push({ ...template });
    return next;
  });

const arrDel = (setter, arrPath, index) =>
  setter((prev) => {
    const next = deepClone(prev);
    const keys = arrPath.split(".");
    let obj = next;
    for (const k of keys) obj = obj?.[k];
    if (Array.isArray(obj)) obj.splice(index, 1);
    return next;
  });

// ── Shared UI components ──────────────────────────────────────
const inp = "w-full border border-[#e2e8f0] rounded-xl px-3 py-2 text-sm text-[#0f172a] focus:outline-none focus:border-[#100481] bg-white";
const Label = ({ children }) => <p className="text-xs font-bold text-[#374151] mb-1">{children}</p>;
const Field = ({ label, children }) => (
  <div>
    <Label>{label}</Label>
    {children}
  </div>
);
const AddBtn = ({ onClick, label = "Ekle" }) => (
  <button onClick={onClick} className="text-xs font-bold bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe] px-3 py-1.5 rounded-lg hover:bg-[#dbeafe] transition-colors">
    + {label}
  </button>
);
const DelBtn = ({ onClick }) => (
  <button onClick={onClick} className="text-xs text-[#ef4444] hover:text-[#b91c1c] font-bold px-2 py-1 rounded transition-colors">✕</button>
);

// ── Section editors ───────────────────────────────────────────

function HeroEditor({ content, setContent }) {
  const h = content.hero || {};
  const s = (field, val) => set(setContent, `hero.${field}`, val);
  return (
    <div className="space-y-4">
      <Field label="LGS Tarihi (YYYY-MM-DD)">
        <input type="date" value={content.lgsDate || "2026-06-14"} onChange={(e) => set(setContent, "lgsDate", e.target.value)} className={inp} />
      </Field>
      <Field label="Alt Başlık">
        <input value={h.subtitle || ""} onChange={(e) => s("subtitle", e.target.value)} className={inp} placeholder="Her gün yanında biri var..." />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Chip 1">
          <input value={h.chip1 || ""} onChange={(e) => s("chip1", e.target.value)} className={inp} />
        </Field>
        <Field label="Chip 2">
          <input value={h.chip2 || ""} onChange={(e) => s("chip2", e.target.value)} className={inp} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Ana CTA Butonu">
          <input value={h.ctaPrimary || ""} onChange={(e) => s("ctaPrimary", e.target.value)} className={inp} />
        </Field>
        <Field label="Navbar CTA Butonu">
          <input value={h.navbarCta || ""} onChange={(e) => s("navbarCta", e.target.value)} className={inp} />
        </Field>
      </div>

      {/* Hero Medya */}
      <div className="pt-2 border-t border-[#f1f5f9]">
        <Label>Hero Medya Tipi</Label>
        <div className="flex gap-2 mb-3">
          {[{ val: "video", label: "🎬 Video" }, { val: "images", label: "🖼️ 3 Resim" }].map(({ val, label }) => (
            <button
              key={val}
              type="button"
              onClick={() => s("mediaType", val)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${(h.mediaType || "video") === val ? "bg-[#100481] text-white border-[#100481]" : "bg-white text-[#475569] border-[#e2e8f0] hover:border-[#100481]"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {(h.mediaType || "video") === "video" ? (
          <Field label="Video URL (YouTube embed)">
            <input value={h.videoUrl || ""} onChange={(e) => s("videoUrl", e.target.value)} className={inp} placeholder="https://www.youtube.com/embed/..." />
          </Field>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-[#9ca3af]">3 resim yan yana gösterilir. Boş bırakılanlar gizlenir.</p>
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-[#f8fafc] rounded-xl p-3 border border-[#e2e8f0] space-y-2">
                <span className="text-xs font-bold text-[#64748b]">Resim {i + 1}</span>
                <ImageUpload
                  value={h.images?.[i]?.url || ""}
                  onChange={(url) => {
                    const imgs = [...(h.images || [{}, {}, {}])];
                    while (imgs.length <= i) imgs.push({});
                    imgs[i] = { ...imgs[i], url };
                    s("images", imgs);
                  }}
                  placeholder="https://..."
                  previewClass="h-20 object-cover"
                />
                <input
                  className={inp}
                  placeholder="Alt metin (opsiyonel)"
                  value={h.images?.[i]?.alt || ""}
                  onChange={(e) => {
                    const imgs = [...(h.images || [{}, {}, {}])];
                    while (imgs.length <= i) imgs.push({});
                    imgs[i] = { ...imgs[i], alt: e.target.value };
                    s("images", imgs);
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PainPointsEditor({ content, setContent }) {
  const pp = content.painPoints || {};
  const items = pp.items || [];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Bölüm Başlığı">
          <input value={pp.title || ""} onChange={(e) => set(setContent, "painPoints.title", e.target.value)} className={inp} />
        </Field>
        <Field label="Alt Başlık">
          <input value={pp.subtitle || ""} onChange={(e) => set(setContent, "painPoints.subtitle", e.target.value)} className={inp} />
        </Field>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <Label>Sorun Kartları</Label>
          <AddBtn onClick={() => arrAdd(setContent, "painPoints.items", { emoji: "❓", title: "", desc: "" })} label="Kart Ekle" />
        </div>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="bg-[#f8fafc] rounded-xl p-4 border border-[#e2e8f0] space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex gap-2 flex-1">
                  <input
                    value={item.emoji || ""}
                    onChange={(e) => arrSet(setContent, "painPoints.items", i, "emoji", e.target.value)}
                    className={`${inp} w-20 text-center text-lg`}
                    placeholder="📚"
                  />
                  <input
                    value={item.title || ""}
                    onChange={(e) => arrSet(setContent, "painPoints.items", i, "title", e.target.value)}
                    className={`${inp} flex-1`}
                    placeholder="Başlık"
                  />
                </div>
                <DelBtn onClick={() => arrDel(setContent, "painPoints.items", i)} />
              </div>
              <textarea
                value={item.desc || ""}
                onChange={(e) => arrSet(setContent, "painPoints.items", i, "desc", e.target.value)}
                className={`${inp} resize-none h-16`}
                placeholder="Açıklama"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HowItWorksEditor({ content, setContent }) {
  const how = content.howItWorks || {};
  const steps = how.steps || [];
  const comparison = how.comparison || [];
  return (
    <div className="space-y-6">
      {/* Adımlar */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Label>Adımlar</Label>
          <AddBtn onClick={() => arrAdd(setContent, "howItWorks.steps", { title: "", desc: "" })} label="Adım Ekle" />
        </div>
        <div className="space-y-3">
          {steps.map((s, i) => (
            <div key={i} className="bg-[#f8fafc] rounded-xl p-4 border border-[#e2e8f0] space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-[#100481] bg-[#eff6ff] px-2 py-1 rounded-lg min-w-[28px] text-center">{i + 1}</span>
                <input
                  value={s.title || ""}
                  onChange={(e) => arrSet(setContent, "howItWorks.steps", i, "title", e.target.value)}
                  className={`${inp} flex-1`}
                  placeholder="Adım başlığı"
                />
                <DelBtn onClick={() => arrDel(setContent, "howItWorks.steps", i)} />
              </div>
              <textarea
                value={s.desc || ""}
                onChange={(e) => arrSet(setContent, "howItWorks.steps", i, "desc", e.target.value)}
                className={`${inp} resize-none h-16`}
                placeholder="Adım açıklaması"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Karşılaştırma tablosu */}
      <div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <Field label="Karşılaştırma Başlığı">
            <input value={how.comparisonTitle || ""} onChange={(e) => set(setContent, "howItWorks.comparisonTitle", e.target.value)} className={inp} />
          </Field>
          <Field label="Karşılaştırma CTA">
            <input value={how.comparisonCta || ""} onChange={(e) => set(setContent, "howItWorks.comparisonCta", e.target.value)} className={inp} />
          </Field>
        </div>
        <div className="flex items-center justify-between mb-3">
          <Label>Karşılaştırma Satırları</Label>
          <AddBtn onClick={() => arrAdd(setContent, "howItWorks.comparison", { label: "" })} label="Satır Ekle" />
        </div>
        <div className="space-y-2">
          {comparison.map((row, i) => (
            <div key={i} className="flex items-center gap-2 bg-[#f8fafc] rounded-xl px-4 py-2.5 border border-[#e2e8f0]">
              <input
                value={row.label || ""}
                onChange={(e) => arrSet(setContent, "howItWorks.comparison", i, "label", e.target.value)}
                className={`${inp} flex-1`}
                placeholder="Özellik adı"
              />
              <DelBtn onClick={() => arrDel(setContent, "howItWorks.comparison", i)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SocialProofEditor({ content, setContent }) {
  const sp = content.socialProof || {};
  const stats = sp.stats || [];
  const testimonials = sp.testimonials || [];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Başlık">
          <input value={sp.title || ""} onChange={(e) => set(setContent, "socialProof.title", e.target.value)} className={inp} />
        </Field>
        <Field label="Başlık Aksanı (turuncu)">
          <input value={sp.titleAccent || ""} onChange={(e) => set(setContent, "socialProof.titleAccent", e.target.value)} className={inp} />
        </Field>
      </div>
      <div>
        <Field label="Bölüm Alt Başlığı (Opsiyonel)">
          <input value={sp.subtitle || ""} onChange={(e) => set(setContent, "socialProof.subtitle", e.target.value)} className={inp} />
        </Field>
      </div>

      {/* İstatistikler */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Label>İstatistikler</Label>
          <AddBtn onClick={() => arrAdd(setContent, "socialProof.stats", { icon: "", val: "", label: "", desc: "" })} label="İstatistik Ekle" />
        </div>
        <div className="space-y-3">
          {stats.map((s, i) => (
            <div key={i} className="flex flex-col gap-2 bg-[#f8fafc] rounded-xl p-3 border border-[#e2e8f0]">
              <div className="flex items-center gap-2">
                <input
                  value={s.icon || ""}
                  onChange={(e) => arrSet(setContent, "socialProof.stats", i, "icon", e.target.value)}
                  className={`${inp} w-16 text-center`}
                  placeholder="İkon"
                />
                <input
                  value={s.val || ""}
                  onChange={(e) => arrSet(setContent, "socialProof.stats", i, "val", e.target.value)}
                  className={`${inp} w-24`}
                  placeholder="Değer"
                />
                <input
                  value={s.label || ""}
                  onChange={(e) => arrSet(setContent, "socialProof.stats", i, "label", e.target.value)}
                  className={`${inp} flex-1`}
                  placeholder="Başlık"
                />
                <DelBtn onClick={() => arrDel(setContent, "socialProof.stats", i)} />
              </div>
              <input
                value={s.desc || ""}
                onChange={(e) => arrSet(setContent, "socialProof.stats", i, "desc", e.target.value)}
                className={`${inp} w-full`}
                placeholder="Alt açıklama (Opsiyonel)"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Yorumlar */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Label>Yorumlar</Label>
          <AddBtn onClick={() => arrAdd(setContent, "socialProof.testimonials", { quote: "", author: "", isParent: true })} label="Yorum Ekle" />
        </div>
        <div className="space-y-3">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-[#f8fafc] rounded-xl p-4 border border-[#e2e8f0] space-y-2">
              <div className="flex items-start justify-between gap-2">
                <textarea
                  value={t.quote || ""}
                  onChange={(e) => arrSet(setContent, "socialProof.testimonials", i, "quote", e.target.value)}
                  className={`${inp} resize-none h-16 flex-1`}
                  placeholder="Yorum metni..."
                />
                <DelBtn onClick={() => arrDel(setContent, "socialProof.testimonials", i)} />
              </div>
              <div className="flex items-center gap-3">
                <input
                  value={t.author || ""}
                  onChange={(e) => arrSet(setContent, "socialProof.testimonials", i, "author", e.target.value)}
                  className={`${inp} flex-1`}
                  placeholder="Yazar adı"
                />
                <label className="flex items-center gap-1.5 text-xs font-semibold text-[#374151] whitespace-nowrap cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!t.isParent}
                    onChange={(e) => arrSet(setContent, "socialProof.testimonials", i, "isParent", e.target.checked)}
                    className="rounded"
                  />
                  Veli mi?
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OfferFormEditor({ content, setContent }) {
  const o = content.offer || {};
  const f = content.form || {};
  const includes = o.includes || [];
  const plans = Array.isArray(o.plans) ? o.plans : [];

  const PLAN_TEMPLATE = { label: "", price: "", oldPrice: "", priceText: "", desc: "", badge: "", isFeatured: false, ctaText: "", includes: [] };

  return (
    <div className="space-y-6">
      {/* Teklif Başlık */}
      <div>
        <p className="text-sm font-black text-[#0f172a] mb-3 pb-2 border-b border-[#f1f5f9]">Genel Teklif Bilgileri</p>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Başlık">
              <input value={o.title || ""} onChange={(e) => set(setContent, "offer.title", e.target.value)} className={inp} />
            </Field>
            <Field label="Alt Başlık">
              <input value={o.subtitle || ""} onChange={(e) => set(setContent, "offer.subtitle", e.target.value)} className={inp} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="İkincil CTA (form linki)">
              <input value={o.ctaSecondary || ""} onChange={(e) => set(setContent, "offer.ctaSecondary", e.target.value)} className={inp} placeholder="📞 Önce Konuşalım" />
            </Field>
            <Field label="Fallback Satın Al Linki (plan yoksa)">
              <input value={o.buyLink || ""} onChange={(e) => set(setContent, "offer.buyLink", e.target.value)} className={inp} placeholder="/paket-detay" />
            </Field>
          </div>
          <p className="text-xs text-[#94a3b8]">Plan kartları eklendiğinde butona tıklamak sepete ekler ve ödemeye yönlendirir. Plan yoksa "Satın Al Linki"ne gider.</p>
        </div>
      </div>

      {/* Plan Kartları */}
      <div>
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#f1f5f9]">
          <p className="text-sm font-black text-[#0f172a]">Fiyat Planları (yan yana kart olarak gösterilir)</p>
          <AddBtn onClick={() => arrAdd(setContent, "offer.plans", PLAN_TEMPLATE)} label="Plan Ekle" />
        </div>
        {plans.length === 0 && (
          <div className="text-xs text-[#94a3b8] bg-[#f8fafc] rounded-xl p-4 border border-[#e2e8f0] mb-3">
            Plan eklenmedi. Aşağıdaki "Fallback Fiyat" değerleri tek fiyat bloğu olarak gösterilir.
          </div>
        )}
        <div className="space-y-4">
          {plans.map((plan, i) => (
            <div key={i} className={`rounded-xl p-4 border space-y-3 ${plan.isFeatured ? "bg-[#eff6ff] border-[#3b82f6]" : "bg-[#f8fafc] border-[#e2e8f0]"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-[#64748b] uppercase tracking-wide">Plan {i + 1}</span>
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={!!plan.isFeatured}
                      onChange={(e) => arrSet(setContent, "offer.plans", i, "isFeatured", e.target.checked)}
                      className="w-4 h-4 accent-[#3b82f6]"
                    />
                    <span className="text-xs font-semibold text-[#3b82f6]">Öne Çıkan (beyaz kart)</span>
                  </label>
                </div>
                <DelBtn onClick={() => arrDel(setContent, "offer.plans", i)} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Field label="Plan Etiketi">
                  <input className={inp} placeholder="2 Aylık Plan" value={plan.label || ""} onChange={(e) => arrSet(setContent, "offer.plans", i, "label", e.target.value)} />
                </Field>
                <Field label="Fiyat (₺)">
                  <input className={inp} type="number" placeholder="1500" value={plan.price || ""} onChange={(e) => arrSet(setContent, "offer.plans", i, "price", e.target.value)} />
                </Field>
                <Field label="Üstü Çizili Eski Fiyat">
                  <input className={inp} type="number" placeholder="2000" value={plan.oldPrice || ""} onChange={(e) => arrSet(setContent, "offer.plans", i, "oldPrice", e.target.value)} />
                </Field>
                <Field label="Fiyat Metni (/ 2 ay, / LGS'ye kadar...)">
                  <input className={inp} placeholder="/ 2 ay" value={plan.priceText || ""} onChange={(e) => arrSet(setContent, "offer.plans", i, "priceText", e.target.value)} />
                </Field>
                <Field label="Açıklama">
                  <input className={inp} placeholder="Hızlı ivme kazanmak isteyenler için" value={plan.desc || ""} onChange={(e) => arrSet(setContent, "offer.plans", i, "desc", e.target.value)} />
                </Field>
                <Field label="Rozet (boş bırakılabilir)">
                  <input className={inp} placeholder="En İyi Değer" value={plan.badge || ""} onChange={(e) => arrSet(setContent, "offer.plans", i, "badge", e.target.value)} />
                </Field>
                <Field label="Buton Metni">
                  <input className={inp} placeholder="⚡ Yerimi Ayırt" value={plan.ctaText || ""} onChange={(e) => arrSet(setContent, "offer.plans", i, "ctaText", e.target.value)} />
                </Field>
              </div>

              {/* Per-plan includes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Bu Plana Özel Dahil Olanlar <span className="text-[#94a3b8] font-normal">(boşsa genel liste kullanılır)</span></Label>
                  <button
                    onClick={() => arrSet(setContent, "offer.plans", i, "includes", [...(plan.includes || []), ""])}
                    className="text-xs font-bold bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe] px-2 py-1 rounded-lg hover:bg-[#dbeafe]"
                  >
                    + Madde
                  </button>
                </div>
                {(plan.includes || []).map((item, j) => (
                  <div key={j} className="flex gap-2 mb-2">
                    <input
                      className={inp}
                      value={item}
                      onChange={(e) => {
                        const next = [...(plan.includes || [])];
                        next[j] = e.target.value;
                        arrSet(setContent, "offer.plans", i, "includes", next);
                      }}
                    />
                    <DelBtn onClick={() => {
                      const next = (plan.includes || []).filter((_, k) => k !== j);
                      arrSet(setContent, "offer.plans", i, "includes", next);
                    }} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Genel Dahil Olanlar (fallback / paylaşılan) */}
      <div>
        <p className="text-sm font-black text-[#0f172a] mb-3 pb-2 border-b border-[#f1f5f9]">
          Genel Dahil Olanlar <span className="text-[#94a3b8] font-normal text-xs">(plan özel liste yoksa burası kullanılır)</span>
        </p>
        <div className="space-y-2">
          {includes.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[#22c55e] font-black">✓</span>
              <input
                value={item}
                onChange={(e) => {
                  setContent((prev) => {
                    const next = deepClone(prev);
                    if (!next.offer) next.offer = {};
                    if (!Array.isArray(next.offer.includes)) next.offer.includes = [];
                    next.offer.includes[i] = e.target.value;
                    return next;
                  });
                }}
                className={`${inp} flex-1`}
                placeholder="Dahil olan özellik..."
              />
              <DelBtn onClick={() => arrDel(setContent, "offer.includes", i)} />
            </div>
          ))}
          <AddBtn onClick={() => arrAdd(setContent, "offer.includes", "")} label="Madde Ekle" />
        </div>
      </div>

      {/* Fallback tek fiyat (plan yoksa gösterilir) */}
      <div>
        <p className="text-sm font-black text-[#0f172a] mb-3 pb-2 border-b border-[#f1f5f9]">
          Fallback Fiyat <span className="text-[#94a3b8] font-normal text-xs">(yukarıda plan yoksa bu tek blok gösterilir)</span>
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Fiyat (₺)">
            <input type="number" value={o.price || ""} onChange={(e) => set(setContent, "offer.price", e.target.value)} className={inp} placeholder="2500" />
          </Field>
          <Field label="Fiyat Etiketi">
            <input value={o.priceLabel || ""} onChange={(e) => set(setContent, "offer.priceLabel", e.target.value)} className={inp} placeholder="LGS'ye kadar — tek seferlik" />
          </Field>
          <Field label="Ana CTA">
            <input value={o.ctaPrimary || ""} onChange={(e) => set(setContent, "offer.ctaPrimary", e.target.value)} className={inp} placeholder="⚡ Yerimi Ayırt" />
          </Field>
        </div>
      </div>

      {/* Form */}
      <div>
        <p className="text-sm font-black text-[#0f172a] mb-3 pb-2 border-b border-[#f1f5f9]">Form Bloğu</p>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Form Başlığı">
              <input value={f.title || ""} onChange={(e) => set(setContent, "form.title", e.target.value)} className={inp} />
            </Field>
            <Field label="Form Alt Başlığı">
              <input value={f.subtitle || ""} onChange={(e) => set(setContent, "form.subtitle", e.target.value)} className={inp} />
            </Field>
          </div>
          <Field label="Gönder Butonu Metni">
            <input value={f.submitText || ""} onChange={(e) => set(setContent, "form.submitText", e.target.value)} className={inp} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Başarı Başlığı">
              <input value={f.successTitle || ""} onChange={(e) => set(setContent, "form.successTitle", e.target.value)} className={inp} />
            </Field>
            <Field label="Başarı Alt Metni">
              <input value={f.successSubtitle || ""} onChange={(e) => set(setContent, "form.successSubtitle", e.target.value)} className={inp} />
            </Field>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export default function AdminLgsPage() {
  const [tab, setTab] = useState("applications");
  const [contentTab, setContentTab] = useState("hero");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [maxQuota, setMaxQuota] = useState(10);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [content, setContent] = useState(null);
  const [contentSaving, setContentSaving] = useState(false);
  const [contentSaved, setContentSaved] = useState(false);

  const load = () => {
    setLoading(true);
    axios.get("/api/admin/lgs-applications", { headers: authHeaders() })
      .then((r) => {
        setData(r.data);
        setMaxQuota(r.data.maxQuota || 10);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const loadContent = () => {
    axios.get("/api/lgs-content")
      .then((r) => setContent(r.data))
      .catch(() => {});
  };

  useEffect(() => {
    load();
    loadContent();
  }, []);

  const handleExport = () => {
    const token = localStorage.getItem("token");
    window.open(`/api/admin/lgs-applications/export?token=${token}`, "_blank");
  };

  const handleSaveQuota = async () => {
    setSaving(true);
    try {
      await axios.put("/api/admin/settings/lgs", { maxQuota }, { headers: authHeaders() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      load();
    } catch {
      alert("Kayıt sırasında hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveContent = async () => {
    setContentSaving(true);
    try {
      await axios.put("/api/admin/lgs-content", content, { headers: authHeaders() });
      setContentSaved(true);
      setTimeout(() => setContentSaved(false), 2500);
    } catch {
      alert("İçerik kaydedilemedi.");
    } finally {
      setContentSaving(false);
    }
  };

  const tabCls = (key) =>
    tab === key
      ? "px-3 py-2 rounded-xl text-xs font-bold bg-[#100481] text-white shadow transition-all"
      : "px-3 py-2 rounded-xl text-xs font-semibold text-[#475569] hover:bg-[#f1f5f9] transition-all";

  const ctabCls = (key) =>
    contentTab === key
      ? "px-3 py-1.5 rounded-lg text-xs font-bold bg-[#100481] text-white transition-all"
      : "px-3 py-1.5 rounded-lg text-xs font-semibold text-[#475569] hover:bg-[#f1f5f9] transition-all";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black text-[#0f172a]">📚 LGS Hazırlık</h2>
          <p className="text-xs text-[#64748b] mt-0.5">/lgs-hazirlik sayfası yönetimi</p>
        </div>
        {data && (
          <div className="flex gap-3 flex-wrap">
            <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-xl px-4 py-2 text-center">
              <p className="text-xs text-[#3b82f6] font-semibold">Toplam</p>
              <p className="text-xl font-black text-[#1d4ed8]">{data.total}</p>
            </div>
            <div className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-xl px-4 py-2 text-center">
              <p className="text-xs text-[#059669] font-semibold">Kalan</p>
              <p className="text-xl font-black text-[#065f46]">{data.remainingQuota}</p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-[#f1f5f9] p-2 flex gap-1.5">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={tabCls(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── BAŞVURULAR ── */}
      {tab === "applications" && (
        <div className="bg-white rounded-2xl border border-[#f1f5f9] shadow-[0_2px_8px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#f1f5f9]">
            <p className="text-sm font-bold text-[#0f172a]">
              {data ? `${data.total} başvuru` : "Yükleniyor..."}
            </p>
            <button
              onClick={handleExport}
              className="text-xs font-bold bg-[#f8fafc] border border-[#e2e8f0] text-[#475569] hover:text-[#0f172a] px-3 py-1.5 rounded-lg transition-colors"
            >
              ⬇ CSV İndir
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-[#94a3b8] text-sm">Yükleniyor...</div>
          ) : !data?.applications?.length ? (
            <div className="py-12 text-center text-[#94a3b8] text-sm">Henüz başvuru yok.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f8fafc] text-xs font-bold text-[#64748b] uppercase tracking-wide">
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Ad Soyad</th>
                    <th className="px-4 py-3 text-left">Telefon</th>
                    <th className="px-4 py-3 text-left">Sınıf</th>
                    <th className="px-4 py-3 text-left">Mesaj</th>
                    <th className="px-4 py-3 text-left">Tarih</th>
                  </tr>
                </thead>
                <tbody>
                  {data.applications.map((app, i) => (
                    <tr key={app.id} className={`border-t border-[#f1f5f9] ${i % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"} hover:bg-[#eff6ff] transition-colors`}>
                      <td className="px-4 py-3 text-[#94a3b8] text-xs">{app.id}</td>
                      <td className="px-4 py-3 font-semibold text-[#0f172a]">{app.name}</td>
                      <td className="px-4 py-3 text-[#475569]">
                        <a href={`tel:${app.phone}`} className="hover:text-[#100481]">{app.phone}</a>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-[#eff6ff] text-[#1d4ed8] text-xs font-bold px-2 py-0.5 rounded-full">{app.grade}</span>
                      </td>
                      <td className="px-4 py-3 text-[#64748b] max-w-[200px] truncate">{app.message || "—"}</td>
                      <td className="px-4 py-3 text-[#94a3b8] text-xs whitespace-nowrap">
                        {new Date(app.createdAt).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── İÇERİK ── */}
      {tab === "content" && (
        <div className="bg-white rounded-2xl border border-[#f1f5f9] shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
          {!content ? (
            <div className="py-12 text-center text-[#94a3b8] text-sm">Yükleniyor...</div>
          ) : (
            <>
              {/* Content sub-tabs */}
              <div className="px-5 pt-4 pb-3 border-b border-[#f1f5f9] flex gap-1.5 flex-wrap">
                {CONTENT_TABS.map((ct) => (
                  <button key={ct.key} onClick={() => setContentTab(ct.key)} className={ctabCls(ct.key)}>
                    {ct.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {contentTab === "hero" && <HeroEditor content={content} setContent={setContent} />}
                {contentTab === "painPoints" && <PainPointsEditor content={content} setContent={setContent} />}
                {contentTab === "howItWorks" && <HowItWorksEditor content={content} setContent={setContent} />}
                {contentTab === "socialProof" && <SocialProofEditor content={content} setContent={setContent} />}
                {contentTab === "offer" && <OfferFormEditor content={content} setContent={setContent} />}
              </div>

              <div className="px-6 pb-6">
                <button
                  onClick={handleSaveContent}
                  disabled={contentSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#100481] hover:bg-[#0a0357] text-white font-bold text-sm transition-colors disabled:opacity-60"
                >
                  {contentSaving ? "Kaydediliyor..." : contentSaved ? "✅ Kaydedildi" : "💾 İçeriği Kaydet"}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── AYARLAR ── */}
      {tab === "settings" && (
        <div className="bg-white rounded-2xl border border-[#f1f5f9] shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-6 space-y-5 max-w-sm">
          <div>
            <p className="text-sm font-black text-[#0f172a] mb-1">Maksimum Kontenjan</p>
            <p className="text-xs text-[#64748b] mb-3">
              Sayfada "🔥 Sadece X yer kaldı" olarak gösterilir. Kalan = Maksimum − Başvuru sayısı.
            </p>
            <input
              type="number"
              min={1}
              max={100}
              value={maxQuota}
              onChange={(e) => setMaxQuota(parseInt(e.target.value) || 10)}
              className="w-full border border-[#e2e8f0] rounded-xl px-3 py-2.5 text-sm text-[#0f172a] focus:outline-none focus:border-[#100481]"
            />
            {data && (
              <p className="text-xs text-[#64748b] mt-2">
                Şu an {data.total} başvuru var → kalan: <strong>{Math.max(0, maxQuota - data.total)}</strong>
              </p>
            )}
          </div>
          <button
            onClick={handleSaveQuota}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-[#100481] hover:bg-[#0a0357] text-white font-bold text-sm transition-colors disabled:opacity-60"
          >
            {saving ? "Kaydediliyor..." : saved ? "✅ Kaydedildi" : "💾 Kaydet"}
          </button>
        </div>
      )}
    </div>
  );
}
