import { NavLink } from "react-router-dom";
import {
  FiBox,
  FiChevronsLeft,
  FiChevronsRight,
  FiCompass,
  FiLayers,
  FiShield,
  FiTruck,
} from "react-icons/fi";
import useCurrentUser from "../../customhooks/useCurrentUser";

type InventorySidebarProps = {
  isOpen: boolean;
  isDesktop: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
};

const navItems = [
  { label: "Dashboard", to: "/inventory", icon: FiCompass },
  { label: "Stock Control", to: "/inventory", icon: FiBox },
  { label: "Request Flow", to: "/inventory", icon: FiTruck },
];

const InventorySidebar = ({
  isOpen,
  isDesktop,
  onToggle,
  onNavigate,
}: InventorySidebarProps) => {
  const { user } = useCurrentUser();
  const desktopWidthClass = isOpen ? "lg:w-64" : "lg:w-20";

  return (
    <aside
      className={`fixed left-0 top-0 z-20 h-screen w-64 border-r border-[#E0D5C3] bg-[#F7F1E8] px-4 py-6 transition-all duration-300 ${desktopWidthClass} ${
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
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#8A7A62]">
              Inventory Console
            </p>
          )}
          <h1 className="text-xl font-semibold tracking-tight text-[#2A241B]">
            {isOpen ? "OpsFlow" : "OF"}
          </h1>
        </div>
        <button
          onClick={onToggle}
          className={`rounded-full border border-[#D8CCB9] bg-white/90 px-2 py-1 text-xs text-[#6B5C46] shadow-sm ${
            isOpen ? "" : "h-9 w-9"
          }`}
          aria-label="Toggle sidebar"
        >
          {isDesktop ? (isOpen ? <FiChevronsLeft /> : <FiChevronsRight />) : <FiChevronsLeft />}
        </button>
      </div>

      <nav className="no-scrollbar mt-6 max-h-[calc(100vh-240px)] space-y-1 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={`${item.label}-${item.to}`}
              to={item.to}
              end
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-[#2A241B] text-[#F7F1E8]"
                    : "text-[#6B5C46] hover:bg-[#EEE4D5] hover:text-[#2A241B]"
                }`
              }
              title={!isOpen ? item.label : undefined}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-[#2A241B]">
                <Icon size={16} />
              </span>
              {isOpen && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {isOpen && (
        <div className="mt-6 rounded-2xl border border-[#E0D5C3] bg-white/80 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.2em] text-[#8A7A62]">Role</p>
          <p className="text-sm font-semibold text-[#2A241B]">
            {user?.role === "inventory_head" ? "Inventory Head" : "Inventory Staff"}
          </p>
          <p className="mt-2 inline-flex items-center gap-1 text-xs text-[#6B5C46]">
            <FiShield className="h-3.5 w-3.5" />
            Admin-style operations view
          </p>
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-[#6B5C46]">
            <FiLayers className="h-3.5 w-3.5" />
            Stock, vendors, and requests
          </p>
        </div>
      )}
    </aside>
  );
};

export default InventorySidebar;
