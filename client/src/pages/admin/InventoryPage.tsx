import { useState } from "react";
import { FiLoader, FiPlusCircle, FiSave } from "react-icons/fi";
import SectionShell from "../../components/admin/SectionShell";
import ResourceState from "../../components/admin/ResourceState";
import { useAdminResource } from "../../customhooks/useAdminResource";
import {
  addInventoryItem,
  getInventoryStats,
  getLowStock,
  getReorderSuggestions,
  updateInventoryStock,
  type InventoryCreateInput,
} from "../../services/adminService";

const InventoryPage = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [creating, setCreating] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [stockAdjustments, setStockAdjustments] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    itemName: "",
    quantity: "",
    unit: "kg",
    lowStockThreshold: "",
  });

  const { data: lowStock, loading, error } = useAdminResource(getLowStock, [refreshKey]);
  const { data: reorder } = useAdminResource(getReorderSuggestions, [refreshKey]);
  const { data: stats } = useAdminResource(getInventoryStats, [refreshKey]);
  const totals = stats?.[0];

  const handleCreateItem = async () => {
    const quantity = Number(form.quantity);
    const lowStockThreshold = Number(form.lowStockThreshold);

    if (!form.itemName.trim()) {
      setErrorMessage("Please enter item name.");
      return;
    }

    if (!form.unit.trim()) {
      setErrorMessage("Please enter item unit.");
      return;
    }

    if (!Number.isFinite(quantity) || quantity < 0) {
      setErrorMessage("Please enter a valid quantity (0 or more).");
      return;
    }

    if (!Number.isFinite(lowStockThreshold) || lowStockThreshold < 0) {
      setErrorMessage("Please enter a valid low stock threshold (0 or more).");
      return;
    }

    setCreating(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payload: InventoryCreateInput = {
        itemName: form.itemName.trim(),
        quantity,
        unit: form.unit.trim(),
        lowStockThreshold,
      };

      await addInventoryItem(payload);
      setSuccessMessage("Inventory item added successfully.");
      setForm({ itemName: "", quantity: "", unit: "kg", lowStockThreshold: "" });
      setRefreshKey((key) => key + 1);
    } catch (creationError) {
      setErrorMessage(
        creationError instanceof Error
          ? creationError.message
          : "Inventory item could not be added."
      );
    } finally {
      setCreating(false);
    }
  };

  const handleAdjustStock = async (itemId: string) => {
    const quantity = Number(stockAdjustments[itemId]);

    if (!Number.isFinite(quantity) || quantity === 0) {
      setErrorMessage("Please enter a valid stock adjustment (non-zero). Use negative value to reduce stock.");
      return;
    }

    setUpdatingItemId(itemId);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await updateInventoryStock(itemId, { quantity });
      setSuccessMessage("Stock updated successfully.");
      setStockAdjustments((prev) => ({ ...prev, [itemId]: "" }));
      setRefreshKey((key) => key + 1);
    } catch (updateError) {
      setErrorMessage(
        updateError instanceof Error
          ? updateError.message
          : "Stock could not be updated."
      );
    } finally {
      setUpdatingItemId(null);
    }
  };

  return (
    <SectionShell title="Inventory" subtitle="Stock & Supply">
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-[#2A241B]">
              Inventory Status
            </h4>
            <span className="rounded-full bg-[#F7F1E8] px-3 py-1 text-xs font-semibold text-[#6B5C46]">
              {totals?.totalItems ?? 0} items
            </span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-[#EEE4D5] bg-[#F9F4EC] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#8A7A62]">
                Total Stock
              </p>
              <p className="mt-2 text-2xl font-semibold text-[#2A241B]">
                {totals?.totalStock ?? 0}
              </p>
            </div>
            <div className="rounded-lg border border-[#EEE4D5] bg-[#F9F4EC] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#8A7A62]">
                Reorder Needed
              </p>
              <p className="mt-2 text-2xl font-semibold text-[#2A241B]">
                {reorder?.length ?? 0}
              </p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <h5 className="font-semibold text-[#2A241B]">Reorder Suggestions</h5>
            <ResourceState
              loading={loading}
              error={error || errorMessage}
              empty={!reorder?.length}
              emptyMessage="No reorder suggestions."
            />
            {reorder?.map((item) => (
              <div
                key={item._id}
                className="rounded-lg border border-[#EEE4D5] bg-white p-3 text-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-[#2A241B]">{item.itemName}</span>
                  <span className="text-[#8A7A62]">
                    {item.quantity} {item.unit ?? ""} / threshold{" "}
                    {item.lowStockThreshold ?? 0}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="number"
                    value={stockAdjustments[item._id] ?? ""}
                    onChange={(event) =>
                      setStockAdjustments((prev) => ({
                        ...prev,
                        [item._id]: event.target.value,
                      }))
                    }
                    placeholder="Adjust (+/-)"
                    className="w-full rounded-md border border-[#E0D5C3] bg-white px-3 py-1.5 text-xs text-[#2A241B]"
                  />
                  <button
                    onClick={() => handleAdjustStock(item._id)}
                    disabled={updatingItemId === item._id}
                    className="inline-flex items-center gap-1 rounded-md bg-[#2A241B] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#F7F1E8] disabled:opacity-60"
                  >
                    {updatingItemId === item._id ? (
                      <>
                        <FiLoader className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                        Saving
                      </>
                    ) : (
                      <>
                        <FiSave className="h-3.5 w-3.5" aria-hidden="true" />
                        Update
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-[#F0D2C0] bg-[#FFF7F2] p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-[#2A241B]">Add Inventory Item</h4>
          <div className="mt-3 grid gap-3">
            <input
              type="text"
              placeholder="Item name"
              value={form.itemName}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, itemName: event.target.value }))
              }
              className="w-full rounded-lg border border-[#E0D5C3] bg-white px-3 py-2 text-sm text-[#2A241B]"
            />
            <div className="grid gap-3 grid-cols-2">
              <input
                type="number"
                min="0"
                placeholder="Quantity"
                value={form.quantity}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, quantity: event.target.value }))
                }
                className="w-full rounded-lg border border-[#E0D5C3] bg-white px-3 py-2 text-sm text-[#2A241B]"
              />
              <input
                type="text"
                placeholder="Unit (kg, ltr, pcs)"
                value={form.unit}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, unit: event.target.value }))
                }
                className="w-full rounded-lg border border-[#E0D5C3] bg-white px-3 py-2 text-sm text-[#2A241B]"
              />
            </div>
            <input
              type="number"
              min="0"
              placeholder="Low stock threshold"
              value={form.lowStockThreshold}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, lowStockThreshold: event.target.value }))
              }
              className="w-full rounded-lg border border-[#E0D5C3] bg-white px-3 py-2 text-sm text-[#2A241B]"
            />

            {successMessage && (
              <p className="text-sm text-[#3F6F5B]">{successMessage}</p>
            )}
            {errorMessage && <p className="text-sm text-[#9B3F2C]">{errorMessage}</p>}

            <button
              onClick={handleCreateItem}
              disabled={creating}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2A241B] px-4 py-2 text-sm font-semibold text-[#F7F1E8] disabled:opacity-60"
            >
              {creating ? (
                <>
                  <FiLoader className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Adding
                </>
              ) : (
                <>
                  <FiPlusCircle className="h-4 w-4" aria-hidden="true" />
                  Add Item
                </>
              )}
            </button>
          </div>

          <h4 className="text-lg font-semibold text-[#2A241B]">
            Low Stock Alerts
          </h4>
          <div className="mt-3 space-y-3">
            <ResourceState
              loading={loading}
              error={error || errorMessage}
              empty={!lowStock?.length}
              emptyMessage="No low stock alerts."
            />
            {lowStock?.map((item) => (
              <div
                key={item._id}
                className="rounded-lg border border-[#F1D8C7] bg-white p-3 text-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#2A241B]">
                    {item.itemName}
                  </span>
                  <span className="text-[#9B3F2C]">
                    {item.quantity} {item.unit ?? ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  );
};

export default InventoryPage;
