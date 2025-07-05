import { Admin, Resource} from "react-admin";
import simpleRestProvider from "ra-data-simple-rest";
import { UserList } from "../components/UserList";
import { CreateUser } from "../components/CreateUser";
import { EditUser } from "../components/EditUser";
import AdminDashboard from "../components/AdminDashboard";

const dataProvider = simpleRestProvider(`${process.env.REACT_APP_API_URL}/api`);


const AdminApp = () => {
  return (
    <Admin dashboard={AdminDashboard} dataProvider={dataProvider}>
      <Resource name="users" list={UserList} create={CreateUser} edit={EditUser} />
    </Admin>
  );
};

export default AdminApp;
