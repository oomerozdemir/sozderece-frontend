import { useEffect, useState } from "react";
import axios from "../utils/axios";

const STAGES = [
  "payment_completed",
  "introduction_form_started",
  "introduction_form_completed",
  "process_intro_completed",
  "coach_assigned",
  "first_program_created",
  "onboarding_completed",
];
const stageIdx = (s) => STAGES.indexOf(s);

// Admin'in bir bakışta görmesi gereken 4 kilometre taşı.
const MILESTONES = [
  { label: "Ödeme", at: "payment_completed" },
  { label: "Tanışma Formu", at: "introduction_form_completed" },
  { label: "Koç Ataması", at: "coach_assigned" },
  { label: "İlk Program", at: "first_program_created" },
];


const CORE = ["fullName", "phone", "respondent", "exam"];
const TYPE_LABELS = { text: "Kısa metin", tel: "Telefon", textarea: "Uzun metin", single: "Tek seçim", multi: "Çoklu seçim" };
const RESP = { ogrenci: "Öğrenci", veli: "Veli" };
const inputCls = "w-full px-3 py-2 rounded-xl border border-[#e5e7eb] outline-none text-sm bg-white focus:border-[#1C1B8A]";

function Field({ label, children, wide }) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <div className="text-[11px] font-bold uppercase text-[#94a3b8] mb-1" style={{ letterSpacing: 1 }}>{label}</div>
      <div className="text-sm text-[#0f172a]">{children}</div>
    </div>
  );
}

const renderValue = (v) =>
  Array.isArray(v) ? (
    <ul className="m-0 pl-4 list-disc">{v.map((x) => <li key={x}>{x}</li>)}</ul>
  ) : v ? (
    v
  ) : (
    <span className="text-[#94a3b8]">—</span>
  );

// Aktif form tanımındaki sorular (öğrencinin sınavına uyanlar) + tanımda artık olmayan eski cevap anahtarları.
function answerRows(form, a) {
  const rows = [];
  const seen = new Set();
  for (const st of form.steps) {
    for (const q of st.questions) {
      if (CORE.includes(q.key) || seen.has(q.key)) continue;
      if (q.exam && q.exam !== a.exam) continue;
      seen.add(q.key);
      let v = a[q.key];
      if (q.type === "multi" && a[`${q.key}Other`]) v = [...(v || []).filter((x) => x !== "Diğer"), `Diğer: ${a[`${q.key}Other`]}`];
      rows.push({ key: q.key, label: q.label, value: v, wide: q.type === "textarea" });
    }
  }
  for (const k of Object.keys(a)) {
    if (CORE.includes(k) || seen.has(k) || k.endsWith("Other")) continue;
    rows.push({ key: k, label: `${k} (eski soru)`, value: a[k] });
  }
  return rows;
}

