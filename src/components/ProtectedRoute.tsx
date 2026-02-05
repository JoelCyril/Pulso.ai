import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  let currentUser;
  try {
    const storedUser = localStorage.getItem("currentUser");
    currentUser = storedUser ? JSON.parse(storedUser) : {};
  } catch (e) {
    currentUser = {};
  }

  if (!currentUser?.id) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
