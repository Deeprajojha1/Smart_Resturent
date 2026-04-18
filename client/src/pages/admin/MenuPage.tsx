import { useMemo, useState } from "react";
import { FiLoader, FiPlus, FiSave, FiTrash2 } from "react-icons/fi";
import SectionShell from "../../components/admin/SectionShell";
import ResourceState from "../../components/admin/ResourceState";
import { useAdminResource } from "../../customhooks/useAdminResource";
import {
  createMenuItem,
  deleteMenuItem,
  getMenuItems,
  updateMenuItem,
  type MenuItem,
  type MenuItemInput,
} from "../../services/adminService";

const MenuPage = () => {
  const itemsPerPage = 6;
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: items, loading, error } = useAdminResource(getMenuItems, [refreshKey]);
  const [creating, setCreating] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [form, setForm] = useState<MenuItemInput>({
    name: "",
    description: "",
    price: 0,
    category: "",
    isAvailable: true,
    image: "",
  });
  const [editStateById, setEditStateById] = useState<Record<string, Partial<MenuItemInput>>>({});

  const categories = useMemo(
    () => Array.from(new Set((items ?? []).map((item) => item.category || "Uncategorized"))),
    [items]
  );

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return (items ?? []).filter((item) => {
      const itemCategory = item.category || "Uncategorized";
      const searchableText = [item.name, item.description, item.category]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !normalizedSearch || searchableText.includes(normalizedSearch);
      const matchesCategory =
        categoryFilter === "all" || itemCategory === categoryFilter;
      const matchesAvailability =
        availabilityFilter === "all" ||
        (availabilityFilter === "available" && item.isAvailable !== false) ||
        (availabilityFilter === "unavailable" && item.isAvailable === false);

      return matchesSearch && matchesCategory && matchesAvailability;
    });
  }, [availabilityFilter, categoryFilter, items, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, filteredItems]);

  const handlePreviousPage = () => {
    setCurrentPage((page) => Math.max(1, page - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((page) => Math.min(totalPages, page + 1));
  };

  const getEditState = (item: MenuItem) => ({
    name: editStateById[item._id]?.name ?? item.name,
    description: editStateById[item._id]?.description ?? item.description ?? "",
    price: Number(editStateById[item._id]?.price ?? item.price),
    category: editStateById[item._id]?.category ?? item.category ?? "",
    isAvailable: editStateById[item._id]?.isAvailable ?? item.isAvailable !== false,
    image: editStateById[item._id]?.image ?? item.image ?? "",
  });

  const handleCreate = async () => {
    if (!form.name.trim()) {
      setActionError("Menu item name is required.");
      return;
    }

    if (!Number.isFinite(form.price) || form.price <= 0) {
      setActionError("Price must be greater than 0.");
      return;
    }

    setCreating(true);
    setActionError(null);
    setMessage(null);

    try {
      await createMenuItem({
        name: form.name.trim(),
        description: form.description?.trim() || undefined,
        price: Number(form.price),
        category: form.category?.trim() || undefined,
        isAvailable: form.isAvailable,
        image: form.image?.trim() || undefined,
      });
      setMessage("Menu item created successfully.");
      setForm({
        name: "",
        description: "",
        price: 0,
        category: "",
        isAvailable: true,
        image: "",
      });
      setCurrentPage(1);
      setRefreshKey((key) => key + 1);
    } catch (createError) {
      setActionError(
        createError instanceof Error
          ? createError.message
          : "Menu item could not be created."
      );
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async (item: MenuItem) => {
    const edit = getEditState(item);

    if (!edit.name.trim()) {
      setActionError("Menu item name is required.");
      return;
    }

    if (!Number.isFinite(edit.price) || edit.price <= 0) {
      setActionError("Price must be greater than 0.");
      return;
    }

    setSavingId(item._id);
    setActionError(null);
    setMessage(null);

    try {
      await updateMenuItem(item._id, {
        name: edit.name.trim(),
        description: edit.description?.trim() || undefined,
        price: Number(edit.price),
        category: edit.category?.trim() || undefined,
        isAvailable: edit.isAvailable,
        image: edit.image?.trim() || undefined,
      });
      setMessage("Menu item updated.");
      setRefreshKey((key) => key + 1);
    } catch (updateError) {
      setActionError(
        updateError instanceof Error
          ? updateError.message
          : "Menu item could not be updated."
      );
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setActionError(null);
    setMessage(null);

    try {
      await deleteMenuItem(id);
      setMessage("Menu item deleted.");
      setRefreshKey((key) => key + 1);
    } catch (deleteError) {
      setActionError(
        deleteError instanceof Error
          ? deleteError.message
          : "Menu item could not be deleted."
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (currentPage > totalPages) {
    setCurrentPage(totalPages);
  }

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

          <div className="mt-6 rounded-lg border border-[#EEE4D5] bg-[#F9F4EC] p-4">
            <h5 className="text-sm font-semibold text-[#2A241B]">Add Menu Item</h5>
            <div className="mt-3 grid gap-2">
              <input
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="Item name"
                className="h-9 rounded-md border border-[#E0D5C3] bg-white px-3 text-sm text-[#2A241B]"
              />
              <input
                value={form.description ?? ""}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
                placeholder="Description"
                className="h-9 rounded-md border border-[#E0D5C3] bg-white px-3 text-sm text-[#2A241B]"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, price: Number(event.target.value) }))
                  }
                  placeholder="Price"
                  className="h-9 rounded-md border border-[#E0D5C3] bg-white px-3 text-sm text-[#2A241B]"
                />
                <input
                  value={form.category ?? ""}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, category: event.target.value }))
                  }
                  placeholder="Category"
                  className="h-9 rounded-md border border-[#E0D5C3] bg-white px-3 text-sm text-[#2A241B]"
                />
              </div>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#2A241B] px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#F7F1E8] disabled:opacity-60"
              >
                {creating ? (
                  <>
                    <FiLoader className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    Creating
                  </>
                ) : (
                  <>
                    <FiPlus className="h-3.5 w-3.5" aria-hidden="true" />
                    Add
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-[#2A241B]">
              Menu Items
            </h4>
            <span className="rounded-full bg-[#F7F1E8] px-3 py-1 text-xs font-semibold text-[#6B5C46]">
              {filteredItems.length} / {items?.length ?? 0} items
            </span>
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-[1fr_180px_180px]">
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name, description, category"
              className="h-9 rounded-md border border-[#E0D5C3] bg-white px-3 text-sm text-[#2A241B] placeholder:text-[#8A7A62]"
            />
            <select
              value={categoryFilter}
              onChange={(event) => {
                setCategoryFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="h-9 rounded-md border border-[#E0D5C3] bg-white px-2 text-sm text-[#2A241B]"
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <select
              value={availabilityFilter}
              onChange={(event) => {
                setAvailabilityFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="h-9 rounded-md border border-[#E0D5C3] bg-white px-2 text-sm text-[#2A241B]"
            >
              <option value="all">All availability</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <ResourceState
              loading={loading}
              error={error}
              empty={!filteredItems.length}
              emptyMessage={
                items?.length
                  ? "No menu items match selected filters."
                  : "No menu items found."
              }
            />
            {paginatedItems.map((item) => (
              <div
                key={item._id}
                className="rounded-lg border border-[#EEE4D5] bg-[#F9F4EC] p-4 text-sm"
              >
                <div className="grid gap-2">
                  <input
                    value={getEditState(item).name}
                    onChange={(event) =>
                      setEditStateById((prev) => ({
                        ...prev,
                        [item._id]: { ...getEditState(item), name: event.target.value },
                      }))
                    }
                    className="h-9 rounded-md border border-[#E0D5C3] bg-white px-3 text-sm text-[#2A241B]"
                  />
                  <input
                    value={getEditState(item).description ?? ""}
                    onChange={(event) =>
                      setEditStateById((prev) => ({
                        ...prev,
                        [item._id]: {
                          ...getEditState(item),
                          description: event.target.value,
                        },
                      }))
                    }
                    className="h-9 rounded-md border border-[#E0D5C3] bg-white px-3 text-sm text-[#2A241B]"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min="0"
                      value={getEditState(item).price}
                      onChange={(event) =>
                        setEditStateById((prev) => ({
                          ...prev,
                          [item._id]: {
                            ...getEditState(item),
                            price: Number(event.target.value),
                          },
                        }))
                      }
                      className="h-9 rounded-md border border-[#E0D5C3] bg-white px-3 text-sm text-[#2A241B]"
                    />
                    <input
                      value={getEditState(item).category ?? ""}
                      onChange={(event) =>
                        setEditStateById((prev) => ({
                          ...prev,
                          [item._id]: {
                            ...getEditState(item),
                            category: event.target.value,
                          },
                        }))
                      }
                      className="h-9 rounded-md border border-[#E0D5C3] bg-white px-3 text-sm text-[#2A241B]"
                    />
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <label className="inline-flex items-center gap-2 text-xs text-[#6B5C46]">
                    <input
                      type="checkbox"
                      checked={getEditState(item).isAvailable}
                      onChange={(event) =>
                        setEditStateById((prev) => ({
                          ...prev,
                          [item._id]: {
                            ...getEditState(item),
                            isAvailable: event.target.checked,
                          },
                        }))
                      }
                    />
                    Available
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdate(item)}
                      disabled={savingId === item._id}
                      className="inline-flex items-center gap-1 rounded-md bg-[#2A241B] px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-[#F7F1E8] disabled:opacity-60"
                    >
                      {savingId === item._id ? (
                        <>
                          <FiLoader className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                          Saving
                        </>
                      ) : (
                        <>
                          <FiSave className="h-3.5 w-3.5" aria-hidden="true" />
                          Save
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      disabled={deletingId === item._id}
                      className="inline-flex items-center gap-1 rounded-md border border-[#D8C5AF] bg-white px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-[#9B3F2C] disabled:opacity-60"
                    >
                      {deletingId === item._id ? (
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
              </div>
            ))}
            {message && <p className="text-sm text-[#3F6F5B]">{message}</p>}
            {actionError && <p className="text-sm text-[#9B3F2C]">{actionError}</p>}
            {!!filteredItems.length && (
              <div className="md:col-span-2 flex items-center justify-between rounded-lg border border-[#EEE4D5] bg-white px-3 py-2 text-sm text-[#6B5C46]">
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="rounded-md border border-[#E0D5C3] px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-[#2A241B] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextPage}
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
      </div>
    </SectionShell>
  );
};

export default MenuPage;
