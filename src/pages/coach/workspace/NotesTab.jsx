import { useEffect, useMemo, useRef, useState } from "react";
import { FaExclamationTriangle, FaMicrophone, FaStop, FaPaperPlane, FaVolumeUp, FaTrash } from "react-icons/fa";
import axios from "../../../utils/axios";

const inputCls =
  "w-full py-2.5 px-3 border border-[#e2e8f0] rounded-lg text-sm bg-white outline-none focus:border-page-navy transition-colors";

const isTodayIso = (iso) => {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
};

// Notlar sekmesi — StudentPanelEditor.jsx'in "not" sekmesinden (metin +
// sesli not, MediaRecorder) kopyala-sonra-stillendir taşındı. Backend
// endpoint'lerine (notes, notes/text, notes/audio) dokunulmadı.
export default function NotesTab({ student }) {
  const token = useMemo(() => localStorage.getItem("token"), []);
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const [noteHistory, setNoteHistory] = useState([]);
  const [noteHistoryLoading, setNoteHistoryLoading] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteSending, setNoteSending] = useState(false);
  const [noteMsg, setNoteMsg] = useState("");
  const [recState, setRecState] = useState("idle");
  const [recSeconds, setRecSeconds] = useState(0);
  const [recBlobUrl, setRecBlobUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const recChunksRef = useRef([]);
  const recTimerRef = useRef(null);
  const recBlobRef = useRef(null);

  const loadNoteHistory = () => {
    setNoteHistoryLoading(true);
    axios
      .get(`/api/coach/students/${student.id}/notes`, authHeaders)
      .then((res) => setNoteHistory(res.data?.notes || []))
      .catch(() => {})
      .finally(() => setNoteHistoryLoading(false));
  };

  useEffect(() => {
    loadNoteHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student.id]);

  useEffect(() => () => clearInterval(recTimerRef.current), []);

  const sendTextNote = async () => {
    if (!noteText.trim()) return;
    setNoteSending(true);
    setNoteMsg("");
    try {
      await axios.post(`/api/coach/students/${student.id}/notes/text`, { text: noteText.trim() }, authHeaders);
      setNoteText("");
      setNoteMsg("Not gönderildi ✓");
      loadNoteHistory();
    } catch {
      setNoteMsg("Gönderilemedi, tekrar dene.");
    } finally {
      setNoteSending(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recChunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) recChunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(recChunksRef.current, { type: recorder.mimeType || "audio/webm" });
        recBlobRef.current = blob;
        setRecBlobUrl(URL.createObjectURL(blob));
        setRecState("preview");
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecState("recording");
      setRecSeconds(0);
      recTimerRef.current = setInterval(() => setRecSeconds((s) => s + 1), 1000);
    } catch {
      setNoteMsg("Mikrofon izni alınamadı.");
    }
  };

  const stopRecording = () => {
    clearInterval(recTimerRef.current);
    mediaRecorderRef.current?.stop();
  };

  const discardRecording = () => {
    setRecState("idle");
    setRecBlobUrl(null);
    recBlobRef.current = null;
    setRecSeconds(0);
  };

  const sendAudioNote = async () => {
    if (!recBlobRef.current) return;
    setNoteSending(true);
    setNoteMsg("");
    try {
      const form = new FormData();
      form.append("audio", recBlobRef.current, "note.webm");
      await axios.post(`/api/coach/students/${student.id}/notes/audio`, form, authHeaders);
      discardRecording();
      setNoteMsg("Sesli not gönderildi ✓");
      loadNoteHistory();
    } catch {
      setNoteMsg("Gönderilemedi, tekrar dene.");
    } finally {
      setNoteSending(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#f1f5f9] p-5 space-y-4">
      <p className="text-xs text-[#64748b]">
        Panelin en üstünde, her sekmede sabit görünen kısa bir günlük mesaj — "abla/abin"in orada olduğunu hissettirir.
      </p>

      {!noteHistoryLoading && !noteHistory.some((n) => isTodayIso(n.createdAt)) && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5">
          <FaExclamationTriangle className="text-amber-500 flex-shrink-0" size={13} />
          <p className="text-xs font-bold text-amber-800">Bugün henüz bir not bırakmadın.</p>
        </div>
      )}

      <div>
        <p className="text-xs font-bold text-[#475569] mb-1.5">Yazılı Not</p>
        <textarea
          className={`${inputCls} resize-none`}
          rows={3}
          maxLength={1000}
          placeholder="Örn: Bugün harikaydın, aynen devam! 💪"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
        />
        <button
          onClick={sendTextNote}
          disabled={noteSending || !noteText.trim()}
          className="mt-2 flex items-center gap-1.5 px-4 py-2 bg-brand-navy text-white rounded-lg text-xs font-black disabled:opacity-60"
        >
          <FaPaperPlane size={10} /> {noteSending ? "Gönderiliyor…" : "Yazılı Not Gönder"}
        </button>
      </div>

      <div className="pt-3 border-t border-[#f1f5f9]">
        <p className="text-xs font-bold text-[#475569] mb-1.5">Sesli Not (~10sn)</p>
        {recState === "idle" && (
          <button onClick={startRecording} className="flex items-center gap-1.5 px-4 py-2 bg-[#fef2f2] text-[#dc2626] border border-[#fecaca] rounded-lg text-xs font-black">
            <FaMicrophone size={11} /> Kaydı Başlat
          </button>
        )}
        {recState === "recording" && (
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs font-black text-[#dc2626]">
              <span className="w-2 h-2 rounded-full bg-[#dc2626] animate-pulse" /> Kaydediliyor… {recSeconds}sn
            </span>
            <button onClick={stopRecording} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0f172a] text-white rounded-lg text-xs font-black">
              <FaStop size={10} /> Durdur
            </button>
          </div>
        )}
        {recState === "preview" && recBlobUrl && (
          <div className="flex items-center gap-2 flex-wrap">
            <audio controls src={recBlobUrl} className="h-9" />
            <button onClick={sendAudioNote} disabled={noteSending} className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-navy text-white rounded-lg text-xs font-black disabled:opacity-60">
              <FaPaperPlane size={10} /> {noteSending ? "Gönderiliyor…" : "Gönder"}
            </button>
            <button onClick={discardRecording} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f1f5f9] text-[#64748b] rounded-lg text-xs font-black">
              <FaTrash size={10} /> Sil, Tekrar Kaydet
            </button>
          </div>
        )}
      </div>

      {noteMsg && <p className="text-xs font-bold text-[#059669]">{noteMsg}</p>}

      <div className="pt-3 border-t border-[#f1f5f9]">
        <p className="text-xs font-bold text-[#475569] mb-2">Geçmiş Notlar</p>
        {noteHistoryLoading ? (
          <p className="text-xs text-[#94a3b8]">Yükleniyor…</p>
        ) : noteHistory.length === 0 ? (
          <p className="text-xs text-[#94a3b8]">Henüz not bırakılmadı.</p>
        ) : (
          <div className="space-y-1.5 max-h-[280px] overflow-y-auto">
            {noteHistory.map((n) => (
              <div key={n.id} className="bg-[#f8fafc] rounded-lg px-3 py-2.5">
                <p className="text-[11px] text-[#94a3b8] mb-1">{new Date(n.createdAt).toLocaleString("tr-TR")}</p>
                {n.type === "text" ? (
                  <p className="text-xs text-[#334155]">{n.text}</p>
                ) : (
                  <div className="flex items-center gap-2">
                    <FaVolumeUp className="text-page-navy flex-shrink-0" size={12} />
                    <audio controls src={n.audioUrl} className="h-8" style={{ maxWidth: 260 }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
