// src/components/RequireTeacher.jsx
import RequireAuth from "./RequireAuth";
import RoleRoute from "./RoleRoutes";

export default function RequireTeacher({ children }) {
  return (
    <RequireAuth redirectTo="/ogretmen/giris">
      <RoleRoute allowedRoles={["teacher"]} redirectTo="/ogretmen/giris">
        {children}
      </RoleRoute>
    </RequireAuth>
  );
}
