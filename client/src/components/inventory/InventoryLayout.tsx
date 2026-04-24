import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import InventorySidebar from "./InventorySidebar";
import InventoryTopbar from "./InventoryTopbar";

const InventoryLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");

    const applyViewportState = () => {
      const desktop = media.matches;
      setIsDesktop(desktop);

      if (desktop) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    applyViewportState();
    media.addEventListener("change", applyViewportState);

    return () => {
      media.removeEventListener("change", applyViewportState);
    };
  }, []);

  const sidebarWidth = sidebarOpen ? "w-64" : "w-20";

  const handleToggleSidebar = () => {
    setSidebarOpen((value) => !value);
  };

  const handleSidebarNavigate = () => {
    if (!isDesktop) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F7F1E8] text-[#1C1B16]">
      {!isDesktop && sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-10 bg-[#1C1B16]/35 lg:hidden"
        />
      )}

      <InventorySidebar
        isOpen={sidebarOpen}
        isDesktop={isDesktop}
        onToggle={handleToggleSidebar}
        onNavigate={handleSidebarNavigate}
      />

      <div className={`hidden ${sidebarWidth} shrink-0 lg:block`} />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <InventoryTopbar
          isDesktop={isDesktop}
          sidebarOpen={sidebarOpen}
          onMenuToggle={handleToggleSidebar}
        />
        <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-8 pt-4 sm:px-6 sm:pb-10 sm:pt-5 lg:px-8 lg:pb-12 lg:pt-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default InventoryLayout;
