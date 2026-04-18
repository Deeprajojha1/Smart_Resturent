import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiGrid,
  FiBookOpen,
  FiShoppingBag,
  FiTruck,
  FiBox,
  FiUsers,
  FiUserCheck,
  FiCreditCard,
  FiDollarSign,
  FiBarChart2,
  FiCpu,
  FiBell,
  FiSettings,
  FiChevronsLeft,
  FiChevronsRight,
} from "react-icons/fi";

type SidebarProps = {
  isOpen: boolean;
  isDesktop: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
};

const navItems = [
  { label: "Dashboard", to: "/admin/dashboard", icon: FiHome },
  { label: "Restaurants", to: "/admin/restaurants", icon: FiGrid },
  { label: "Menu", to: "/admin/menu", icon: FiBookOpen },
  { label: "Orders", to: "/admin/orders", icon: FiShoppingBag },
  { label: "Online Orders", to: "/admin/online-orders", icon: FiTruck },
  { label: "Inventory", to: "/admin/inventory", icon: FiBox },
  { label: "Customers", to: "/admin/customers", icon: FiUsers },
  { label: "Employees", to: "/admin/employees", icon: FiUserCheck },
  { label: "Payroll", to: "/admin/payroll", icon: FiCreditCard },
  { label: "Expenses", to: "/admin/expenses", icon: FiDollarSign },
  { label: "Analytics", to: "/admin/analytics", icon: FiBarChart2 },
  { label: "AI Insights", to: "/admin/ai-insights", icon: FiCpu },
  { label: "Notifications", to: "/admin/notifications", icon: FiBell },
  { label: "Settings", to: "/admin/settings", icon: FiSettings },
];

const Sidebar = ({ isOpen, isDesktop, onToggle, onNavigate }: SidebarProps) => {
  const desktopWidthClass = isOpen ? "lg:w-64" : "lg:w-20";

  return (
    <aside
      className={`fixed left-0 top-0 z-20 h-screen w-64 border-r border-[#E4DCCF] bg-[#F3ECE1] px-4 py-6 transition-all duration-300 ${desktopWidthClass} ${
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
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#7A6C55]">
              Ops Console
            </p>
          )}
          <h1 className="text-xl font-semibold tracking-tight text-[#2A241B]">
            {isOpen ? "LaunchForge" : "LF"}
          </h1>
        </div>
        <button
          onClick={onToggle}
          className={`rounded-full border border-[#E0D5C3] bg-white/80 px-2 py-1 text-xs text-[#6B5C46] shadow-sm ${
            isOpen ? "" : "h-9 w-9"
          }`}
          aria-label="Toggle sidebar"
        >
          {isDesktop ? (isOpen ? <FiChevronsLeft /> : <FiChevronsRight />) : <FiChevronsLeft />}
        </button>
      </div>

      <nav className="no-scrollbar mt-6 max-h-[calc(100vh-220px)] space-y-1 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-[#2A241B] text-[#F7F1E8]"
                  : "text-[#5C5242] hover:bg-[#EDE4D6] hover:text-[#2A241B]"
              }`
            }
            title={!isOpen ? item.label : undefined}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/70 text-[#2A241B]">
              <Icon size={16} />
            </span>
            {isOpen && <span>{item.label}</span>}
          </NavLink>
        )})}
      </nav>

      {isOpen && (
        <div className="mt-6 rounded-2xl border border-[#E0D5C3] bg-white/70 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.2em] text-[#8A7A62]">
            Admin
          </p>
          <p className="text-sm font-semibold text-[#2A241B]">
            Executive Mode
          </p>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
