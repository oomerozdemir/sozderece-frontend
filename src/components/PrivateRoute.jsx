import { Navigate, useLocation } from "react-router-dom";
import { isTokenValid } from "../utils/auth";

export default function PrivateRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("token");

  // Token yoksa veya süresi bittiyse -> login'e
  if (!isTokenValid(token)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
