import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const sidebarWidth = sidebarOpen ? "w-64" : "w-20";

  return (
    <div className="flex min-h-screen bg-[#F7F1E8] text-[#1C1B16]">
      <Sidebar
        isOpen={sidebarOpen}
        widthClass={sidebarWidth}
        onToggle={() => setSidebarOpen((value) => !value)}
      />
      <div className={`${sidebarWidth} shrink-0`} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="min-h-0 flex-1 overflow-y-auto px-8 pb-12 pt-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
