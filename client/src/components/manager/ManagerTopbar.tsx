import { useState } from "react";
import { FiLogOut, FiMenu, FiShield, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import useCurrentUser from "../../customhooks/useCurrentUser";
import { logoutUser } from "../../store/authSlice";
import { useAppDispatch } from "../../store/hooks";

type ManagerTopbarProps = {
  onMenuToggle: () => void;
  sidebarOpen: boolean;
  isDesktop: boolean;
};

const ManagerTopbar = ({ onMenuToggle, sidebarOpen, isDesktop }: ManagerTopbarProps) => {
  const [loggingOut, setLoggingOut] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useCurrentUser();

  const today = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date());

  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "MG";

  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("Logged out successfully.");
      navigate("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Logout failed.");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-10 border-b border-[#DDE5DE] bg-[#F4F8F4]/90 px-4 py-3 backdrop-blur sm:px-6 sm:py-4 lg:px-8">
      <div className="flex items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-4">
          {!isDesktop && (
            <button
              type="button"
              onClick={onMenuToggle}
              aria-label="Toggle menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#CEDCCF] bg-white/90 text-[#1F3A25] shadow-sm lg:hidden"
            >
              {sidebarOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
            </button>
          )}

          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#5B7861]">Manager Workspace</p>
            <h2 className="text-xl font-semibold text-[#1F3A25] sm:text-2xl">Operations Desk</h2>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button className="hidden rounded-lg border border-[#CEDCCF] bg-white/90 px-4 py-2 text-sm font-medium text-[#1F3A25] shadow-sm sm:inline-flex">
            {user?.name ?? "Manager"}
          </button>
          <button className="hidden rounded-lg border border-[#CEDCCF] bg-white/90 px-4 py-2 text-sm text-[#36543C] shadow-sm md:inline-flex">
            {today}
          </button>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="inline-flex items-center gap-2 rounded-lg border border-[#CEDCCF] bg-white/90 px-3 py-2 text-sm font-semibold text-[#1F3A25] shadow-sm disabled:opacity-60 sm:px-4"
          >
            <FiLogOut className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{loggingOut ? "Logging out" : "Logout"}</span>
          </button>
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#1F3A25] text-xs font-semibold text-[#EEF4EF] sm:h-10 sm:w-10 sm:text-sm">
            {initials}
          </div>
          <span className="hidden items-center gap-1 rounded-full border border-[#CEDCCF] bg-white px-2 py-1 text-xs font-medium text-[#36543C] lg:inline-flex">
            <FiShield className="h-3.5 w-3.5" />
            {user?.restaurantId ? "Assigned" : "Unassigned"}
          </span>
        </div>
      </div>
    </header>
  );
};

export default ManagerTopbar;
