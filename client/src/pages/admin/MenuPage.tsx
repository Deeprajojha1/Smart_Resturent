import SectionShell from "../../components/admin/SectionShell";
import ResourceState from "../../components/admin/ResourceState";
import { useAdminResource } from "../../customhooks/useAdminResource";
import { getMenuItems } from "../../services/adminService";

const MenuPage = () => {
  const { data: items, loading, error } = useAdminResource(getMenuItems);
  const categories = Array.from(
    new Set((items ?? []).map((item) => item.category || "Uncategorized"))
  );

  return (
    <SectionShell title="Menu Management" subtitle="Catalog Control">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_2fr]">
        <div className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-[#2A241B]">Categories</h4>
          <div className="mt-4 space-y-2 text-sm text-[#6B5C46]">
            <ResourceState
              loading={loading}
              error={error}
              empty={!categories.length}
              emptyMessage="No menu categories yet."
            />
            {categories.map((category) => (
              <div
                key={category}
                className="rounded-lg border border-[#EEE4D5] bg-[#F9F4EC] px-3 py-2"
              >
                {category}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-[#2A241B]">
              Menu Items
            </h4>
            <span className="rounded-full bg-[#F7F1E8] px-3 py-1 text-xs font-semibold text-[#6B5C46]">
              {items?.length ?? 0} items
            </span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <ResourceState
              loading={loading}
              error={error}
              empty={!items?.length}
              emptyMessage="No menu items found."
            />
            {items?.map((item) => (
              <div
                key={item._id}
                className="rounded-lg border border-[#EEE4D5] bg-[#F9F4EC] p-4 text-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h5 className="font-semibold text-[#2A241B]">{item.name}</h5>
                    <p className="mt-1 text-[#6B5C46]">
                      {item.description ?? "No description"}
                    </p>
                  </div>
                  <span className="font-semibold text-[#2A241B]">₹{item.price}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-[#8A7A62]">
                  <span>{item.category ?? "Uncategorized"}</span>
                  <span>{item.isAvailable === false ? "Unavailable" : "Available"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  );
};

export default MenuPage;
