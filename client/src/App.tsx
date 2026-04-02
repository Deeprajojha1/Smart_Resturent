import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import { Navigate } from "react-router-dom";
import ProtectedRoute from "./customhooks/ProtectedRoute";
import useCurrentUser from "./customhooks/useCurrentUser";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import CashierPOS from "./pages/cashier/CashierPOS";
import InventoryDashboard from "./pages/inventory/InventoryDashboard";
import VendorPortal from "./pages/vendor/VendorPortal";

const roleToPath = {
  admin: "/admin",
  manager: "/manager",
  cashier: "/cashier",
  inventory: "/inventory",
  vendor: "/vendor",
} as const;

const HomeRoute = () => {
  const { user, loading } = useCurrentUser();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user?.role && roleToPath[user.role]) {
    return <Navigate to={roleToPath[user.role]} replace />;
  }

  return <LandingPage />;
};

const LoginRoute = () => {
  const { user, loading } = useCurrentUser();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user?.role && roleToPath[user.role]) {
    return <Navigate to={roleToPath[user.role]} replace />;
  }

  return <LoginPage />;
};

const App = () => {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/authUser" element={<LoginRoute />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager"
          element={
            <ProtectedRoute allowedRoles={["manager", "admin"]}>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cashier"
          element={
            <ProtectedRoute allowedRoles={["cashier", "admin"]}>
              <CashierPOS />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute allowedRoles={["inventory", "admin"]}>
              <InventoryDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor"
          element={
            <ProtectedRoute allowedRoles={["vendor", "admin"]}>
              <VendorPortal />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

export default App;
