import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import { Navigate } from "react-router-dom";
import ProtectedRoute from "./customhooks/ProtectedRoute";
import useCurrentUser from "./customhooks/useCurrentUser";
import AdminLayout from "./components/admin/AdminLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import RestaurantsPage from "./pages/admin/RestaurantsPage";
import MenuPage from "./pages/admin/MenuPage";
import OrdersPage from "./pages/admin/OrdersPage";
import OnlineOrdersPage from "./pages/admin/OnlineOrdersPage";
import InventoryPage from "./pages/admin/InventoryPage";
import CustomersPage from "./pages/admin/CustomersPage";
import EmployeesPage from "./pages/admin/EmployeesPage";
import PayrollPage from "./pages/admin/PayrollPage";
import ExpensesPage from "./pages/admin/ExpensesPage";
import AnalyticsPage from "./pages/admin/AnalyticsPage";
import AIInsightsPage from "./pages/admin/AIInsightsPage";
import NotificationsPage from "./pages/admin/NotificationsPage";
import SettingsPage from "./pages/admin/SettingsPage";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import CashierPOS from "./pages/cashier/CashierPOS";
import InventoryDashboard from "./pages/inventory/InventoryDashboard";
import VendorPortal from "./pages/vendor/VendorPortal";
import ThreeDotsLoader from "./components/common/ThreeDotsLoader";

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
    return <ThreeDotsLoader fullScreen />;
  }

  if (user?.role && roleToPath[user.role]) {
    return <Navigate to={roleToPath[user.role]} replace />;
  }

  return <LandingPage />;
};

const LoginRoute = () => {
  const { user, loading } = useCurrentUser();

  if (loading) {
    return <ThreeDotsLoader fullScreen />;
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
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="restaurants" element={<RestaurantsPage />} />
          <Route path="menu" element={<MenuPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="online-orders" element={<OnlineOrdersPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="payroll" element={<PayrollPage />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="ai-insights" element={<AIInsightsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
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
