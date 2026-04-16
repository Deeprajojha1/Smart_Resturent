import { useEffect, useState } from "react";
import {
  FiEdit3,
  FiMapPin,
  FiPlus,
  FiSave,
  FiSearch,
  FiSettings,
  FiUserPlus,
} from "react-icons/fi";
import { ClipLoader } from "react-spinners";
import SectionShell from "../../components/admin/SectionShell";
import ResourceState from "../../components/admin/ResourceState";
import { useAdminResource } from "../../customhooks/useAdminResource";
import {
  assignRestaurantToUser,
  createRestaurant,
  getMyRestaurant,
  getRestaurants,
  getUsers,
  updateRestaurant,
  updateUserRole,
  type AdminUser,
  type Restaurant,
  type RestaurantInput,
} from "../../services/adminService";

type RestaurantFormState = {
  name: string;
  location: string;
  subscriptionPlan: NonNullable<RestaurantInput["subscriptionPlan"]>;
  isActive: boolean;
};

const initialForm: RestaurantFormState = {
  name: "",
  location: "",
  subscriptionPlan: "free",
  isActive: true,
};

const planOptions: Array<RestaurantFormState["subscriptionPlan"]> = [
  "free",
  "pro",
  "enterprise",
];

const roleOptions: Array<AdminUser["role"]> = [
  "cashier",
  "manager",
  "admin",
  "inventory",
  "vendor",
];

const getUserId = (user: AdminUser) => user._id ?? user.id ?? "";

const getRestaurantLabel = (restaurant?: Restaurant | string) => {
  if (!restaurant) {
    return "";
  }

  if (typeof restaurant === "string") {
    return restaurant;
  }

  return restaurant.name;
};

const getLocationLabel = (location?: string) => {
  const normalizedLocation = location?.trim();
  return normalizedLocation || "No location";
};

const getAssignedRestaurantNames = (user: AdminUser) => {
  const assignedRestaurants = (user.restaurantIds ?? [])
    .map((restaurant) => getRestaurantLabel(restaurant))
    .filter(Boolean);

  if (assignedRestaurants.length) {
    return assignedRestaurants.join(", ");
  }

  const primaryRestaurant = getRestaurantLabel(user.restaurantId);
  return primaryRestaurant || "Not assigned";
};

