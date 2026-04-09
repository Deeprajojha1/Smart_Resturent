import SectionShell from "../../components/admin/SectionShell";

const MenuPage = () => {
  return (
    <SectionShell title="Menu Management" subtitle="Catalog Control">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_2fr]">
        <div className="rounded-2xl border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-[#2A241B]">Categories</h4>
          <div className="mt-4 space-y-2 text-sm text-[#6B5C46]">
            <div>Starters</div>
            <div>Main Course</div>
            <div>Beverages</div>
            <div>Desserts</div>
          </div>
        </div>
        <div className="rounded-2xl border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-[#2A241B]">
              Menu Items
            </h4>
            <button className="rounded-full bg-[#2A241B] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#F7F1E8]">
              Add Item
            </button>
          </div>
          <div className="mt-4 h-56 rounded-xl border border-dashed border-[#E4DCCF] bg-[#F9F4EC] p-4 text-sm text-[#8A7A62]">
            Menu grid placeholder (image, price, availability, stock)
          </div>
        </div>
      </div>
    </SectionShell>
  );
};

export default MenuPage;
