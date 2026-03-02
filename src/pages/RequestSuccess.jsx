import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function RequestSuccess() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("lastRequestSummary");
      if (raw) setSummary(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const ids = Array.isArray(summary?.requestIds) ? summary.requestIds : [];
  const count = ids.length || 1;

  return (
    <div className="max-w-2xl mx-auto mt-7 px-4 pb-10">
      <div className="border border-gray-200 rounded-2xl p-6 bg-white text-center">
        <div className="text-5xl mb-2">🎉</div>
        <h1>Talebiniz oluşturuldu!</h1>
        <p>
          {count} ders saati için talebiniz öğretmene iletildi.
          {summary?.teacherName ? <> <b>{summary.teacherName}</b> öğretmenle</> : null} en kısa sürede eşleşeceksiniz.
        </p>

        {summary?.slots?.length ? (
          <div className="text-left mt-3 mx-auto max-w-[560px]">
            <div className="font-bold mb-1.5">Seçtiğiniz saatler:</div>
            <ul className="pl-4 mt-0">
              {summary.slots.map((s, i) => (
                <li key={i}>
                  {new Date(s.start).toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" })} – {s.mode === "FACE_TO_FACE" ? "Yüz yüze" : "Online"}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="flex gap-2.5 justify-center mt-4">
          <Link
            to="/student/dashboard"
            className="px-3.5 py-2.5 rounded-xl bg-green-50 text-emerald-900 border border-green-200 no-underline font-semibold"
          >
            Taleplerimi Gör
          </Link>
          <Link
            to="/orders"
            className="px-3.5 py-2.5 rounded-xl bg-gray-100 text-gray-900 border border-gray-200 no-underline"
          >
            Siparişlerim
          </Link>
        </div>
      </div>
    </div>
  );
}
