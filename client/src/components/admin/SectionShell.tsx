import type { IconType } from "react-icons";
import {
  FiBarChart2,
  FiBell,
  FiBox,
  FiBriefcase,
  FiClipboard,
  FiCompass,
  FiCpu,
  FiDollarSign,
  FiGrid,
  FiPackage,
  FiSettings,
  FiShoppingCart,
  FiUsers,
} from "react-icons/fi";

type SectionShellProps = {
  title: string;
  subtitle?: string;
  icon?: IconType;
  children?: React.ReactNode;
};

const titleToIconMap: Record<string, IconType> = {
  Dashboard: FiCompass,
  Restaurants: FiBriefcase,
  "Menu Management": FiClipboard,
  "POS Orders": FiShoppingCart,
  "Online Orders": FiPackage,
  Inventory: FiBox,
  Customers: FiUsers,
  Employees: FiUsers,
  Payroll: FiDollarSign,
  Expenses: FiDollarSign,
  Analytics: FiBarChart2,
  "AI Insights": FiCpu,
  Notifications: FiBell,
  Settings: FiSettings,
};

const SectionShell = ({ title, subtitle, icon, children }: SectionShellProps) => {
  const HeaderIcon = icon ?? titleToIconMap[title] ?? FiGrid;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="rounded-xl border border-[#E0D5C3] bg-white/80 p-3 text-[#6B5C46] shadow-sm">
          <HeaderIcon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#8A7A62]">
            {subtitle ?? "Admin Workspace"}
          </p>
          <h3 className="text-2xl font-semibold text-[#2A241B]">{title}</h3>
        </div>
      </div>
      {children}
    </div>
  );
};

export default SectionShell;
