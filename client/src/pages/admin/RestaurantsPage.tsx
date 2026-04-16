import SectionShell from "../../components/admin/SectionShell";
import ResourceState from "../../components/admin/ResourceState";
import { useAdminResource } from "../../customhooks/useAdminResource";
import { getRestaurants } from "../../services/adminService";

const getLocationLabel = (location?: string) => {
  const normalizedLocation = location?.trim();
  return normalizedLocation || "No location";
};

const RestaurantsPage = () => {
  const { data: restaurants, loading, error } = useAdminResource(getRestaurants);

  return (
    <SectionShell title="Restaurants" subtitle="Multi-Location Overview">
      <div className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-[#2A241B]">
            Active Locations
          </h4>
          <span className="rounded-full bg-[#F7F1E8] px-3 py-1 text-xs font-semibold text-[#6B5C46]">
            {restaurants?.length ?? 0} total
          </span>
        </div>
        <div className="mt-4 overflow-x-auto">
          <ResourceState
            loading={loading}
            error={error}
            empty={!restaurants?.length}
            emptyMessage="No restaurants found."
          />
          {!!restaurants?.length && (
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.2em] text-[#8A7A62]">
                <tr>
                  <th className="py-3 pr-4">Name</th>
                  <th className="py-3 pr-4">Location</th>
                  <th className="py-3 pr-4">Plan</th>
                  <th className="py-3 pr-4">Owner</th>
                  <th className="py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEE4D5] text-[#2A241B]">
                {restaurants.map((restaurant) => (
                  <tr key={restaurant._id}>
                    <td className="py-3 pr-4 font-medium">{restaurant.name}</td>
                    <td className="py-3 pr-4">{getLocationLabel(restaurant.location)}</td>
                    <td className="py-3 pr-4">{restaurant.subscriptionPlan ?? "-"}</td>
                    <td className="py-3 pr-4">
                      {restaurant.owner?.name ?? restaurant.owner?.email ?? "-"}
                    </td>
                    <td className="py-3">
                      {restaurant.isActive === false ? "Inactive" : "Active"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </SectionShell>
  );
};

export default RestaurantsPage;
