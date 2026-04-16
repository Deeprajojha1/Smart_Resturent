import { useState } from "react";
import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import useCurrentUser from "../../customhooks/useCurrentUser";
import { logoutUser } from "../../store/authSlice";
import { useAppDispatch } from "../../store/hooks";

const Topbar = () => {
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
      .toUpperCase() || "AD";

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
    <header className="sticky top-0 z-10 border-b border-[#E4DCCF] bg-[#F7F1E8]/90 px-8 py-4 backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#7A6C55]">
              Admin Workspace
            </p>
            <h2 className="text-2xl font-semibold text-[#2A241B]">
              Control Center
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="rounded-lg border border-[#E0D5C3] bg-white/80 px-4 py-2 text-sm font-medium text-[#2A241B] shadow-sm">
            {user?.name ?? "Admin"}
          </button>
          <button className="rounded-lg border border-[#E0D5C3] bg-white/80 px-4 py-2 text-sm text-[#5C5242] shadow-sm">
            {today}
          </button>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="inline-flex items-center gap-2 rounded-lg border border-[#E0D5C3] bg-white/80 px-4 py-2 text-sm font-semibold text-[#2A241B] shadow-sm disabled:opacity-60"
          >
            <FiLogOut className="h-4 w-4" aria-hidden="true" />
            {loggingOut ? "Logging out" : "Logout"}
          </button>
          <div className="h-10 w-10 rounded-lg bg-[#2A241B] text-center text-sm font-semibold leading-10 text-[#F7F1E8]">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
