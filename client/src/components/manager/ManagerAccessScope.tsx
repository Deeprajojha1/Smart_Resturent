import { Outlet } from "react-router-dom";
import useCurrentUser from "../../customhooks/useCurrentUser";
import ThreeDotsLoader from "../common/ThreeDotsLoader";

const ManagerAccessScope = () => {
  const { user, loading } = useCurrentUser();

  if (loading) {
    return <ThreeDotsLoader fullScreen />;
  }

  if (user?.role === "manager" && !user.restaurantId) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 text-[#1D2A20]">
        <section className="rounded-xl border border-[#F0D2C0] bg-[#FFF7F2] p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-[#9B3F2C]">Access Restricted</p>
          <h1 className="mt-2 text-2xl font-semibold text-[#2A241B] sm:text-3xl">
            No Restaurant Assigned To This Manager
          </h1>
          <p className="mt-2 text-sm text-[#6B5C46]">
            Admin must assign a restaurant first. After assignment, manager features
            like menu, inventory, employees, vendors, and online orders will unlock.
          </p>
        </section>
      </div>
    );
  }

  return <Outlet />;
};

export default ManagerAccessScope;
