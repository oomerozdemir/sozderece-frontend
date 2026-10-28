import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "../../../../utils/axios";
import { playLevelUpSound } from "../../../../utils/sound";

// "Bugünkü Rotam" state makinesi — hem HaftalikProgram.jsx (Programım) hem
// GenelBakis.jsx (Genel Bakış) aynı günü, aynı pomodoro/durum mantığıyla
// gösterebilsin diye tek yerden paylaşılıyor. İki ekran da aynı anda monte
// olmaz (tab mimarisi), bu yüzden ikisinin kendi state kopyası olması —
// bayat veri göstermemeleri için — kasıtlı; yalnızca DAVRANIŞ (endpoint'ler,
// sıralama, yan etkiler) tek kaynaktan geliyor.
export default function useTodayTasks() {
  const [today, setToday] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState(null); // {id, studyPlanItemId, startedAt}
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [feelingPromptId, setFeelingPromptId] = useState(null);
  const [reasonPromptId, setReasonPromptId] = useState(null);
  const hydratedRef = useRef(false);
  const prevReportIdRef = useRef(undefined);

  const token = useMemo(() => localStorage.getItem("token"), []);
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const loadToday = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/v1/ogrenci/me/today", { headers });
      setToday(data || null);
    } catch {
      setToday(null);
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    loadToday();
  }, [loadToday]);

  // Sayfa yenilendiğinde sunucudaki aktif turu bir kereliğine devral.
  useEffect(() => {
    if (hydratedRef.current || loading) return;
    hydratedRef.current = true;
    if (today?.activePomodoro) setActiveSession(today.activePomodoro);
  }, [loading, today]);

  // Açık uçlu (yukarı sayan) kronometre — 25dk'lık zorunlu bir tur değil,
  // öğrenci "Bitir"e basana kadar sayar.
  useEffect(() => {
    if (!activeSession) return;
    const tick = () => setElapsedSeconds(Math.max(0, Math.floor((Date.now() - new Date(activeSession.startedAt).getTime()) / 1000)));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [activeSession]);

  // Z-Raporu ilk kez bu oturumda belirdiğinde ("günü bitirdin" anı) zafer sesi çalar.
  useEffect(() => {
    const reportId = today?.report?.id ?? null;
    if (prevReportIdRef.current !== undefined && prevReportIdRef.current === null && reportId !== null) {
      playLevelUpSound();
    }
    prevReportIdRef.current = reportId;
  }, [today?.report?.id]);

  const handleStart = async (item) => {
    if (activeSession) return;
    try {
      const { data } = await axios.post("/api/v1/ogrenci/me/pomodoro/start", { studyPlanItemId: item.id }, { headers });
      setActiveSession(data.session);
    } catch {
      // sessizce yut
    }
  };

  const handleCancelActive = async () => {
    const id = activeSession?.id;
    setActiveSession(null);
    if (id) {
      try {
        await axios.patch(`/api/v1/ogrenci/me/pomodoro/${id}/stop`, { completed: false }, { headers });
      } catch {
        // sessizce yut
      } finally {
        loadToday();
      }
    }
  };

  const handleFinishActive = async (item) => {
    const id = activeSession?.id;
    setActiveSession(null);
    if (id) {
      try {
        await axios.patch(`/api/v1/ogrenci/me/pomodoro/${id}/stop`, { completed: true }, { headers });
      } catch {
        // sessizce yut
      }
    }
    setFeelingPromptId(item.id);
  };

  const handleDirectComplete = (item) => setFeelingPromptId(item.id);

  // İyimser güncelleme + gerçek veriyi (Z-Raporu oluşmuş olabilir) tekrar çek.
  const setStatus = async (itemId, status, extra = {}) => {
    setToday((prev) => (prev ? { ...prev, items: prev.items.map((it) => (it.id === itemId ? { ...it, status, ...extra } : it)) } : prev));
    try {
      await axios.patch(`/api/v1/ogrenci/me/study-plan/items/${itemId}/status`, { status, ...extra }, { headers });
    } catch {
      // sessizce yut, aşağıdaki refetch gerçek durumu geri getirir
    } finally {
      loadToday();
    }
  };

  const handleSubmitFeeling = (item, feeling, note) => {
    setFeelingPromptId(null);
    setStatus(item.id, "done", { feeling, note: note?.trim() || undefined });
  };
  const handleSkipFeeling = (item) => {
    setFeelingPromptId(null);
    setStatus(item.id, "done", {});
  };

  const handleOpenReason = (item) => setReasonPromptId(item.id);
  const handleCancelReason = () => setReasonPromptId(null);
  const handleSubmitReason = (item, reason, note) => {
    setReasonPromptId(null);
    setStatus(item.id, "stuck", { notCompletedReason: reason, note: note?.trim() || undefined });
  };

  return {
    today, loading, headers,
    activeSession, elapsedSeconds,
    feelingPromptId, reasonPromptId,
    loadToday,
    handleStart, handleCancelActive, handleFinishActive, handleDirectComplete,
    handleSubmitFeeling, handleSkipFeeling,
    handleOpenReason, handleCancelReason, handleSubmitReason,
  };
}
