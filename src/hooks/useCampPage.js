import { useState, useEffect } from "react";
import axios from "../utils/axios";

export default function useCampPage() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/camp-page")
      .then((r) => setContent(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { content, loading };
}
