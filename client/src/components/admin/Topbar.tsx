type TopbarProps = {
  onToggleSidebar: () => void;
};

const Topbar = ({ onToggleSidebar }: TopbarProps) => {
  return (
    <header className="sticky top-0 z-10 border-b border-[#E4DCCF] bg-[#F7F1E8]/90 px-8 py-4 backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#7A6C55]">
            Executive Overview
          </p>
          <h2 className="text-2xl font-semibold text-[#2A241B]">
            Admin Control Center
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button className="rounded-full border border-[#E0D5C3] bg-white/80 px-4 py-2 text-sm font-medium text-[#2A241B] shadow-sm">
            The Gilded Fork
          </button>
          <button className="rounded-full border border-[#E0D5C3] bg-white/80 px-4 py-2 text-sm text-[#5C5242] shadow-sm">
            Oct 1 - Oct 31, 2026
          </button>
          <div className="flex items-center gap-2 rounded-full border border-[#E0D5C3] bg-white/80 px-3 py-2 text-sm text-[#5C5242] shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[#C28B2C]" />
            Alerts
          </div>
          <div className="h-10 w-10 rounded-full bg-[#2A241B] text-center text-sm font-semibold leading-10 text-[#F7F1E8]">
            JL
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
