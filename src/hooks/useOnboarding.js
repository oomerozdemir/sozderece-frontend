import { useCallback, useEffect, useState } from "react";
import axios from "../utils/axios";

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

// Kullanıcının kendi onboarding kaydı (sunucuda token'dan çözülür — başka
// kullanıcının verisine erişim yok). data: { onboarding, prefill } | null
// skip=true iken (ör. admin önizleme modu) hiç istek atmaz.
export default function useOnboarding(skip = false) {
  const [state, setState] = useState({ loading: !skip, data: null, error: false });

  const load = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/onboarding/me", { headers: authHeaders() });
      setState({ loading: false, data, error: false });
    } catch {
      setState({ loading: false, data: null, error: true });
    }
  }, []);

  useEffect(() => {
    if (!skip) load();
  }, [skip, load]);

  return { ...state, reload: load };
}

export const saveOnboarding = (step, answers) =>
  axios.put("/api/onboarding/me", { step, answers }, { headers: authHeaders() });

export const completeOnboardingForm = (answers) =>
  axios.post("/api/onboarding/me/complete", { answers }, { headers: authHeaders() });

export const saveProcessStep = (step) =>
  axios.put("/api/onboarding/me/process", { step }, { headers: authHeaders() });

export const completeProcessIntro = () =>
  axios.post("/api/onboarding/me/process/complete", {}, { headers: authHeaders() });
