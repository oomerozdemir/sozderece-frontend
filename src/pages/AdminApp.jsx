import { Admin } from "react-admin";
import simpleRestProvider from "ra-data-simple-rest";
import AdminDashboard from "../components/AdminDashboard";
import Seo from "../components/Seo";

// react-admin sadece burada "dashboard" konteyneri olarak kullanılıyor —
// önceden burada ayrıca bir <Resource name="users" .../> vardı
// (UserList/CreateUser/EditUser.jsx), backend'imizin desteklemediği bir REST
// sözleşmesi (ra-data-simple-rest) bekliyordu ve muhtemelen hiç çalışmıyordu.
// AdminDashboard'un kendi "Kullanıcılar" sekmesi zaten aynı işi görüyor,
// o yüzden kaldırıldı.
const dataProvider = simpleRestProvider(`${process.env.REACT_APP_API_URL}/api`);

const AdminApp = () => {
  return (
    <>
      <Seo noindex />
      <Admin dashboard={AdminDashboard} dataProvider={dataProvider} />
    </>
  );
};

export default AdminApp;