const SettingsPage = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: restaurant, loading, error } = useAdminResource(
    getMyRestaurant,
    [refreshKey]
  );
  const { data: restaurants } = useAdminResource(
    () => getRestaurants({ limit: 50 }),
    [refreshKey]
  );
  const { data: users, loading: usersLoading, error: usersError } =
    useAdminResource(getUsers, [refreshKey]);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);
  const [form, setForm] = useState<RestaurantFormState>(initialForm);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [assignRestaurantId, setAssignRestaurantId] = useState("");
  const [assignRole, setAssignRole] = useState<AdminUser["role"]>("manager");
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);
  const [editLocation, setEditLocation] = useState("");
  const [savingLocation, setSavingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationSuccess, setLocationSuccess] = useState<string | null>(null);

  const filteredRestaurants = (restaurants ?? []).filter((item) => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const searchableText = [
      item.name,
      item.location,
      item.subscriptionPlan,
      item.owner?.name,
      item.owner?.email,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const matchesSearch =
      !normalizedSearch || searchableText.includes(normalizedSearch);
    const matchesPlan =
      planFilter === "all" || item.subscriptionPlan === planFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && item.isActive !== false) ||
      (statusFilter === "inactive" && item.isActive === false);

    return matchesSearch && matchesPlan && matchesStatus;
  });

  const filteredUsers = (users ?? []).filter((user) => {
    const normalizedSearch = userSearchTerm.trim().toLowerCase();
    const searchableText = [
      user.name,
      user.email,
      user.role,
      getAssignedRestaurantNames(user),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const matchesSearch =
      !normalizedSearch || searchableText.includes(normalizedSearch);
    const matchesRole = userRoleFilter === "all" || user.role === userRoleFilter;

    return matchesSearch && matchesRole;
  });

  const selectedUser =
    users?.find((item) => getUserId(item) === selectedUserId) ?? null;

  useEffect(() => {
    if (restaurant) {
      setSelectedRestaurant(restaurant);
      return;
    }

    if (!selectedRestaurant && restaurants?.length) {
      setSelectedRestaurant(restaurants[0]);
    }
  }, [restaurant, restaurants, selectedRestaurant]);

  useEffect(() => {
    if (!assignRestaurantId && selectedRestaurant?._id) {
      setAssignRestaurantId(selectedRestaurant._id);
    }
  }, [assignRestaurantId, selectedRestaurant]);

  useEffect(() => {
    setEditLocation(selectedRestaurant?.location ?? "");
    setLocationError(null);
    setLocationSuccess(null);
  }, [selectedRestaurant]);

  useEffect(() => {
    if (!selectedUserId && filteredUsers.length) {
      const user = filteredUsers[0];
      setSelectedUserId(getUserId(user));
      setAssignRole(user.role);
    }
  }, [filteredUsers, selectedUserId]);

  const handleCreateRestaurant = async () => {
    if (!form.name.trim()) {
      setCreateError("Restaurant name is required.");
      return;
    }

    setCreating(true);
    setCreateError(null);

    try {
      const created = await createRestaurant({
        name: form.name.trim(),
        location: form.location.trim() || undefined,
        subscriptionPlan: form.subscriptionPlan,
        isActive: form.isActive,
      });

      setSelectedRestaurant(created);
      setForm(initialForm);
      setRefreshKey((key) => key + 1);
    } catch (createRestaurantError) {
      setCreateError(
        createRestaurantError instanceof Error
          ? createRestaurantError.message
          : "Restaurant could not be created."
      );
    } finally {
      setCreating(false);
    }
  };

  const handleSelectUser = (userId: string) => {
    const user = users?.find((item) => getUserId(item) === userId);

    setSelectedUserId(userId);
    setAssignRole(user?.role ?? "manager");
    setAssignError(null);
    setAssignSuccess(null);
  };

  const handleAssignUser = async () => {
    if (!selectedUserId || !assignRestaurantId) {
      setAssignError("Please select a user and restaurant.");
      return;
    }

    setAssigning(true);
    setAssignError(null);
    setAssignSuccess(null);

    try {
      await updateUserRole(selectedUserId, assignRole);
      await assignRestaurantToUser(selectedUserId, assignRestaurantId);
      setAssignSuccess(
        assignRole === "admin"
          ? "Admin added to restaurant."
          : "User assigned to restaurant."
      );
      setRefreshKey((key) => key + 1);
    } catch (assignmentError) {
      setAssignError(
        assignmentError instanceof Error
          ? assignmentError.message
          : "User could not be assigned."
      );
    } finally {
      setAssigning(false);
    }
  };

  const handleUpdateLocation = async () => {
    if (!selectedRestaurant?._id) {
      setLocationError("Please select a restaurant.");
      return;
    }

    setSavingLocation(true);
    setLocationError(null);
    setLocationSuccess(null);

    try {
      const updatedRestaurant = await updateRestaurant(selectedRestaurant._id, {
        location: editLocation.trim() || undefined,
      });

      setSelectedRestaurant(updatedRestaurant);
      setEditLocation(updatedRestaurant.location ?? "");
      setLocationSuccess("Location updated.");
      setRefreshKey((key) => key + 1);
    } catch (updateLocationError) {
      setLocationError(
        updateLocationError instanceof Error
          ? updateLocationError.message
          : "Location could not be updated."
      );
    } finally {
      setSavingLocation(false);
    }
  };

  return (
    <SectionShell title="Settings" subtitle="Restaurant Profile">
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <FiPlus className="h-4 w-4 text-[#8A6A3D]" />
              <h4 className="text-lg font-semibold text-[#2A241B]">
                Create Restaurant
              </h4>
            </div>
            <p className="mt-2 text-sm text-[#6B5C46]">
              New restaurant will be assigned to your admin account.
            </p>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block text-sm">
                <span className="font-medium text-[#2A241B]">
                  Restaurant Name
                </span>
                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="Enter restaurant name"
                  className="mt-2 h-10 w-full rounded-lg border border-[#E0D5C3] bg-white px-3 text-[#2A241B] placeholder:text-[#8A7A62]"
                />
              </label>

              <label className="block text-sm">
                <span className="font-medium text-[#2A241B]">Location</span>
                <input
                  value={form.location}
                  onChange={(event) =>
                    setForm({ ...form, location: event.target.value })
                  }
                  placeholder="City or address"
                  className="mt-2 h-10 w-full rounded-lg border border-[#E0D5C3] bg-white px-3 text-[#2A241B] placeholder:text-[#8A7A62]"
                />
              </label>

              <label className="block text-sm">
                <span className="font-medium text-[#2A241B]">Plan</span>
                <select
                  value={form.subscriptionPlan}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      subscriptionPlan:
                        event.target.value as RestaurantFormState["subscriptionPlan"],
                    })
                  }
                  className="mt-2 h-10 w-full rounded-lg border border-[#E0D5C3] bg-white px-3 text-[#2A241B]"
                >
                  {planOptions.map((plan) => (
                    <option key={plan} value={plan}>
                      {plan}
                    </option>
                  ))}
                </select>
              </label>

              <label className="mt-7 flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    setForm({ ...form, isActive: event.target.checked })
                  }
                  className="h-4 w-4 rounded border-[#E0D5C3]"
                />
                <span className="font-medium text-[#2A241B]">
                  Active restaurant
                </span>
              </label>
            </div>

            <div className="mt-5 rounded-lg border border-[#EEE4D5] bg-[#F9F4EC] px-3 py-2 text-sm text-[#6B5C46]">
              Assign to self:{" "}
              <span className="font-semibold text-[#2A241B]">Enabled</span>
            </div>

            {createError && (
              <p className="mt-3 text-sm text-[#9B3F2C]">{createError}</p>
            )}

            <button
              onClick={handleCreateRestaurant}
              disabled={creating || !form.name.trim()}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#2A241B] px-4 py-2 text-sm font-semibold text-[#F7F1E8] disabled:opacity-60"
            >
              {creating ? (
                <>
                  <ClipLoader size={14} color="#F7F1E8" />
                  Creating...
                </>
              ) : (
                <>
                  <FiPlus className="h-4 w-4" />
                  Create and Assign to Me
                </>
              )}
            </button>
          </div>

          <div className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FiMapPin className="h-4 w-4 text-[#8A6A3D]" />
                <h4 className="text-lg font-semibold text-[#2A241B]">
                  Restaurant Directory
                </h4>
              </div>
              <span className="rounded-full bg-[#F7F1E8] px-3 py-1 text-xs font-semibold text-[#6B5C46]">
                {filteredRestaurants.length} / {restaurants?.length ?? 0}
              </span>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-[1fr_160px_160px]">
              <label className="relative block">
                <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A7A62]" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search restaurant, owner, location"
                  className="h-10 w-full rounded-lg border border-[#E0D5C3] bg-white pl-9 pr-3 text-sm text-[#2A241B] placeholder:text-[#8A7A62]"
                />
              </label>
              <select
                value={planFilter}
                onChange={(event) => setPlanFilter(event.target.value)}
                className="h-10 rounded-lg border border-[#E0D5C3] bg-white px-3 text-sm text-[#2A241B]"
              >
                <option value="all">All plans</option>
                {planOptions.map((plan) => (
                  <option key={plan} value={plan}>
                    {plan}
                  </option>
                ))}
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
              <ResourceState
                loading={!restaurants}
                error={null}
                empty={!filteredRestaurants.length}
                emptyMessage="No restaurants match your filters."
              />
              {filteredRestaurants.map((item) => {
                const isSelected = selectedRestaurant?._id === item._id;

                return (
                  <button
                    key={item._id}
                    onClick={() => setSelectedRestaurant(item)}
                    className={`w-full rounded-lg border p-3 text-left text-sm transition hover:bg-[#F9F4EC] ${
                      isSelected
                        ? "border-[#C28B2C] bg-[#F9F4EC]"
                        : "border-[#EEE4D5] bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-[#2A241B]">
                        {item.name}
                      </span>
                      <span className="rounded-full bg-[#F7F1E8] px-2 py-1 text-xs font-semibold text-[#6B5C46]">
                        {item.subscriptionPlan ?? "free"}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[#6B5C46]">
                      <span>{getLocationLabel(item.location)}</span>
                      <span>
                        Owner: {item.owner?.name ?? item.owner?.email ?? "You"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <FiUserPlus className="h-4 w-4 text-[#8A6A3D]" />
                  <h4 className="text-lg font-semibold text-[#2A241B]">
                    Assign Team Members
                  </h4>
                </div>
                <p className="mt-2 text-sm text-[#6B5C46]">
                  Select a user, set their role, and attach them to a restaurant.
                </p>
              </div>
              <span className="rounded-full bg-[#F7F1E8] px-3 py-1 text-xs font-semibold text-[#6B5C46]">
                {filteredUsers.length} / {users?.length ?? 0}
              </span>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-[1fr_180px]">
              <label className="relative block">
                <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A7A62]" />
                <input
                  value={userSearchTerm}
                  onChange={(event) => setUserSearchTerm(event.target.value)}
                  placeholder="Search user, email, role, restaurant"
                  className="h-10 w-full rounded-lg border border-[#E0D5C3] bg-white pl-9 pr-3 text-sm text-[#2A241B] placeholder:text-[#8A7A62]"
                />
              </label>
              <select
                value={userRoleFilter}
                onChange={(event) => setUserRoleFilter(event.target.value)}
                className="h-10 rounded-lg border border-[#E0D5C3] bg-white px-3 text-sm text-[#2A241B]"
              >
                <option value="all">All roles</option>
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_280px]">
              <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
                <ResourceState
                  loading={usersLoading}
                  error={usersError}
                  empty={!filteredUsers.length}
                  emptyMessage="No users match your filters."
                />
                {filteredUsers.map((user) => {
                  const userId = getUserId(user);
                  const isSelected = selectedUserId === userId;

                  return (
                    <button
                      key={userId}
                      onClick={() => handleSelectUser(userId)}
                      className={`w-full rounded-lg border p-3 text-left text-sm transition hover:bg-[#F9F4EC] ${
                        isSelected
                          ? "border-[#C28B2C] bg-[#F9F4EC]"
                          : "border-[#EEE4D5] bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-[#2A241B]">
                          {user.name}
                        </span>
                        <span className="rounded-full bg-[#F7F1E8] px-2 py-1 text-xs font-semibold text-[#6B5C46]">
                          {user.role}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[#6B5C46]">
                        <span>{user.email}</span>
                        <span>{getAssignedRestaurantNames(user)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-lg border border-[#EEE4D5] bg-[#F9F4EC] p-4">
                <div className="flex items-center gap-2">
                  <FiSettings className="h-4 w-4 text-[#8A6A3D]" />
                  <h5 className="font-semibold text-[#2A241B]">
                    Assignment Details
                  </h5>
                </div>
                <label className="mt-4 block text-sm">
                  <span className="font-medium text-[#2A241B]">Restaurant</span>
                  <select
                    value={assignRestaurantId}
                    onChange={(event) => setAssignRestaurantId(event.target.value)}
                    className="mt-2 h-10 w-full rounded-lg border border-[#E0D5C3] bg-white px-3 text-[#2A241B]"
                  >
                    <option value="">Select restaurant</option>
                    {(restaurants ?? []).map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>

                {selectedUserId && (
                  <div className="mt-4 rounded-lg border border-[#E0D5C3] bg-white px-3 py-2 text-sm text-[#6B5C46]">
                    Current assignments:{" "}
                    <span className="font-medium text-[#2A241B]">
                      {selectedUser
                        ? getAssignedRestaurantNames(selectedUser)
                        : "Not assigned"}
                    </span>
                  </div>
                )}

                <label className="mt-4 block text-sm">
                  <span className="font-medium text-[#2A241B]">Role</span>
                  <select
                    value={assignRole}
                    onChange={(event) =>
                      setAssignRole(event.target.value as AdminUser["role"])
                    }
                    className="mt-2 h-10 w-full rounded-lg border border-[#E0D5C3] bg-white px-3 text-[#2A241B]"
                  >
                    {roleOptions.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </label>

                {assignError && (
                  <p className="mt-3 text-sm text-[#9B3F2C]">{assignError}</p>
                )}
                {assignSuccess && (
                  <p className="mt-3 text-sm text-[#3F6F5B]">{assignSuccess}</p>
                )}

                <button
                  onClick={handleAssignUser}
                  disabled={assigning || !selectedUserId || !assignRestaurantId}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#2A241B] px-4 py-2 text-sm font-semibold text-[#F7F1E8] disabled:opacity-60"
                >
                  {assigning ? (
                    <>
                      <ClipLoader size={14} color="#F7F1E8" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <FiUserPlus className="h-4 w-4" />
                      Assign User
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <FiMapPin className="h-4 w-4 text-[#8A6A3D]" />
              <h4 className="text-lg font-semibold text-[#2A241B]">
                Assigned Restaurant
              </h4>
            </div>
            <div className="mt-4">
              <ResourceState
                loading={loading}
                error={error}
                empty={!restaurant}
                emptyMessage="No restaurant assigned to this admin user."
              />
              {restaurant && (
                <div className="space-y-3 text-sm">
                  <div className="rounded-lg border border-[#EEE4D5] bg-[#F9F4EC] p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#8A7A62]">
                      Name
                    </p>
                    <p className="mt-2 font-semibold text-[#2A241B]">
                      {restaurant.name}
                    </p>
                  </div>
                  <div className="rounded-lg border border-[#EEE4D5] bg-[#F9F4EC] p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#8A7A62]">
                      Location
                    </p>
                    <p className="mt-2 font-semibold text-[#2A241B]">
                      {getLocationLabel(restaurant.location)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <FiEdit3 className="h-4 w-4 text-[#8A6A3D]" />
              <h4 className="text-lg font-semibold text-[#2A241B]">
                Selected Details
              </h4>
            </div>
            {selectedRestaurant ? (
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-[#6B5C46]">Restaurant</span>
                  <span className="font-medium text-[#2A241B]">
                    {selectedRestaurant.name}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between gap-3">
                    <span className="text-[#6B5C46]">Location</span>
                    <span className="font-medium text-[#2A241B]">
                      {getLocationLabel(selectedRestaurant.location)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <label className="relative block flex-1">
                      <FiMapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A7A62]" />
                      <input
                        value={editLocation}
                        onChange={(event) => setEditLocation(event.target.value)}
                        placeholder="Edit location"
                        className="h-10 w-full rounded-lg border border-[#E0D5C3] bg-white pl-9 pr-3 text-[#2A241B] placeholder:text-[#8A7A62]"
                      />
                    </label>
                    <button
                      onClick={handleUpdateLocation}
                      disabled={savingLocation}
                      className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#2A241B] px-4 text-sm font-semibold text-[#F7F1E8] disabled:opacity-60"
                    >
                      {savingLocation ? (
                        <>
                          <ClipLoader size={14} color="#F7F1E8" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <FiSave className="h-4 w-4" />
                          Save
                        </>
                      )}
                    </button>
                  </div>
                  {locationError && (
                    <p className="text-sm text-[#9B3F2C]">{locationError}</p>
                  )}
                  {locationSuccess && (
                    <p className="text-sm text-[#3F6F5B]">{locationSuccess}</p>
                  )}
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-[#6B5C46]">Plan</span>
                  <span className="font-medium text-[#2A241B]">
                    {selectedRestaurant.subscriptionPlan ?? "free"}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-[#6B5C46]">Status</span>
                  <span className="font-medium text-[#2A241B]">
                    {selectedRestaurant.isActive === false ? "Inactive" : "Active"}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-[#6B5C46]">Owner</span>
                  <span className="font-medium text-[#2A241B]">
                    {selectedRestaurant.owner?.name ??
                      selectedRestaurant.owner?.email ??
                      "Current admin"}
                  </span>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-[#8A7A62]">
                Select a restaurant to view details.
              </p>
            )}
          </div>
        </div>
      </div>
    </SectionShell>
  );
};

export default SettingsPage;
