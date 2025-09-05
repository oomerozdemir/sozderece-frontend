// src/hooks/useTeacherScheduling.js
import { useEffect, useState, useCallback } from "react";
import axios from "../utils/axios";

export default function useTeacherScheduling(onMessage) {
  const [avail, setAvail] = useState({
    timeZone: "Europe/Istanbul",
    items: Array.from({ length: 7 }, (_, i) => ({
      weekday: i,            // 0..6
      startMin: 9 * 60,
      endMin: 17 * 60,
      mode: "BOTH",
      isActive: i > 0 && i < 6,
    })),
  });

  const [slots, setSlots] = useState([]);         // müsait slotlar
  const [confirmed, setConfirmed] = useState([]); // onaylı randevular (takvimde yeşil)
  const [range, setRange] = useState({ from: "", to: "" });
  const [timeOffs, setTimeOffs] = useState([]);
  const [creatingOff, setCreatingOff] = useState({ startsAt: "", endsAt: "", reason: "" });

  // init: uygunluk + timeoff
  useEffect(() => {
    (async () => {
      try {
        const a = await axios.get("/api/v1/ogretmen/me/availability");
        if (a?.data?.items) {
          setAvail({
            timeZone: a.data.timeZone || "Europe/Istanbul",
            items: a.data.items,
          });
        }
      } catch {}

      try {
        const t = await axios.get("/api/v1/ogretmen/me/timeoff");
        setTimeOffs(t?.data?.items || []);
      } catch {}
    })();
  }, []);

  // helpers
  const minToStr = (m) =>
    `${String(Math.floor(m / 60)).padStart(2,"0")}:${String(m % 60).padStart(2,"0")}`;
  const strToMin = (s) => {
    const [h, mm] = String(s || "").split(":");
    return Number(h) * 60 + Number(mm);
  };

  const onAvailChange = (weekday, field, val) => {
    setAvail((a) => {
      const items = a.items.slice();
      const idx = items.findIndex((x) => x.weekday === weekday);
      if (idx === -1) {
        items.push({ weekday, startMin: 9*60, endMin: 17*60, mode: "BOTH", isActive: true, [field]: val });
      } else {
        items[idx] = { ...items[idx], [field]: val };
      }
      return { ...a, items };
    });
  };

  // actions
  const saveAvailability = async () => {
    try {
      await axios.put("/api/v1/ogretmen/me/availability", avail);
      onMessage?.("Uygunluk kaydedildi.");
    } catch {
      onMessage?.("Uygunluk kaydedilemedi.");
    }
  };

  // 🔑 Tek çağrı: slots + confirmed birlikte gelir
  const fetchSlots = useCallback(async () => {
    if (!range.from || !range.to) return;
    try {
      const { data } = await axios.get("/api/v1/ogretmen/me/slots", {
        params: {
          from: range.from,
          to: range.to,
          tz: avail.timeZone || "Europe/Istanbul",
          mode: "BOTH",
          duration: 60,
        },
      });
      setSlots(data?.slots || []);
      setConfirmed(data?.confirmed || []); // backend bu alanı sağlamalı
    } catch {
      onMessage?.("Slotlar alınamadı.");
    }
  }, [range.from, range.to, avail.timeZone, onMessage]);

  const addTimeOff = async () => {
    try {
      await axios.post("/api/v1/ogretmen/me/timeoff", creatingOff);
      const { data } = await axios.get("/api/v1/ogretmen/me/timeoff");
      setTimeOffs(data?.items || []);
      setCreatingOff({ startsAt: "", endsAt: "", reason: "" });
      onMessage?.("Tatil/blokaj eklendi.");
    } catch {
      onMessage?.("Tatil/blokaj eklenemedi.");
    }
  };

  const delTimeOff = async (id) => {
    try {
      await axios.delete(`/api/v1/ogretmen/me/timeoff/${id}`);
      setTimeOffs((s) => s.filter((x) => x.id !== id));
      onMessage?.("Blokaj kaldırıldı.");
    } catch {
      onMessage?.("Silinemedi.");
    }
  };

  return {
    // state
    avail, setAvail,
    slots, setSlots,
    confirmed, setConfirmed,
    range, setRange,
    timeOffs, setTimeOffs,
    creatingOff, setCreatingOff,
    // helpers
    minToStr, strToMin, onAvailChange,
    // actions
    saveAvailability, fetchSlots, addTimeOff, delTimeOff,
  };
}
