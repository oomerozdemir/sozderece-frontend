import { forwardRef } from "react";

// Board'un tek bir gün kolonu — saf/sunum amaçlı. Düzenleme/satır mantığı
// (editingIdx, updateRow, vb.) ProgramTab.jsx'te AYNEN kalıyor, bu bileşen
// sadece hazır bir `renderRow` fonksiyonunu çağırıp çerçeveyi (başlık,
// sayaç, + Görev Ekle, kart listesi) sağlıyor — kanban+haftalık planlayıcı
// hissi için desktop'ta grid hücresi, dar ekranda yatay kaydırmalı şeridin
// bir kartı olarak render edilir (bkz. ProgramTab.jsx'teki sarmalayıcı).
const DayColumn = forwardRef(function DayColumn({ label, count, rows, renderRow, onAddRow, highlight = false }, ref) {
  return (
    <div
      ref={ref}
      className="flex flex-col bg-white rounded-2xl border p-3.5 snap-center"
      style={{
        borderColor: highlight ? "#fecaca" : "#f1f5f9",
        background: highlight ? "#fef2f2" : "#fff",
      }}
    >
      <div className="flex items-center justify-between mb-2.5 gap-2">
        <p className="text-xs font-black uppercase truncate" style={{ color: highlight ? "#dc2626" : "#17252D" }}>
          {label} <span className="font-bold normal-case text-[#94a3b8]">· {count} görev</span>
        </p>
        {onAddRow && (
          <button onClick={onAddRow} className="flex-shrink-0 text-[11px] font-bold" style={{ color: "#0E7C88" }}>
            + Görev Ekle
          </button>
        )}
      </div>
      {rows.length === 0 ? (
        <p className="text-xs text-[#94a3b8]">Henüz görev yok.</p>
      ) : (
        <div className="space-y-1.5">{rows.map(renderRow)}</div>
      )}
    </div>
  );
});

export default DayColumn;