function Card({ o, form }) {
  const [open, setOpen] = useState(false);
  const a = o.answers || {};
  const idx = stageIdx(o.stage);
  const headline = [a.exam, a.field, a.grade].filter(Boolean).join(" · ");

  return (
    <div className="bg-white border border-[#e5e7eb] rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="font-bold text-[#0f172a]">{a.fullName || o.user?.name || o.user?.email}</div>
          <div className="text-sm text-[#475569]">{headline || "Form henüz doldurulmadı"}</div>
          <div className="text-xs text-[#94a3b8] mt-0.5">
            Paket: {o.packageName || "—"} · {new Date(o.createdAt).toLocaleDateString("tr-TR")}
          </div>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {MILESTONES.map((m) => {
            const ok = idx >= stageIdx(m.at);
            return (
              <span key={m.label} className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: ok ? "#dcfce7" : "#f1f5f9", color: ok ? "#166534" : "#94a3b8" }}>
                {ok ? "✓" : "○"} {m.label}
              </span>
            );
          })}
        </div>
      </div>

      {Object.keys(a).length > 0 && (
        <>
          <button onClick={() => setOpen((v) => !v)} className="mt-3 text-xs font-bold underline text-[#1C1B8A] bg-transparent border-0 cursor-pointer p-0">
            {open ? "Cevapları gizle" : "Cevapları gör"}
          </button>
          {open && (
            <div className="grid gap-4 mt-4 sm:grid-cols-2">
              <Field label="İletişim">
                {a.phone || o.user?.phone || "—"} · {o.user?.email}
                <div className="text-xs text-[#64748b]">Formu dolduran: {RESP[a.respondent] || "—"}</div>
              </Field>
              {answerRows(form, a).filter((r) => (Array.isArray(r.value) ? r.value.length : r.value)).map((r) => (
                <Field key={r.key} label={r.label} wide={r.wide}>{renderValue(r.value)}</Field>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─────────────── Form düzenleyici ───────────────
const newKey = () => `q${Math.random().toString(36).slice(2, 6)}`;
const clone = (x) => JSON.parse(JSON.stringify(x));

function FormEditor({ initial, onSaved }) {
  const [form, setForm] = useState(() => clone(initial));
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);
  const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };

  const patchStep = (si, p) => setForm((f) => ({ ...f, steps: f.steps.map((s, i) => (i === si ? { ...s, ...p } : s)) }));
  const patchQ = (si, qi, p) =>
    patchStep(si, { questions: form.steps[si].questions.map((q, i) => (i === qi ? { ...q, ...p } : q)) });
  const moveIn = (arr, i, d) => {
    const j = i + d;
    if (j < 0 || j >= arr.length) return arr;
    const c = [...arr];
    [c[i], c[j]] = [c[j], c[i]];
    return c;
  };

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const r = await axios.put("/api/admin/onboarding-form", { form }, { headers });
      setForm(clone(r.data.form));
      setMsg({ ok: true, text: "Kaydedildi. Yeni form öğrencilere hemen yansır." });
      onSaved?.(r.data.form);
    } catch (e) {
      setMsg({ ok: false, text: e?.response?.data?.message || "Kaydedilemedi." });
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    if (!window.confirm("Form varsayılan haline dönsün mü? Yaptığın özelleştirmeler silinir (öğrenci cevapları silinmez).")) return;
    try {
      const r = await axios.delete("/api/admin/onboarding-form", { headers });
      setForm(clone(r.data.form));
      onSaved?.(r.data.form);
      setMsg({ ok: true, text: "Varsayılan forma dönüldü." });
    } catch {
      setMsg({ ok: false, text: "Sıfırlanamadı." });
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-[#64748b] m-0">
        Öğrencinin gördüğü tanışma formu. Ad soyad, telefon, öğrenci/veli ve sınav soruları zorunludur ve silinemez (sadece metinleri değişir).
        Zaten cevap vermiş öğrencilerin cevapları korunur.
      </p>

      {form.steps.map((st, si) => (
        <div key={si} className="bg-white border border-[#e5e7eb] rounded-2xl p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="font-bold text-[#1C1B8A]">Adım {si + 1}</div>
            <div className="flex gap-2 text-xs">
              <button disabled={si === 0} onClick={() => setForm((f) => ({ ...f, steps: moveIn(f.steps, si, -1) }))} className="underline disabled:opacity-30 bg-transparent border-0 cursor-pointer">↑ Yukarı</button>
              <button disabled={si === form.steps.length - 1} onClick={() => setForm((f) => ({ ...f, steps: moveIn(f.steps, si, 1) }))} className="underline disabled:opacity-30 bg-transparent border-0 cursor-pointer">↓ Aşağı</button>
              <button
                disabled={form.steps.length === 1 || st.questions.some((q) => CORE.includes(q.key))}
                title={st.questions.some((q) => CORE.includes(q.key)) ? "Zorunlu sorular bu adımda" : ""}
                onClick={() => setForm((f) => ({ ...f, steps: f.steps.filter((_, i) => i !== si) }))}
                className="underline text-[#dc2626] disabled:opacity-30 bg-transparent border-0 cursor-pointer"
              >
                Adımı sil
              </button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 mb-4">
            <Field label="İlerleme başlığı (üstte görünür)"><input className={inputCls} value={st.title} onChange={(e) => patchStep(si, { title: e.target.value })} /></Field>
            <Field label="Ekran başlığı"><input className={inputCls} value={st.heading} onChange={(e) => patchStep(si, { heading: e.target.value })} /></Field>
            <Field label="Açıklama (opsiyonel)" wide><input className={inputCls} value={st.description} onChange={(e) => patchStep(si, { description: e.target.value })} /></Field>
          </div>

          <div className="flex flex-col gap-3">
            {st.questions.map((q, qi) => {
              const core = CORE.includes(q.key);
              const choice = q.type === "single" || q.type === "multi";
              return (
                <div key={qi} className="rounded-xl p-3" style={{ background: "#F8F7FF", border: "1px solid #ECEAF5" }}>
                  <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                    <span className="text-[11px] font-bold text-[#8B87A6]">
                      {TYPE_LABELS[q.type]} · {core ? "zorunlu (sabit)" : `anahtar: ${q.key}`}
                      {q.exam ? ` · sadece ${q.exam}` : ""}
                    </span>
                    <div className="flex gap-2 text-xs">
                      <button disabled={qi === 0} onClick={() => patchStep(si, { questions: moveIn(st.questions, qi, -1) })} className="underline disabled:opacity-30 bg-transparent border-0 cursor-pointer">↑</button>
                      <button disabled={qi === st.questions.length - 1} onClick={() => patchStep(si, { questions: moveIn(st.questions, qi, 1) })} className="underline disabled:opacity-30 bg-transparent border-0 cursor-pointer">↓</button>
                      {!core && (
                        <button onClick={() => patchStep(si, { questions: st.questions.filter((_, i) => i !== qi) })} className="underline text-[#dc2626] bg-transparent border-0 cursor-pointer">Sil</button>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Field label="Soru metni" wide><input className={inputCls} value={q.label} onChange={(e) => patchQ(si, qi, { label: e.target.value })} /></Field>
                    <Field label="Yardımcı metin (opsiyonel)" wide><input className={inputCls} value={q.hint} onChange={(e) => patchQ(si, qi, { hint: e.target.value })} /></Field>
                    {!core && (
                      <>
                        <Field label="Tip">
                          <select className={inputCls} value={q.type} onChange={(e) => patchQ(si, qi, { type: e.target.value, options: q.options })}>
                            {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                          </select>
                        </Field>
                        <Field label="Kime gösterilsin">
                          <select className={inputCls} value={q.exam || ""} onChange={(e) => patchQ(si, qi, { exam: e.target.value || null })}>
                            <option value="">Herkes</option>
                            <option value="YKS">Sadece YKS</option>
                            <option value="LGS">Sadece LGS</option>
                          </select>
                        </Field>
                        <label className="flex items-center gap-2 text-sm text-[#334155]">
                          <input type="checkbox" checked={!!q.required} onChange={(e) => patchQ(si, qi, { required: e.target.checked })} /> Zorunlu
                        </label>
                      </>
                    )}
                    {choice && !core && (
                      <Field label="Seçenekler (her satıra bir tane; “Diğer” yazarsan serbest metin kutusu açılır)" wide>
                        <textarea className={inputCls} rows={Math.min(8, Math.max(3, q.options.length))} value={q.options.join("\n")} onChange={(e) => patchQ(si, qi, { options: e.target.value.split("\n") })} />
                      </Field>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => patchStep(si, { questions: [...st.questions, { key: newKey(), type: "text", label: "Yeni soru", hint: "", required: false, options: [], exam: null }] })}
            className="mt-3 text-sm font-bold underline text-[#1C1B8A] bg-transparent border-0 cursor-pointer p-0"
          >
            + Soru ekle
          </button>
        </div>
      ))}

      <button
        onClick={() => setForm((f) => ({ ...f, steps: [...f.steps, { title: "Yeni Adım", heading: "", description: "", questions: [] }] }))}
        className="self-start text-sm font-bold underline text-[#1C1B8A] bg-transparent border-0 cursor-pointer p-0"
      >
        + Adım ekle
      </button>

      {msg && <p className={`text-sm m-0 ${msg.ok ? "text-[#059669]" : "text-[#dc2626]"}`}>{msg.text}</p>}
      <div className="flex gap-3 flex-wrap">
        <button onClick={save} disabled={saving} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 border-0 cursor-pointer" style={{ background: "#1C1B8A" }}>
          {saving ? "Kaydediliyor…" : "Formu Kaydet"}
        </button>
        <button onClick={reset} className="px-5 py-2.5 rounded-xl text-sm border border-[#e5e7eb] bg-white cursor-pointer">Varsayılana dön</button>
      </div>
    </div>
  );
}

const AdminOnboardingPage = () => {
  const [rows, setRows] = useState(null);
  const [form, setForm] = useState(null);
  const [view, setView] = useState("students");
  const [q, setQ] = useState("");

  useEffect(() => {
    axios
      .get("/api/admin/onboardings", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
      .then((r) => {
        setRows(r.data.onboardings || []);
        setForm(r.data.form);
      })
      .catch(() => setRows([]));
  }, []);

  const term = q.trim().toLowerCase();
  const shown = (rows || []).filter(
    (o) => !term || [o.answers?.fullName, o.user?.name, o.user?.email, o.packageName].some((v) => (v || "").toLowerCase().includes(term))
  );

  return (
    <div className="max-w-[1000px]">
      <h2 className="font-fredoka font-bold text-xl text-[#0f172a] mb-1">Onboarding</h2>
      <div className="flex gap-2 my-3">
        {[["students", "Öğrenciler"], ["form", "Formu Düzenle"]].map(([k, l]) => (
          <button
            key={k}
            onClick={() => setView(k)}
            className="px-4 py-2 rounded-full text-sm font-bold border-0 cursor-pointer"
            style={{ background: view === k ? "#1C1B8A" : "#eef0f4", color: view === k ? "#fff" : "#475569" }}
          >
            {l}
          </button>
        ))}
      </div>

      {view === "form" ? (
        form ? <FormEditor initial={form} onSaved={setForm} /> : <p className="text-sm text-[#94a3b8]">Yükleniyor…</p>
      ) : (
        <>
          <p className="text-sm text-[#64748b] mb-4">Yeni öğrencilerin tanışma formu cevapları ve süreç durumu.</p>
          <input className="w-full max-w-[320px] px-3 py-2.5 rounded-xl border border-[#e5e7eb] outline-none text-sm mb-4" placeholder="Ara: isim, e-posta, paket" value={q} onChange={(e) => setQ(e.target.value)} />
          {rows === null || !form ? (
            <p className="text-sm text-[#94a3b8]">Yükleniyor…</p>
          ) : shown.length === 0 ? (
            <p className="text-sm text-[#94a3b8]">Kayıt yok.</p>
          ) : (
            <div className="flex flex-col gap-3">{shown.map((o) => <Card key={o.id} o={o} form={form} />)}</div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminOnboardingPage;
