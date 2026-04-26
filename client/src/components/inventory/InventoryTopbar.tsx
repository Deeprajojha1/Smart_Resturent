import { useEffect, useState } from "react";
import { FiBox, FiCalendar, FiLogOut, FiMenu, FiShield, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import useCurrentUser from "../../customhooks/useCurrentUser";
import { getInventoryHead, type InventoryHeadUser } from "../../services/authService";
import { logoutUser } from "../../store/authSlice";
import { useAppDispatch } from "../../store/hooks";

type InventoryTopbarProps = {
  onMenuToggle: () => void;
  sidebarOpen: boolean;
  isDesktop: boolean;
};

const InventoryTopbar = ({
  onMenuToggle,
  sidebarOpen,
  isDesktop,
}: InventoryTopbarProps) => {
  const [loggingOut, setLoggingOut] = useState(false);
  const [inventoryHead, setInventoryHead] = useState<InventoryHeadUser | null>(null);
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
      .toUpperCase() || "IH";

  useEffect(() => {
    const shouldLoadInventoryHead =
      user?.role === "inventory" ||
      user?.role === "inventory_head" ||
      user?.role === "manager" ||
      user?.role === "admin";

    if (!shouldLoadInventoryHead || !user?.restaurantId) {
      setInventoryHead(null);
      return;
    }

    let active = true;

    const loadInventoryHead = async () => {
      try {
        const head = await getInventoryHead();
        if (active) {
          setInventoryHead(head);
        }
      } catch {
        if (active) {
          setInventoryHead(null);
        }
      }
    };

    void loadInventoryHead();

    return () => {
      active = false;
    };
  }, [user?.restaurantId, user?.role]);

  const inventoryHeadLabel =
    user?.role === "inventory_head"
      ? user.name
      : inventoryHead?.name ?? "Not assigned";
  const isInventoryHeadView =
    user?.role === "inventory_head" || user?.role === "manager" || user?.role === "admin";

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
            <p className="text-xs uppercase tracking-[0.3em] text-[#8A7A62]">Inventory Workspace</p>
            <h2 className="text-xl font-semibold text-[#2A241B] sm:text-2xl">
              {isInventoryHeadView ? "Control Tower" : "Receiving Desk"}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden rounded-lg border border-[#D8CCB9] bg-[#FFF8ED] px-4 py-2 text-sm font-medium text-[#5D4A28] shadow-sm lg:inline-flex">
            Inventory Head: {inventoryHeadLabel}
          </span>
          <span className="hidden rounded-lg border border-[#D8CCB9] bg-white/90 px-4 py-2 text-sm font-medium text-[#2A241B] shadow-sm sm:inline-flex">
            {user?.name ?? "Inventory Team"}
          </span>
          <span className="hidden items-center gap-2 rounded-lg border border-[#D8CCB9] bg-white/90 px-4 py-2 text-sm text-[#6B5C46] shadow-sm md:inline-flex">
            <FiCalendar className="h-4 w-4" />
            {today}
          </span>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="inline-flex items-center gap-2 rounded-lg border border-[#D8CCB9] bg-white/90 px-3 py-2 text-sm font-semibold text-[#2A241B] shadow-sm disabled:opacity-60 sm:px-4"
          >
            <FiLogOut className="h-4 w-4" />
            <span className="hidden sm:inline">{loggingOut ? "Logging out" : "Logout"}</span>
          </button>
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#2A241B] text-xs font-semibold text-[#F7F1E8] sm:h-10 sm:w-10 sm:text-sm">
            {initials}
          </div>
          <span className="hidden items-center gap-1 rounded-full border border-[#D8CCB9] bg-white px-2 py-1 text-xs font-medium text-[#6B5C46] lg:inline-flex">
            <FiShield className="h-3.5 w-3.5" />
            {user?.role === "inventory_head" ? "Head Access" : "Staff Access"}
          </span>
          <span className="hidden items-center gap-1 rounded-full border border-[#D8CCB9] bg-white px-2 py-1 text-xs font-medium text-[#6B5C46] xl:inline-flex">
            <FiBox className="h-3.5 w-3.5" />
            {isInventoryHeadView ? "Vendor and Approval Control" : "Stock Intake and Count"}
          </span>
        </div>
      </div>
    </header>
  );
};

export default InventoryTopbar;
