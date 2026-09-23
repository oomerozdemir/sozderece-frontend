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

const RESP = { ogrenci: "Öğrenci", veli: "Veli" };

function Section({ title, children }) {
  return (
    <div>
      <div className="text-[11px] font-bold uppercase text-[#94a3b8] mb-1" style={{ letterSpacing: 1 }}>{title}</div>
      <div className="text-sm text-[#0f172a]">{children}</div>
    </div>
  );
}

const List = ({ items }) =>
  items && items.length ? (
    <ul className="m-0 pl-4 list-disc">{items.map((x) => <li key={x}>{x}</li>)}</ul>
  ) : (
    <span className="text-[#94a3b8]">—</span>
  );

function Card({ o }) {
  const [open, setOpen] = useState(false);
  const a = o.answers || {};
  const idx = stageIdx(o.stage);
  const done = idx >= stageIdx("introduction_form_completed");

  const headline = [a.exam, a.field, a.grade].filter(Boolean).join(" · ");
  const challenges = [...(a.challenges || []).filter((c) => c !== "Diğer"), ...(a.challengesOther ? [a.challengesOther] : [])];

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
              <span
                key={m.label}
                className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: ok ? "#dcfce7" : "#f1f5f9", color: ok ? "#166534" : "#94a3b8" }}
              >
                {ok ? "✓" : "○"} {m.label}
              </span>
            );
          })}
        </div>
      </div>

      {done || Object.keys(a).length > 0 ? (
        <>
          <button onClick={() => setOpen((v) => !v)} className="mt-3 text-xs font-bold underline text-[#1C1B8A] bg-transparent border-0 cursor-pointer p-0">
            {open ? "Cevapları gizle" : "Cevapları gör"}
          </button>
          {open && (
            <div className="grid gap-4 mt-4 sm:grid-cols-2">
              <Section title="İletişim">
                {a.phone || o.user?.phone || "—"} · {o.user?.email}
                <div className="text-xs text-[#64748b]">Formu dolduran: {RESP[a.respondent] || "—"}</div>
              </Section>
              <Section title="Hedef">
                {a.targetSchool || "—"}
                {a.targetRank && <div className="text-xs text-[#64748b]">{a.targetRank}</div>}
              </Section>
              <Section title="Çalışma düzeni">{a.routine || "—"}</Section>
              <Section title="Günlük çalışma">{a.dailyHours || "—"}</Section>
              <Section title="Ana sorunlar"><List items={challenges} /></Section>
              <Section title="Koçluktan beklentileri"><List items={a.supports} /></Section>
              {a.lastExam && <Section title="Son deneme">{a.lastExam}</Section>}
              {a.note && (
                <div className="sm:col-span-2">
                  <Section title="Öğrenci notu">"{a.note}"</Section>
                </div>
              )}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}

const AdminOnboardingPage = () => {
  const [rows, setRows] = useState(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    axios
      .get("/api/admin/onboardings", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
      .then((r) => setRows(r.data.onboardings || []))
      .catch(() => setRows([]));
  }, []);

  const term = q.trim().toLowerCase();
  const shown = (rows || []).filter(
    (o) => !term || [o.answers?.fullName, o.user?.name, o.user?.email, o.packageName].some((v) => (v || "").toLowerCase().includes(term))
  );

  return (
    <div className="max-w-[1000px]">
      <h2 className="font-fredoka font-bold text-xl text-[#0f172a] mb-1">Onboarding</h2>
      <p className="text-sm text-[#64748b] mb-4">Yeni öğrencilerin tanışma formu cevapları ve süreç durumu.</p>
      <input
        className="w-full max-w-[320px] px-3 py-2.5 rounded-xl border border-[#e5e7eb] outline-none text-sm mb-4"
        placeholder="Ara: isim, e-posta, paket"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {rows === null ? (
        <p className="text-sm text-[#94a3b8]">Yükleniyor…</p>
      ) : shown.length === 0 ? (
        <p className="text-sm text-[#94a3b8]">Kayıt yok.</p>
      ) : (
        <div className="flex flex-col gap-3">{shown.map((o) => <Card key={o.id} o={o} />)}</div>
      )}
    </div>
  );
};

export default AdminOnboardingPage;
