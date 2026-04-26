import { FiMapPin, FiMenu, FiRefreshCw, FiUser, FiX } from "react-icons/fi";
import useCurrentUser from "../../customhooks/useCurrentUser";

type CustomerTopbarProps = {
  isDesktop: boolean;
  sidebarOpen: boolean;
  onMenuToggle: () => void;
  restaurantName?: string;
  restaurantLocation?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
};

const CustomerTopbar = ({
  isDesktop,
  sidebarOpen,
  onMenuToggle,
  restaurantName,
  restaurantLocation,
  onRefresh,
  refreshing,
}: CustomerTopbarProps) => {
  const { user } = useCurrentUser();

  return (
    <header className="sticky top-0 z-10 border-b border-[#E0D5C3] bg-[#F7F1E8]/90 px-4 py-3 backdrop-blur sm:px-6 sm:py-4 lg:px-8">
      <div className="flex items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-4">
          {!isDesktop && (
            <button
              type="button"
              onClick={onMenuToggle}
              aria-label="Toggle menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#D8CCB9] bg-white/90 text-[#2A241B] shadow-sm lg:hidden"
            >
              {sidebarOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
            </button>
          )}

          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#8A7A62]">Customer Dashboard</p>
            <h2 className="text-xl font-semibold text-[#2A241B] sm:text-2xl">Prepared Food Board</h2>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {restaurantName && (
            <span className="hidden items-center gap-2 rounded-lg border border-[#D8CCB9] bg-white/90 px-4 py-2 text-sm text-[#6B5C46] shadow-sm lg:inline-flex">
              <FiMapPin className="h-4 w-4" />
              {restaurantName}
              {restaurantLocation ? `, ${restaurantLocation}` : ""}
            </span>
          )}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-lg border border-[#D8CCB9] bg-white/90 px-3 py-2 text-sm font-semibold text-[#2A241B] shadow-sm disabled:opacity-60 sm:px-4"
            >
              <FiRefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{refreshing ? "Refreshing" : "Refresh"}</span>
            </button>
          )}
          <span className="hidden items-center gap-2 rounded-lg border border-[#D8CCB9] bg-[#FFF8ED] px-4 py-2 text-sm font-medium text-[#5D4A28] shadow-sm md:inline-flex">
            <FiUser className="h-4 w-4" />
            {user?.name ?? "Customer"}
          </span>
        </div>
      </div>
    </header>
  );
};

export default CustomerTopbar;
