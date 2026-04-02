import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import useCurrentUser from "./useCurrentUser";

type ProtectedRouteProps = {
  allowedRoles: Array<"cashier" | "manager" | "admin" | "inventory" | "vendor">;
  children: ReactNode;
};

const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
  const { user, loading } = useCurrentUser();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/authUser" replace />;
  }

  if (user.role && !allowedRoles.includes(user.role)) {
    return <div>Unauthorized</div>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
