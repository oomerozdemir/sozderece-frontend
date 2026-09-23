import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { scrollToId } from "../utils/scrollToId";

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    // "/#paketler" gibi bir bağlantıyla başka sayfadan gelindiğinde hedef bölüm
    // (lazy yüklenen sayfa içinde) birkaç yüz ms sonra mount oluyor — kısa süre dene.
    const id = hash.slice(1);
    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      if (scrollToId(id) || tries > 20) clearInterval(timer);
    }, 100);
    return () => clearInterval(timer);
  }, [pathname, hash]);

  return null;
}
