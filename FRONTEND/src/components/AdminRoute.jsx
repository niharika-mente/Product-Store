import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("authToken");
  if (!token) return <Navigate to="/login" replace />;

  try {
    const user = JSON.parse(localStorage.getItem("authUser") || "{}");
    if (user?.role !== "admin") return <Navigate to="/" replace />;
  } catch {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AdminRoute;
