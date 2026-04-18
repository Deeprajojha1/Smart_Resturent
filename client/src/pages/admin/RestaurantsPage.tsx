import { useEffect, useMemo, useState } from "react";
import { FiEdit3, FiLoader, FiMapPin, FiSave, FiSearch, FiTrash2 } from "react-icons/fi";
import SectionShell from "../../components/admin/SectionShell";
import ResourceState from "../../components/admin/ResourceState";
import { useAdminResource } from "../../customhooks/useAdminResource";
import {
  deleteRestaurant,
  getMyRestaurant,
  getMyRestaurantById,
  getRestaurants,
  updateRestaurant,
} from "../../services/adminService";

const getLocationLabel = (location?: string) => {
  const normalizedLocation = location?.trim();
  return normalizedLocation || "No location";
};

const RestaurantsPage = () => {
  const itemsPerPage = 6;
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState("");
  const [editForm, setEditForm] = useState({
    name: "",
    location: "",
    subscriptionPlan: "free" as "free" | "pro" | "enterprise",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [deletingRestaurantId, setDeletingRestaurantId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const { data: restaurants, loading, error } = useAdminResource(
    () => getRestaurants({ limit: 50 }),
    [refreshKey]
  );
  const { data: myRestaurant } = useAdminResource(getMyRestaurant, [refreshKey]);

  const { data: selectedRestaurant, loading: selectedLoading } = useAdminResource(
    () =>
      selectedRestaurantId
        ? getMyRestaurantById(selectedRestaurantId)
        : Promise.resolve(null),
    [selectedRestaurantId, refreshKey]
  );

  const filteredRestaurants = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return (restaurants ?? []).filter((restaurant) => {
      const searchableText = [
        restaurant.name,
        restaurant.location,
        restaurant.subscriptionPlan,
        restaurant.owner?.name,
        restaurant.owner?.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !normalizedSearch || searchableText.includes(normalizedSearch);
      const matchesPlan =
        planFilter === "all" || restaurant.subscriptionPlan === planFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && restaurant.isActive !== false) ||
        (statusFilter === "inactive" && restaurant.isActive === false);

      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [planFilter, restaurants, searchTerm, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRestaurants.length / itemsPerPage)
  );

  const paginatedRestaurants = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRestaurants.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, filteredRestaurants]);

  const activeCount = (restaurants ?? []).filter(
    (item) => item.isActive !== false
  ).length;

  useEffect(() => {
    setCurrentPage(1);
  }, [planFilter, searchTerm, statusFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (!filteredRestaurants.length) {
      if (selectedRestaurantId) {
        setSelectedRestaurantId("");
      }
      return;
    }

    const myRestaurantId = myRestaurant?._id ?? "";
    const hasSelectedRestaurant = !!selectedRestaurantId;
    const selectedStillVisible = filteredRestaurants.some(
      (item) => item._id === selectedRestaurantId
    );
    const myRestaurantVisible = filteredRestaurants.some(
      (item) => item._id === myRestaurantId
    );

    if ((!hasSelectedRestaurant || !selectedStillVisible) && myRestaurantVisible) {
      setSelectedRestaurantId(myRestaurantId);
      return;
    }

    if (!hasSelectedRestaurant || !selectedStillVisible) {
      setSelectedRestaurantId(filteredRestaurants[0]._id);
    }
  }, [filteredRestaurants, myRestaurant?._id, selectedRestaurantId]);

  useEffect(() => {
    if (!selectedRestaurant) {
      return;
    }

    setEditForm({
      name: selectedRestaurant.name,
      location: selectedRestaurant.location ?? "",
      subscriptionPlan: selectedRestaurant.subscriptionPlan ?? "free",
      isActive: selectedRestaurant.isActive !== false,
    });
  }, [selectedRestaurant]);

  const handleUpdateRestaurant = async () => {
    if (!selectedRestaurantId) {
      setActionError("Please select a restaurant first.");
      return;
    }

    if (!editForm.name.trim()) {
      setActionError("Restaurant name is required.");
      return;
    }

    setSaving(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      await updateRestaurant(selectedRestaurantId, {
        name: editForm.name.trim(),
        location: editForm.location.trim() || undefined,
        subscriptionPlan: editForm.subscriptionPlan,
        isActive: editForm.isActive,
      });
      setActionSuccess("Restaurant updated successfully.");
      setRefreshKey((key) => key + 1);
    } catch (updateError) {
      setActionError(
        updateError instanceof Error
          ? updateError.message
          : "Restaurant could not be updated."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRestaurant = async (id: string) => {
    const confirmed = window.confirm(
      "Delete this restaurant? This action cannot be undone."
    );
    if (!confirmed) {
      return;
    }

    setDeletingRestaurantId(id);
    setActionError(null);
    setActionSuccess(null);

    try {
      await deleteRestaurant(id);
      setActionSuccess("Restaurant deleted.");
      setRefreshKey((key) => key + 1);
    } catch (deleteError) {
      setActionError(
        deleteError instanceof Error
          ? deleteError.message
          : "Restaurant could not be deleted."
      );
    } finally {
      setDeletingRestaurantId(null);
    }
  };

  return (
    <SectionShell title="Restaurants" subtitle="Multi-Location Overview">
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-[#EEE4D5] bg-[#F9F4EC] p-3">
              <p className="text-xs uppercase tracking-[0.18em] text-[#8A7A62]">
                Total
              </p>
              <p className="mt-2 text-xl font-semibold text-[#2A241B]">
                {restaurants?.length ?? 0}
              </p>
            </div>
            <div className="rounded-lg border border-[#EEE4D5] bg-[#F9F4EC] p-3">
              <p className="text-xs uppercase tracking-[0.18em] text-[#8A7A62]">
                Active
              </p>
              <p className="mt-2 text-xl font-semibold text-[#2A241B]">{activeCount}</p>
            </div>
            <div className="rounded-lg border border-[#EEE4D5] bg-[#F9F4EC] p-3">
              <p className="text-xs uppercase tracking-[0.18em] text-[#8A7A62]">
                Showing
              </p>
              <p className="mt-2 text-xl font-semibold text-[#2A241B]">
                {filteredRestaurants.length}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-[1fr_160px_160px]">
            <label className="relative block">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A7A62]" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search name, location, owner"
                className="h-10 w-full rounded-lg border border-[#E0D5C3] bg-white pl-9 pr-3 text-sm text-[#2A241B] placeholder:text-[#8A7A62]"
              />
            </label>
            <select
              value={planFilter}
              onChange={(event) => setPlanFilter(event.target.value)}
              className="h-10 rounded-lg border border-[#E0D5C3] bg-white px-3 text-sm text-[#2A241B]"
            >
              <option value="all">All plans</option>
              <option value="free">free</option>
              <option value="pro">pro</option>
              <option value="enterprise">enterprise</option>
            </select>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 rounded-lg border border-[#E0D5C3] bg-white px-3 text-sm text-[#2A241B]"
            >
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="mt-4 space-y-3">
            {actionError && <p className="text-sm text-[#9B3F2C]">{actionError}</p>}
            {actionSuccess && (
              <p className="text-sm text-[#3F6F5B]">{actionSuccess}</p>
            )}
            <ResourceState
              loading={loading}
              error={error}
              empty={!filteredRestaurants.length}
              emptyMessage={
                restaurants?.length
                  ? "No restaurants match selected filters."
                  : "No restaurants found."
              }
            />

            {paginatedRestaurants.map((restaurant) => {
              const isSelected = selectedRestaurantId === restaurant._id;
              const isMyRestaurant = myRestaurant?._id === restaurant._id;

              return (
                <div
                  key={restaurant._id}
                  className={`rounded-lg border p-4 text-sm ${
                    isSelected
                      ? "border-[#C28B2C] bg-[#F9F4EC]"
                      : "border-[#EEE4D5] bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      onClick={() => setSelectedRestaurantId(restaurant._id)}
                      className="text-left"
                    >
                      <p className="font-semibold text-[#2A241B]">{restaurant.name}</p>
                      <p className="mt-1 text-xs text-[#6B5C46]">
                        <FiMapPin className="mr-1 inline h-3.5 w-3.5" />
                        {getLocationLabel(restaurant.location)}
                      </p>
                    </button>
                    <span className="rounded-full bg-[#F7F1E8] px-2 py-1 text-xs font-semibold capitalize text-[#6B5C46]">
                      {restaurant.subscriptionPlan ?? "free"}
                    </span>
                  </div>

                  {isMyRestaurant && (
                    <div className="mt-2">
                      <span className="rounded-full bg-[#E7F4EC] px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#2B6B4B]">
                        My Restaurant
                      </span>
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between text-xs text-[#6B5C46]">
                    <span>
                      Owner: {restaurant.owner?.name ?? restaurant.owner?.email ?? "-"}
                    </span>
                    <span className="font-semibold text-[#2A241B]">
                      {restaurant.isActive === false ? "Inactive" : "Active"}
                    </span>
                  </div>

                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => handleDeleteRestaurant(restaurant._id)}
                      disabled={deletingRestaurantId === restaurant._id}
                      className="inline-flex items-center gap-1 rounded-md border border-[#D8C5AF] bg-white px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-[#9B3F2C] disabled:opacity-60"
                    >
                      {deletingRestaurantId === restaurant._id ? (
                        <>
                          <FiLoader className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                          Deleting
                        </>
                      ) : (
                        <>
                          <FiTrash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          Delete
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}

            {!!filteredRestaurants.length && (
              <div className="flex items-center justify-between rounded-lg border border-[#EEE4D5] bg-white px-3 py-2 text-sm text-[#6B5C46]">
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                    className="rounded-md border border-[#E0D5C3] px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-[#2A241B] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((page) => Math.min(totalPages, page + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="rounded-md border border-[#E0D5C3] px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-[#2A241B] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <FiEdit3 className="h-4 w-4 text-[#8A6A3D]" />
            <h4 className="text-lg font-semibold text-[#2A241B]">Restaurant Details</h4>
          </div>

          {!selectedRestaurantId ? (
            <p className="mt-4 text-sm text-[#8A7A62]">
              Select a restaurant from the list.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              <ResourceState
                loading={selectedLoading}
                error={null}
                empty={!selectedRestaurant}
                emptyMessage="Restaurant details unavailable."
              />

              {!!selectedRestaurant && (
                <>
                  <label className="block text-sm">
                    <span className="font-medium text-[#2A241B]">Name</span>
                    <input
                      value={editForm.name}
                      onChange={(event) =>
                        setEditForm((prev) => ({ ...prev, name: event.target.value }))
                      }
                      className="mt-1 h-10 w-full rounded-lg border border-[#E0D5C3] bg-white px-3 text-[#2A241B]"
                    />
                  </label>

                  <label className="block text-sm">
                    <span className="font-medium text-[#2A241B]">Location</span>
                    <input
                      value={editForm.location}
                      onChange={(event) =>
                        setEditForm((prev) => ({ ...prev, location: event.target.value }))
                      }
                      className="mt-1 h-10 w-full rounded-lg border border-[#E0D5C3] bg-white px-3 text-[#2A241B]"
                    />
                  </label>

                  <label className="block text-sm">
                    <span className="font-medium text-[#2A241B]">Plan</span>
                    <select
                      value={editForm.subscriptionPlan}
                      onChange={(event) =>
                        setEditForm((prev) => ({
                          ...prev,
                          subscriptionPlan: event.target.value as
                            | "free"
                            | "pro"
                            | "enterprise",
                        }))
                      }
                      className="mt-1 h-10 w-full rounded-lg border border-[#E0D5C3] bg-white px-3 text-[#2A241B]"
                    >
                      <option value="free">free</option>
                      <option value="pro">pro</option>
                      <option value="enterprise">enterprise</option>
                    </select>
                  </label>

                  <label className="flex items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={editForm.isActive}
                      onChange={(event) =>
                        setEditForm((prev) => ({
                          ...prev,
                          isActive: event.target.checked,
                        }))
                      }
                      className="h-4 w-4 rounded border-[#E0D5C3]"
                    />
                    <span className="font-medium text-[#2A241B]">Active restaurant</span>
                  </label>

                  <button
                    onClick={handleUpdateRestaurant}
                    disabled={saving}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#2A241B] px-4 py-2 text-sm font-semibold text-[#F7F1E8] disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <FiLoader className="h-4 w-4 animate-spin" aria-hidden="true" />
                        Saving
                      </>
                    ) : (
                      <>
                        <FiSave className="h-4 w-4" aria-hidden="true" />
                        Save Changes
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </SectionShell>
  );
};

export default RestaurantsPage;
