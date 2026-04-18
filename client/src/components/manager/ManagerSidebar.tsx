import { NavLink } from "react-router-dom";
import {
  FiBarChart2,
  FiBell,
  FiBookOpen,
  FiBox,
  FiChevronsLeft,
  FiChevronsRight,
  FiCompass,
  FiCreditCard,
  FiDollarSign,
  FiShoppingBag,
  FiTruck,
  FiUserCheck,
  FiUsers,
} from "react-icons/fi";
import useCurrentUser from "../../customhooks/useCurrentUser";
import { useAdminResource } from "../../customhooks/useAdminResource";
import { getMyRestaurant } from "../../services/adminService";

type ManagerSidebarProps = {
  isOpen: boolean;
  isDesktop: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
};

const navItems = [
  { label: "Dashboard", to: "/manager/dashboard", icon: FiCompass },
  { label: "Menu", to: "/manager/menu", icon: FiBookOpen },
  { label: "Orders", to: "/manager/orders", icon: FiShoppingBag },
  { label: "Online Orders", to: "/manager/online-orders", icon: FiTruck },
  { label: "Inventory", to: "/manager/inventory", icon: FiBox },
  { label: "Customers", to: "/manager/customers", icon: FiUsers },
  { label: "Employees", to: "/manager/employees", icon: FiUserCheck },
  { label: "Payroll", to: "/manager/payroll", icon: FiCreditCard },
  { label: "Vendors & Expenses", to: "/manager/expenses", icon: FiDollarSign },
  { label: "Analytics", to: "/manager/analytics", icon: FiBarChart2 },
  { label: "Notifications", to: "/manager/notifications", icon: FiBell },
];

const ManagerSidebar = ({
  isOpen,
  isDesktop,
  onToggle,
  onNavigate,
}: ManagerSidebarProps) => {
  const { user } = useCurrentUser();
  const { data: myRestaurant } = useAdminResource(getMyRestaurant, [
    user?.restaurantId,
  ]);
  const desktopWidthClass = isOpen ? "lg:w-64" : "lg:w-20";
  const hasAssignedRestaurant = Boolean(user?.restaurantId);
  const allowedNavItems = hasAssignedRestaurant ? navItems : [];
  const restaurantDisplayName = myRestaurant?.name || user?.restaurantId?.slice(-6);

  return (
    <aside
      className={`fixed left-0 top-0 z-20 h-screen w-64 border-r border-[#DDE5DE] bg-[#EEF4EF] px-4 py-6 transition-all duration-300 ${desktopWidthClass} ${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      <div
        className={`flex px-2 ${
          isOpen ? "items-center justify-between" : "flex-col items-center gap-3"
        }`}
      >
        <div className={`space-y-1 ${isOpen ? "" : "text-center"}`}>
          {isOpen && (
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#5B7861]">
              Manager Console
            </p>
          )}
          <h1 className="text-xl font-semibold tracking-tight text-[#1F3A25]">
            {isOpen ? "OpsFlow" : "OF"}
          </h1>
        </div>
        <button
          onClick={onToggle}
          className={`rounded-full border border-[#CEDCCF] bg-white/90 px-2 py-1 text-xs text-[#36543C] shadow-sm ${
            isOpen ? "" : "h-9 w-9"
          }`}
          aria-label="Toggle sidebar"
        >
          {isDesktop ? (isOpen ? <FiChevronsLeft /> : <FiChevronsRight />) : <FiChevronsLeft />}
        </button>
      </div>

      <nav className="no-scrollbar mt-6 max-h-[calc(100vh-220px)] space-y-1 overflow-y-auto pr-1">
        {allowedNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-[#1F3A25] text-[#EEF4EF]"
                    : "text-[#36543C] hover:bg-[#DEE9E0] hover:text-[#1F3A25]"
                }`
              }
              title={!isOpen ? item.label : undefined}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-[#1F3A25]">
                <Icon size={16} />
              </span>
              {isOpen && <span>{item.label}</span>}
            </NavLink>
          );
        })}

        {!hasAssignedRestaurant && isOpen && (
          <div className="rounded-xl border border-[#D8E3D9] bg-white/80 px-3 py-2 text-xs text-[#5B7861]">
            No restaurant assigned. Contact admin to enable manager access.
          </div>
        )}
      </nav>

      {isOpen && (
        <div className="mt-6 rounded-2xl border border-[#CEDCCF] bg-white/80 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.2em] text-[#5B7861]">Role</p>
          <p className="text-sm font-semibold text-[#1F3A25]">Manager</p>
          {user?.restaurantId ? (
            <p className="mt-1 text-xs text-[#5B7861]">
              Restaurant: {restaurantDisplayName}
            </p>
          ) : (
            <p className="mt-1 text-xs text-[#9B3F2C]">Restaurant not assigned</p>
          )}
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-[#5B7861]">
            <FiBarChart2 className="h-3.5 w-3.5" />
            Performance View
          </p>
        </div>
      )}
    </aside>
  );
};

export default ManagerSidebar;
