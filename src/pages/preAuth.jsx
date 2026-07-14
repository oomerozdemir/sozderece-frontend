import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Eski /pre-auth linkleri (reklam/e-posta kampanyaları, yer imleri) kırılmasın
// diye tutulan yönlendirme kabuğu — gerçek paket satın alma akışı artık
// /hemen-basla sihirbazında (Alan → Paket → Ödeme, misafir-öncelikli).
export default function PreCartAuth() {
  const navigate = useNavigate();
  const { search } = useLocation();

  useEffect(() => {
    navigate(`/hemen-basla${search}`, { replace: true });
  }, [navigate, search]);

  return null;
}
