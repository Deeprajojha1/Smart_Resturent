import SectionShell from "../../components/admin/SectionShell";

const RestaurantsPage = () => {
  return (
    <SectionShell title="Restaurants" subtitle="Multi-Location Overview">
      <div className="rounded-2xl border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-[#2A241B]">
            Active Locations
          </h4>
          <button className="rounded-full bg-[#2A241B] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#F7F1E8]">
            Add Restaurant
          </button>
        </div>
        <div className="mt-4 h-48 rounded-xl border border-dashed border-[#E4DCCF] bg-[#F9F4EC] p-4 text-sm text-[#8A7A62]">
          Table placeholder (name, location, plan, status)
        </div>
      </div>
    </SectionShell>
  );
};

export default RestaurantsPage;
