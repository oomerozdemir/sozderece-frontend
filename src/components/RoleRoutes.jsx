// src/components/RoleRoute.jsx
import { Navigate } from "react-router-dom";

const RoleRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" />;

  return children;
};

export default RoleRoute;
