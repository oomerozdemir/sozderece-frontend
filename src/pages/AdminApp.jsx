import AdminDashboard from "../components/AdminDashboard";
import Seo from "../components/Seo";

// Daha önce burada react-admin'in <Admin> bileşeni sadece bir "dashboard
// konteyneri" olarak kullanılıyordu (gerçek Resource/dataProvider akışı hiç
// yoktu). react-admin v5, hiç <Resource>/<CustomRoutes> child'ı olmayan bir
// <Admin>'i "boş" (status: "empty") sayıp `dashboard` prop'unu HİÇ render
// etmeden kendi varsayılan "Ready" ekranını gösteriyor — bu ekran production
// build'de tamamen boş bir <span></span> olarak render oluyor (bkz.
// ra-core/util/Ready.js), yani admin paneli sessizce boş/siyah bir ekrana
// düşüyordu. AdminDashboard zaten kendi axios çağrılarını kullanıyor,
// react-admin'in hiçbir hook/context'ine ihtiyacı yok — o yüzden <Admin>
// sarmalayıcısı tamamen kaldırıldı.
const AdminApp = () => {
  return (
    <>
      <Seo noindex />
      <AdminDashboard />
    </>
  );
};

export default AdminApp;
