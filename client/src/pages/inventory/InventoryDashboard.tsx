import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  FiAlertTriangle,
  FiArrowRight,
  FiBox,
  FiCheckCircle,
  FiClock,
  FiEdit3,
  FiGrid,
  FiPackage,
  FiPlus,
  FiRefreshCw,
  FiSend,
  FiShield,
  FiTrash2,
  FiTruck,
} from "react-icons/fi";
import { ClipLoader } from "react-spinners";
import SectionShell from "../../components/admin/SectionShell";
import {
  adjustInventoryStockThunk,
  approveInventoryRequestThunk,
  assignInventoryVendorThunk,
  cancelInventoryRequestThunk,
  clearInventoryMessages,
  closeInventoryRequestThunk,
  createInventoryItemThunk,
  createInventoryRequestThunk,
  deleteInventoryItemThunk,
  dispatchInventoryRequestThunk,
  fetchInventoryDashboard,
  fulfillInventoryRequestThunk,
  receiveInventoryRequestThunk,
  updateInventoryItemThunk,
} from "../../store/inventorySlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import useCurrentUser from "../../customhooks/useCurrentUser";
import {
  getRestaurantVendors,
  type InventoryItem,
  type InventoryRequest,
  type VendorUser,
} from "../../services/adminService";

const RAW_UNITS = ["kg", "g", "ltr", "ml", "pcs"];
const PREPARED_UNITS = ["portion", "plate", "pcs", "box", "pack"];

const canApproveRole = (role?: string) =>
  role === "inventory_head" || role === "manager" || role === "admin";

const canReceiveRole = (role?: string) =>
  role === "inventory" || role === "inventory_head" || role === "manager" || role === "admin";

const canFulfillRole = (role?: string) =>
  role === "cashier" ||
  role === "inventory" ||
  role === "inventory_head" ||
  role === "manager" ||
  role === "admin";

const statusLabelMap: Record<string, string> = {
  requested: "Requested",
  approved: "Approved",
  vendor_assigned: "Vendor Assigned",
  dispatched: "Dispatched",
  received: "Received",
  fulfilled: "Fulfilled",
  closed: "Closed",
  cancelled: "Cancelled",
};

const statusClassMap: Record<string, string> = {
  requested: "border-[#E7D8BB] bg-[#FBF6EA] text-[#7A5A2A]",
  approved: "border-[#DCCFB8] bg-[#F7F1E8] text-[#6B5C46]",
  vendor_assigned: "border-[#D7D4C6] bg-[#F6F4EE] text-[#5E6354]",
  dispatched: "border-[#C9D7E6] bg-[#EFF5FB] text-[#335E86]",
  received: "border-[#C8DCCF] bg-[#EEF7F0] text-[#2F6A4A]",
  fulfilled: "border-[#C6D8D0] bg-[#ECF6F2] text-[#2D6659]",
  closed: "border-[#D4CEC5] bg-[#F4F1EC] text-[#5E564A]",
  cancelled: "border-[#E6CAC3] bg-[#FFF2EE] text-[#9B3F2C]",
};

const formatRequestStatus = (status?: string) =>
  status ? statusLabelMap[status] ?? status.replaceAll("_", " ") : "Unknown";

const getStatusClasses = (status?: string) =>
  status ? statusClassMap[status] ?? "border-[#E4DCCF] bg-[#F7F1E8] text-[#6B5C46]" : "";

const formatRoleLabel = (role?: string) =>
  role ? role.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase()) : "Operator";

const formatTimelineDate = (value?: string) =>
  value ? new Date(value).toLocaleString("en-IN") : "Recently";

const getLatestHeadUpdate = (request: InventoryRequest) => {
  const timeline = request.timeline ?? [];
  const headRoles = new Set(["inventory_head", "manager", "admin"]);

  for (let index = timeline.length - 1; index >= 0; index -= 1) {
    const entry = timeline[index];
    if (entry.changedBy?.role && headRoles.has(entry.changedBy.role)) {
      return entry;
    }
  }

  return null;
};

const getItemRiskTone = (item: InventoryItem) => {
  const threshold = item.lowStockThreshold ?? 0;
  if (item.quantity <= threshold) {
    return "critical";
  }
  if (item.quantity <= threshold * 1.5) {
    return "watch";
  }
  return "stable";
};

const InventoryDashboard = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { user, loading: userLoading } = useCurrentUser();
  const {
    items,
    lowStock,
    reorder,
    requests,
    stats,
    status,
    mutationStatus,
    error,
    mutationError,
    mutationSuccess,
  } = useAppSelector((state) => state.inventory);

  const [stockById, setStockById] = useState<Record<string, string>>({});
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState({
    itemName: "",
    itemType: "raw" as "raw" | "prepared",
    quantity: "",
    unit: "kg",
    lowStockThreshold: "",
    price: "",
  });
  const [requestForm, setRequestForm] = useState({
    itemName: "",
    requestedQty: "",
    availableQty: "",
    notes: "",
  });
  const [assignById, setAssignById] = useState<
    Record<string, { vendorId: string; eta: string; note: string }>
  >({});
  const [receiveQtyById, setReceiveQtyById] = useState<Record<string, string>>({});
  const [vendors, setVendors] = useState<VendorUser[]>([]);

  useEffect(() => {
    void dispatch(fetchInventoryDashboard({ requestStatus: "all" }));
  }, [dispatch]);

  useEffect(() => {
    const hash = location.hash || "#overview";
    const element = document.querySelector(hash);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.hash]);

  useEffect(() => {
    if (mutationSuccess || mutationError) {
      const timer = window.setTimeout(() => {
        dispatch(clearInventoryMessages());
      }, 3500);
      return () => window.clearTimeout(timer);
    }
  }, [dispatch, mutationError, mutationSuccess]);

  const totals = stats?.[0];
  const role = user?.role;
  const isInventoryStaff = role === "inventory";
  const isInventoryHeadView =
    role === "inventory_head" || role === "manager" || role === "admin";
  const canApprove = canApproveRole(role);
  const canReceive = canReceiveRole(role);
  const canFulfill = canFulfillRole(role);
  const canManageCatalog = isInventoryHeadView;
  const formUnits = itemForm.itemType === "prepared" ? PREPARED_UNITS : RAW_UNITS;

  const rawItems = useMemo(
    () => items.filter((item) => (item.itemType ?? "raw") === "raw"),
    [items]
  );

  const preparedItems = useMemo(
    () => items.filter((item) => (item.itemType ?? "raw") === "prepared"),
    [items]
  );

  const openRequests = useMemo(
    () => requests.filter((req) => !["closed", "cancelled"].includes(req.status)),
    [requests]
  );

  const criticalItems = useMemo(
    () => items.filter((item) => getItemRiskTone(item) === "critical"),
    [items]
  );

  const recentRequests = useMemo(() => requests.slice(0, 6), [requests]);
  const receivingQueue = useMemo(
    () => requests.filter((req) => ["vendor_assigned", "dispatched"].includes(req.status)),
    [requests]
  );
  const readyToShelve = useMemo(
    () => requests.filter((req) => req.status === "received"),
    [requests]
  );
  const pendingApproval = useMemo(
    () => requests.filter((req) => req.status === "requested"),
    [requests]
  );
  const pendingVendorAssignment = useMemo(
    () => requests.filter((req) => req.status === "approved"),
    [requests]
    );
  const inTransitRequests = useMemo(
    () => requests.filter((req) => ["vendor_assigned", "dispatched"].includes(req.status)),
    [requests]
  );

  const refreshData = async () => {
    await dispatch(fetchInventoryDashboard({ requestStatus: "all" }));
  };

  useEffect(() => {
    if (!canApprove) {
      setVendors([]);
      return;
    }

    let active = true;

    const loadVendors = async () => {
      try {
        const data = await getRestaurantVendors();
        if (active) {
          setVendors(data);
        }
      } catch {
        if (active) {
          setVendors([]);
        }
      }
    };

    void loadVendors();

    return () => {
      active = false;
    };
  }, [canApprove]);

  const resetItemForm = () => {
    setEditingItemId(null);
    setItemForm({
      itemName: "",
      itemType: "raw",
      quantity: "",
      unit: "kg",
      lowStockThreshold: "",
      price: "",
    });
  };

  const handleStockAdjust = async (id: string) => {
    const quantity = Number(stockById[id]);
    if (!Number.isFinite(quantity) || quantity === 0) {
      return;
    }

    await dispatch(adjustInventoryStockThunk({ id, quantity })).unwrap();
    setStockById((prev) => ({ ...prev, [id]: "" }));
    await refreshData();
  };

  const handleSaveItem = async () => {
    const quantity = Number(itemForm.quantity);
    const lowStockThreshold = Number(itemForm.lowStockThreshold);
    const price = Number(itemForm.price);

    if (!itemForm.itemName.trim() || !itemForm.unit.trim()) {
      return;
    }

    if (!Number.isFinite(quantity) || quantity < 0) {
      return;
    }

    if (!Number.isFinite(lowStockThreshold) || lowStockThreshold < 0) {
      return;
    }

    if (itemForm.itemType === "prepared" && (!Number.isFinite(price) || price < 0)) {
      return;
    }

    const payload = {
      itemName: itemForm.itemName.trim(),
      itemType: itemForm.itemType,
      quantity,
      unit: itemForm.unit.trim(),
      lowStockThreshold,
      price: itemForm.itemType === "prepared" ? price : 0,
    };

    if (editingItemId) {
      await dispatch(updateInventoryItemThunk({ id: editingItemId, data: payload })).unwrap();
    } else {
      await dispatch(createInventoryItemThunk(payload)).unwrap();
    }

    resetItemForm();
    await refreshData();
  };

  const startEditItem = (itemId: string) => {
    const found = items.find((item) => item._id === itemId);
    if (!found) {
      return;
    }

    const nextType = (found.itemType ?? "raw") as "raw" | "prepared";
    setEditingItemId(found._id);
    setItemForm({
      itemName: found.itemName,
      itemType: nextType,
      quantity: String(found.quantity ?? 0),
      unit: found.unit ?? (nextType === "prepared" ? "portion" : "kg"),
      lowStockThreshold: String(found.lowStockThreshold ?? 0),
      price: String(found.price ?? 0),
    });
  };

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm("Delete this inventory item?")) {
      return;
    }

    await dispatch(deleteInventoryItemThunk(id)).unwrap();
    if (editingItemId === id) {
      resetItemForm();
    }
    await refreshData();
  };

  const handleCreateRequest = async () => {
    const requestedQty = Number(requestForm.requestedQty);
    const availableQty =
      requestForm.availableQty.trim() === "" ? undefined : Number(requestForm.availableQty);

    if (!requestForm.itemName.trim() || !Number.isFinite(requestedQty) || requestedQty <= 0) {
      return;
    }

    await dispatch(
      createInventoryRequestThunk({
        itemName: requestForm.itemName.trim(),
        requestedQty,
        availableQty,
        notes: requestForm.notes.trim() || undefined,
      })
    ).unwrap();

    setRequestForm({ itemName: "", requestedQty: "", availableQty: "", notes: "" });
    await refreshData();
  };

  const runRequestAction = async (action: () => Promise<unknown>) => {
    await action();
    await refreshData();
  };

  const renderInventoryGroup = (groupTitle: string, groupSubtitle: string, groupItems: InventoryItem[]) => (
    <section className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[#8A7A62]">{groupSubtitle}</p>
          <h4 className="mt-1 text-xl font-semibold text-[#2A241B]">{groupTitle}</h4>
        </div>
        <span className="rounded-full bg-[#F7F1E8] px-3 py-1 text-xs font-semibold text-[#6B5C46]">
          {groupItems.length} items
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {!groupItems.length && (
          <div className="rounded-lg border border-dashed border-[#E4DCCF] bg-[#FCFAF6] px-4 py-5 text-sm text-[#8A7A62]">
            No items in this category yet.
          </div>
        )}

        {groupItems.map((item) => {
          const tone = getItemRiskTone(item);
          const toneClass =
            tone === "critical"
              ? "border-[#F1D3CA] bg-[#FFF7F4]"
              : tone === "watch"
                ? "border-[#EADDBE] bg-[#FCF8ED]"
                : "border-[#E7E1D7] bg-[#FCFAF6]";

          const stockLabel =
            tone === "critical" ? "Low stock" : tone === "watch" ? "Watch closely" : "Healthy";

          return (
            <div key={item._id} className={`rounded-xl border px-4 py-4 ${toneClass}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h5 className="text-base font-semibold text-[#2A241B]">{item.itemName}</h5>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B5C46]">
                      {stockLabel}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[#6B5C46]">
                    In stock: <span className="font-semibold text-[#2A241B]">{item.quantity}</span>{" "}
                    {item.unit ?? ""} <span className="mx-2 text-[#B8AA94]">|</span> Threshold:{" "}
                    <span className="font-semibold text-[#2A241B]">{item.lowStockThreshold ?? 0}</span>
                    {item.itemType === "prepared" && (
                      <>
                        <span className="mx-2 text-[#B8AA94]">|</span> Price:{" "}
                        <span className="font-semibold text-[#2A241B]">
                          Rs {Number(item.price ?? 0).toLocaleString("en-IN")}
                        </span>
                      </>
                    )}
                  </p>
                </div>
                <div className="rounded-lg bg-white px-3 py-2 text-right shadow-sm">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-[#8A7A62]">Type</p>
                  <p className="mt-1 text-sm font-semibold capitalize text-[#2A241B]">
                    {item.itemType ?? "raw"}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <input
                  type="number"
                  value={stockById[item._id] ?? ""}
                  onChange={(event) =>
                    setStockById((prev) => ({ ...prev, [item._id]: event.target.value }))
                  }
                  placeholder="Adjust + / -"
                  className="h-10 min-w-[140px] rounded-lg border border-[#E0D5C3] bg-white px-3 text-sm text-[#2A241B] placeholder:text-[#8A7A62]"
                />
                <button
                  onClick={() => void handleStockAdjust(item._id)}
                  disabled={mutationStatus === "loading"}
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#2A241B] px-4 text-sm font-semibold text-[#F7F1E8] disabled:opacity-60"
                >
                  <FiRefreshCw className="h-4 w-4" />
                  Adjust
                </button>
                {canManageCatalog && (
                  <button
                    onClick={() => startEditItem(item._id)}
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#D9CCB7] bg-white px-4 text-sm font-semibold text-[#6B5C46]"
                  >
                    <FiEdit3 className="h-4 w-4" />
                    Edit
                  </button>
                )}
                {canManageCatalog && (
                  <button
                    onClick={() => void handleDeleteItem(item._id)}
                    disabled={mutationStatus === "loading"}
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#E8C8BF] bg-[#FFF3EF] px-4 text-sm font-semibold text-[#9B3F2C] disabled:opacity-60"
                  >
                    <FiTrash2 className="h-4 w-4" />
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );

  const renderRequestActions = (req: InventoryRequest) => {
    const assignState = assignById[req._id] ?? {
      vendorId: "",
      eta: "",
      note: "",
    };

    return (
      <div className="mt-4 space-y-3">
        {canApprove && ["approved", "vendor_assigned"].includes(req.status) && (
          <div className="grid gap-2 rounded-lg border border-[#E7DED0] bg-white p-3 md:grid-cols-[1fr_1fr_auto]">
            <select
              value={assignState.vendorId}
              onChange={(event) =>
                setAssignById((prev) => ({
                  ...prev,
                  [req._id]: { ...assignState, vendorId: event.target.value },
                }))
              }
              className="h-10 rounded-lg border border-[#E0D5C3] bg-white px-3 text-sm text-[#2A241B]"
            >
              <option value="">Select vendor</option>
              {vendors.map((vendor) => {
                const vendorId = vendor._id ?? vendor.id ?? "";
                return (
                  <option key={vendorId} value={vendorId}>
                    {vendor.name} ({vendor.email})
                  </option>
                );
              })}
            </select>
            <input
              type="datetime-local"
              value={assignState.eta}
              onChange={(event) =>
                setAssignById((prev) => ({
                  ...prev,
                  [req._id]: { ...assignState, eta: event.target.value },
                }))
              }
              className="h-10 rounded-lg border border-[#E0D5C3] bg-white px-3 text-sm text-[#2A241B]"
            />
            <button
              onClick={() =>
                void runRequestAction(() =>
                  dispatch(
                    assignInventoryVendorThunk({
                      id: req._id,
                      vendorId: assignState.vendorId,
                      eta: assignState.eta || undefined,
                      note: assignState.note || undefined,
                    })
                  ).unwrap()
                )
              }
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#D9CCB7] bg-[#F9F4EC] px-4 text-sm font-semibold text-[#6B5C46]"
            >
              <FiTruck className="h-4 w-4" />
              Assign Vendor
            </button>
          </div>
        )}

        {canReceive && ["dispatched", "vendor_assigned"].includes(req.status) && (
          <div className="grid gap-2 rounded-lg border border-[#E7DED0] bg-white p-3 md:grid-cols-[160px_auto]">
            <input
              type="number"
              value={receiveQtyById[req._id] ?? ""}
              onChange={(event) =>
                setReceiveQtyById((prev) => ({
                  ...prev,
                  [req._id]: event.target.value,
                }))
              }
              placeholder="Received qty"
              className="h-10 rounded-lg border border-[#E0D5C3] bg-white px-3 text-sm text-[#2A241B] placeholder:text-[#8A7A62]"
            />
            <button
              onClick={() =>
                void runRequestAction(() =>
                  dispatch(
                    receiveInventoryRequestThunk({
                      id: req._id,
                      receivedQty: receiveQtyById[req._id]
                        ? Number(receiveQtyById[req._id])
                        : undefined,
                    })
                  ).unwrap()
                )
              }
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#D9CCB7] bg-[#F9F4EC] px-4 text-sm font-semibold text-[#6B5C46]"
            >
              <FiCheckCircle className="h-4 w-4" />
              Mark Received
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {canApprove && req.status === "requested" && (
            <button
              onClick={() =>
                void runRequestAction(() =>
                  dispatch(approveInventoryRequestThunk({ id: req._id })).unwrap()
                )
              }
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#2A241B] px-4 text-sm font-semibold text-[#F7F1E8]"
            >
              <FiShield className="h-4 w-4" />
              Approve
            </button>
          )}

          {(role === "vendor" || canApprove) && req.status === "vendor_assigned" && (
            <button
              onClick={() =>
                void runRequestAction(() =>
                  dispatch(dispatchInventoryRequestThunk({ id: req._id })).unwrap()
                )
              }
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#D9CCB7] bg-white px-4 text-sm font-semibold text-[#6B5C46]"
            >
              <FiTruck className="h-4 w-4" />
              Mark Dispatched
            </button>
          )}

          {canFulfill && req.status === "received" && (
            <button
              onClick={() =>
                void runRequestAction(() =>
                  dispatch(fulfillInventoryRequestThunk({ id: req._id })).unwrap()
                )
              }
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#D9CCB7] bg-white px-4 text-sm font-semibold text-[#6B5C46]"
            >
              <FiPackage className="h-4 w-4" />
              Fulfill
            </button>
          )}

          {canApprove && ["fulfilled", "received", "cancelled"].includes(req.status) && (
            <button
              onClick={() =>
                void runRequestAction(() =>
                  dispatch(closeInventoryRequestThunk({ id: req._id })).unwrap()
                )
              }
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#D9CCB7] bg-white px-4 text-sm font-semibold text-[#6B5C46]"
            >
              <FiCheckCircle className="h-4 w-4" />
              Close
            </button>
          )}

          {canApprove &&
            ["requested", "approved", "vendor_assigned", "dispatched"].includes(req.status) && (
              <button
                onClick={() =>
                  void runRequestAction(() =>
                    dispatch(cancelInventoryRequestThunk({ id: req._id })).unwrap()
                  )
                }
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#E8C8BF] bg-[#FFF3EF] px-4 text-sm font-semibold text-[#9B3F2C]"
              >
                <FiAlertTriangle className="h-4 w-4" />
                Cancel
              </button>
            )}
        </div>
      </div>
    );
  };

  if (isInventoryStaff) {
    return (
      <SectionShell title="Inventory Operations" subtitle="Receiving and Stock Count">
        <div className="space-y-6">
          {(mutationError || mutationSuccess || error) && (
            <div className="space-y-3">
              {mutationError && (
                <div className="rounded-lg border border-[#E6CAC3] bg-[#FFF2EE] px-4 py-3 text-sm text-[#9B3F2C]">
                  {mutationError}
                </div>
              )}
              {mutationSuccess && (
                <div className="rounded-lg border border-[#C8DCCF] bg-[#EEF7F0] px-4 py-3 text-sm text-[#2F6A4A]">
                  {mutationSuccess}
                </div>
              )}
              {error && (
                <div className="rounded-lg border border-[#E6CAC3] bg-[#FFF2EE] px-4 py-3 text-sm text-[#9B3F2C]">
                  {error}
                </div>
              )}
            </div>
          )}

          <section id="overview" className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-[#D7E3DA] bg-[#F3FAF5] p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-[#5A7568]">Receiving Queue</p>
              <p className="mt-3 text-3xl font-semibold text-[#2A241B]">{receivingQueue.length}</p>
              <p className="mt-1 text-sm text-[#5D6F66]">Deliveries waiting to be checked in.</p>
            </div>
            <div className="rounded-lg border border-[#C8DCCF] bg-[#EEF7F0] p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-[#2F6A4A]">Ready To Shelve</p>
              <p className="mt-3 text-3xl font-semibold text-[#2A241B]">{readyToShelve.length}</p>
              <p className="mt-1 text-sm text-[#5D6F66]">Received stock waiting to be fulfilled.</p>
            </div>
            <div className="rounded-lg border border-[#F0D2C0] bg-[#FFF7F2] p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-[#9B6B55]">Low Stock</p>
              <p className="mt-3 text-3xl font-semibold text-[#2A241B]">{lowStock.length}</p>
              <p className="mt-1 text-sm text-[#7A6255]">Shelf issues to report upward.</p>
            </div>
            <div className="rounded-lg border border-[#E4DCCF] bg-white/90 p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-[#8A7A62]">Counted Units</p>
              <p className="mt-3 text-3xl font-semibold text-[#2A241B]">{totals?.totalStock ?? 0}</p>
              <p className="mt-1 text-sm text-[#6B5C46]">Live floor count in system.</p>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
            <div className="space-y-6">
              <section className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[#8A7A62]">Shift Focus</p>
                    <h4 className="mt-1 text-xl font-semibold text-[#2A241B]">Today&apos;s Floor Priorities</h4>
                  </div>
                  <span className="rounded-full bg-[#F7F1E8] px-3 py-1 text-xs font-semibold text-[#6B5C46]">
                    {receivingQueue.length + lowStock.length + readyToShelve.length} tasks
                  </span>
                </div>
                <div className="mt-5 grid gap-4 lg:grid-cols-3">
                  <div className="rounded-xl border border-[#D7E3DA] bg-[#F3FAF5] p-4">
                    <div className="flex items-center gap-2">
                      <FiTruck className="h-4 w-4 text-[#3F6F5B]" />
                      <h5 className="font-semibold text-[#2A241B]">Receive Deliveries</h5>
                    </div>
                    <p className="mt-3 text-sm text-[#5D6F66]">
                      Match incoming stock, enter received quantity, and move it into usable stock.
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#E7DED0] bg-[#FCFAF6] p-4">
                    <div className="flex items-center gap-2">
                      <FiRefreshCw className="h-4 w-4 text-[#6B5C46]" />
                      <h5 className="font-semibold text-[#2A241B]">Update Bin Counts</h5>
                    </div>
                    <p className="mt-3 text-sm text-[#6B5C46]">
                      Adjust stock after prep, wastage, and physical count checks during the shift.
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#F1D8C7] bg-[#FFF7F2] p-4">
                    <div className="flex items-center gap-2">
                      <FiAlertTriangle className="h-4 w-4 text-[#B85C38]" />
                      <h5 className="font-semibold text-[#2A241B]">Report Shortages</h5>
                    </div>
                    <p className="mt-3 text-sm text-[#7A6255]">
                      Raise shortage requests early so the inventory head can approve and source stock.
                    </p>
                  </div>
                </div>
              </section>

              <div id="stock-control" className="scroll-mt-28">
                {renderInventoryGroup("Raw Stock Count", "Counting Desk", rawItems)}
              </div>
              {renderInventoryGroup("Prepared Stock Count", "Kitchen Hand-Off", preparedItems)}

              <section
                id="request-flow"
                className="scroll-mt-28 rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[#8A7A62]">Receiving Console</p>
                    <h4 className="mt-1 text-xl font-semibold text-[#2A241B]">Goods and Request Hand-Off</h4>
                  </div>
                  <span className="rounded-full bg-[#F7F1E8] px-3 py-1 text-xs font-semibold text-[#6B5C46]">
                    {requests.length} tracked
                  </span>
                </div>

                <div className="mt-5 space-y-4">
                  {!requests.length && (
                    <div className="rounded-lg border border-dashed border-[#E4DCCF] bg-[#FCFAF6] px-4 py-5 text-sm text-[#8A7A62]">
                      No inventory requests found.
                    </div>
                  )}

                  {requests.map((req) => (
                    <div key={req._id} className="rounded-xl border border-[#E7DED0] bg-[#FCFAF6] p-4">
                      {(() => {
                        const latestHeadUpdate = getLatestHeadUpdate(req);

                        return (
                          <>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h5 className="text-base font-semibold text-[#2A241B]">{req.itemName}</h5>
                            <span
                              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${getStatusClasses(
                                req.status
                              )}`}
                            >
                              {formatRequestStatus(req.status)}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-[#6B5C46]">
                            Requested <span className="font-semibold text-[#2A241B]">{req.requestedQty}</span>
                            <span className="mx-2 text-[#B8AA94]">|</span>
                            Available <span className="font-semibold text-[#2A241B]">{req.availableQty}</span>
                          </p>
                          {latestHeadUpdate ? (
                            <p className="mt-2 text-sm text-[#5D6F66]">
                              Head updated this request to{" "}
                              <span className="font-semibold text-[#2A241B]">
                                {formatRequestStatus(latestHeadUpdate.status)}
                              </span>{" "}
                              by {latestHeadUpdate.changedBy?.name ?? "inventory head"} on{" "}
                              <span className="font-semibold text-[#2A241B]">
                                {formatTimelineDate(latestHeadUpdate.changedAt)}
                              </span>
                              .
                            </p>
                          ) : (
                            <p className="mt-2 text-sm text-[#8A7A62]">
                              Waiting for inventory head update.
                            </p>
                          )}
                        </div>
                        <div className="rounded-lg bg-white px-3 py-2 shadow-sm">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-[#8A7A62]">Assigned Vendor</p>
                          <p className="mt-1 text-sm font-semibold text-[#2A241B]">
                            {req.assignedVendorId?.name ?? "Waiting for head"}
                          </p>
                        </div>
                      </div>

                      {(req.notes || req.eta) && (
                        <div className="mt-3 rounded-lg border border-[#E7DED0] bg-white px-3 py-3 text-sm text-[#6B5C46]">
                          {req.notes && <p>Notes: {req.notes}</p>}
                          {req.eta && <p className={req.notes ? "mt-1" : ""}>ETA: {req.eta}</p>}
                        </div>
                      )}

                      {renderRequestActions(req)}
                          </>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className="rounded-lg border border-[#D6B26E] bg-[#2A241B] p-6 text-[#F7F1E8] shadow-lg">
                <p className="text-xs uppercase tracking-[0.3em] text-[#E4C992]">Shift Notes</p>
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-sm text-[#E9DDC9]">Next urgent count</p>
                    <p className="mt-1 text-lg font-semibold">
                      {criticalItems[0]?.itemName ?? "No critical items right now"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-[#6A5736] bg-[#342D21] px-4 py-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#E9DDC9]">Waiting to receive</span>
                      <span className="font-semibold">{receivingQueue.length}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-[#E9DDC9]">Ready to shelve</span>
                      <span className="font-semibold">{readyToShelve.length}</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <FiSend className="h-4 w-4 text-[#8A6A3D]" />
                  <h4 className="text-lg font-semibold text-[#2A241B]">Raise Shortage Request</h4>
                </div>
                <p className="mt-2 text-sm text-[#6B5C46]">
                  Staff should flag low stock and missing items here so the head can approve and source stock.
                </p>

                <div className="mt-5 grid gap-3">
                  <input
                    value={requestForm.itemName}
                    onChange={(event) =>
                      setRequestForm((prev) => ({ ...prev, itemName: event.target.value }))
                    }
                    placeholder="Item name"
                    className="h-11 rounded-lg border border-[#E0D5C3] bg-white px-3 text-sm text-[#2A241B] placeholder:text-[#8A7A62]"
                  />
                  <input
                    type="number"
                    value={requestForm.requestedQty}
                    onChange={(event) =>
                      setRequestForm((prev) => ({ ...prev, requestedQty: event.target.value }))
                    }
                    placeholder="Requested quantity"
                    className="h-11 rounded-lg border border-[#E0D5C3] bg-white px-3 text-sm text-[#2A241B] placeholder:text-[#8A7A62]"
                  />
                  <input
                    type="number"
                    value={requestForm.availableQty}
                    onChange={(event) =>
                      setRequestForm((prev) => ({ ...prev, availableQty: event.target.value }))
                    }
                    placeholder="Available quantity on shelf"
                    className="h-11 rounded-lg border border-[#E0D5C3] bg-white px-3 text-sm text-[#2A241B] placeholder:text-[#8A7A62]"
                  />
                  <textarea
                    value={requestForm.notes}
                    onChange={(event) =>
                      setRequestForm((prev) => ({ ...prev, notes: event.target.value }))
                    }
                    placeholder="What was checked, what is missing, any urgency?"
                    rows={4}
                    className="rounded-lg border border-[#E0D5C3] bg-white px-3 py-3 text-sm text-[#2A241B] placeholder:text-[#8A7A62]"
                  />
                  <button
                    onClick={() => void handleCreateRequest()}
                    disabled={mutationStatus === "loading"}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#2A241B] px-4 text-sm font-semibold text-[#F7F1E8] disabled:opacity-60"
                  >
                    <FiArrowRight className="h-4 w-4" />
                    Send To Inventory Head
                  </button>
                </div>
              </section>
            </div>
          </section>

          {status === "loading" && (
            <div className="flex items-center gap-3 rounded-lg border border-[#E4DCCF] bg-white/80 px-4 py-3 text-sm text-[#6B5C46]">
              <ClipLoader size={16} color="#6B5C46" />
              Refreshing inventory operations...
            </div>
          )}
        </div>
      </SectionShell>
    );
  }

  if (userLoading) {
    return <div className="p-6 text-sm text-[#6B5C46]">Loading inventory dashboard...</div>;
  }

  return (
    <SectionShell title="Inventory" subtitle="Operations Control">
      <div className="space-y-8">
        <section
          id="overview"
          className="scroll-mt-28 overflow-hidden rounded-lg border border-[#E4DCCF] bg-white/90 shadow-sm"
        >
          <div className="relative px-6 py-6">
            <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top_right,_rgba(210,173,104,0.22),_transparent_45%),radial-gradient(circle_at_left,_rgba(63,111,91,0.1),_transparent_35%)]" />
            <div className="relative flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.28em] text-[#8A7A62]">Inventory Head Workspace</p>
                <h3 className="mt-2 text-2xl font-semibold text-[#2A241B] sm:text-3xl">
                  Inventory Operations Dashboard
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#6B5C46]">
                  Track stock health, move requests through the pipeline, and keep vendor flow aligned
                  with the same polished control-room feel as the admin workspace.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[#E0D5C3] bg-[#F9F4EC] px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#6B5C46]">
                  {formatRoleLabel(role)}
                </span>
                <button
                  onClick={() => void refreshData()}
                  disabled={status === "loading"}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#E0D5C3] bg-white px-4 py-2 text-sm font-semibold text-[#2A241B] disabled:opacity-60"
                >
                  <FiRefreshCw className="h-4 w-4" />
                  {status === "loading" ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            </div>

            <div className="relative mt-5 grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-[#E4DCCF] bg-[#F9F4EC] px-4 py-3">
                <p className="text-xs uppercase tracking-[0.14em] text-[#8A7A62]">Critical Pressure</p>
                <p className="mt-2 text-2xl font-semibold text-[#2A241B]">{criticalItems.length}</p>
                <p className="mt-1 text-sm text-[#6B5C46]">Items already below threshold.</p>
              </div>
              <div className="rounded-lg border border-[#E4DCCF] bg-[#F9F4EC] px-4 py-3">
                <p className="text-xs uppercase tracking-[0.14em] text-[#8A7A62]">Pending Approval</p>
                <p className="mt-2 text-2xl font-semibold text-[#2A241B]">{pendingApproval.length}</p>
                <p className="mt-1 text-sm text-[#6B5C46]">Shortage requests waiting for a head decision.</p>
              </div>
              <div className="rounded-lg border border-[#E4DCCF] bg-[#F9F4EC] px-4 py-3">
                <p className="text-xs uppercase tracking-[0.14em] text-[#8A7A62]">Vendor Queue</p>
                <p className="mt-2 text-2xl font-semibold text-[#2A241B]">{pendingVendorAssignment.length}</p>
                <p className="mt-1 text-sm text-[#6B5C46]">Approved requests still waiting for vendor assignment.</p>
              </div>
            </div>
          </div>
        </section>

        {(error || mutationError || mutationSuccess) && (
          <section className="space-y-3">
            {error && (
              <div className="rounded-lg border border-[#F0D2C0] bg-[#FFF7F2] px-4 py-3 text-sm text-[#9B3F2C]">
                {error}
              </div>
            )}
            {mutationError && (
              <div className="rounded-lg border border-[#F0D2C0] bg-[#FFF7F2] px-4 py-3 text-sm text-[#9B3F2C]">
                {mutationError}
              </div>
            )}
            {mutationSuccess && (
              <div className="rounded-lg border border-[#CFE1D6] bg-[#F3FAF5] px-4 py-3 text-sm text-[#2F6A4A]">
                {mutationSuccess}
              </div>
            )}
          </section>
        )}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-[#E4DCCF] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-[#8A7A62]">Total Items</p>
              <FiGrid className="h-4 w-4 text-[#6B5C46]" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-[#2A241B]">{totals?.totalItems ?? 0}</p>
            <p className="mt-1 text-sm text-[#6B5C46]">Across raw and prepared stock.</p>
          </div>

          <div className="rounded-lg border border-[#E4DCCF] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-[#8A7A62]">Total Stock</p>
              <FiBox className="h-4 w-4 text-[#6B5C46]" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-[#2A241B]">{totals?.totalStock ?? 0}</p>
            <p className="mt-1 text-sm text-[#6B5C46]">Current counted units in system.</p>
          </div>

          <div className="rounded-lg border border-[#F0D2C0] bg-[#FFF7F2] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-[#9B6B55]">Low Stock</p>
              <FiAlertTriangle className="h-4 w-4 text-[#B85C38]" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-[#2A241B]">{lowStock.length}</p>
            <p className="mt-1 text-sm text-[#7A6255]">Needs attention before service impact.</p>
          </div>

          <div className="rounded-lg border border-[#D7E3DA] bg-[#F3FAF5] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-[#5A7568]">Requests Active</p>
              <FiTruck className="h-4 w-4 text-[#3F6F5B]" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-[#2A241B]">{openRequests.length}</p>
            <p className="mt-1 text-sm text-[#5D6F66]">Pipeline items still in motion.</p>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
          <div className="space-y-6">
            <section className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[#8A7A62]">Decision Console</p>
                  <h4 className="mt-1 text-xl font-semibold text-[#2A241B]">Approval and Escalation</h4>
                </div>
                <span className="rounded-full bg-[#F7F1E8] px-3 py-1 text-xs font-semibold text-[#6B5C46]">
                  {lowStock.length + reorder.length} signals
                </span>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-[#F1D8C7] bg-[#FFF7F2] p-4">
                  <div className="flex items-center gap-2">
                    <FiAlertTriangle className="h-4 w-4 text-[#B85C38]" />
                    <h5 className="font-semibold text-[#2A241B]">Low Stock Priority</h5>
                  </div>
                  <div className="mt-4 space-y-3">
                    {!lowStock.length && (
                      <p className="text-sm text-[#8A7A62]">No immediate low-stock issues.</p>
                    )}
                    {lowStock.slice(0, 5).map((item) => (
                      <div
                        key={`low-${item._id}`}
                        className="rounded-lg border border-[#F1D8C7] bg-white px-3 py-3 text-sm"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-medium text-[#2A241B]">{item.itemName}</span>
                          <span className="rounded-full bg-[#FCE2D9] px-2 py-1 text-xs font-semibold text-[#9B3F2C]">
                            {item.quantity} {item.unit ?? ""}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-[#8A7A62]">
                          Threshold {item.lowStockThreshold ?? 0}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-[#E7DED0] bg-[#FCFAF6] p-4">
                  <div className="flex items-center gap-2">
                    <FiClock className="h-4 w-4 text-[#6B5C46]" />
                    <h5 className="font-semibold text-[#2A241B]">Reorder Watchlist</h5>
                  </div>
                  <div className="mt-4 space-y-3">
                    {!reorder.length && (
                      <p className="text-sm text-[#8A7A62]">No reorder watch items.</p>
                    )}
                    {reorder.slice(0, 5).map((item) => (
                      <div
                        key={`reorder-${item._id}`}
                        className="rounded-lg border border-[#E7DED0] bg-white px-3 py-3 text-sm"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-medium text-[#2A241B]">{item.itemName}</span>
                          <span className="rounded-full bg-[#F7F1E8] px-2 py-1 text-xs font-semibold text-[#6B5C46]">
                            {item.quantity} {item.unit ?? ""}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-[#8A7A62]">
                          Near threshold {item.lowStockThreshold ?? 0}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <div id="stock-control" className="scroll-mt-28">
              {renderInventoryGroup("Raw Inventory", "Stock Ledger", rawItems)}
            </div>
            {renderInventoryGroup("Prepared Inventory", "Ready Stock", preparedItems)}

            <section
              id="request-flow"
              className="scroll-mt-28 rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[#8A7A62]">Request Pipeline</p>
                  <h4 className="mt-1 text-xl font-semibold text-[#2A241B]">Inventory Requests</h4>
                </div>
                <span className="rounded-full bg-[#F7F1E8] px-3 py-1 text-xs font-semibold text-[#6B5C46]">
                  {requests.length} total
                </span>
              </div>

              <div className="mt-5 space-y-4">
                {!requests.length && (
                  <div className="rounded-lg border border-dashed border-[#E4DCCF] bg-[#FCFAF6] px-4 py-5 text-sm text-[#8A7A62]">
                    No inventory requests found.
                  </div>
                )}

                {requests.map((req) => (
                  <div key={req._id} className="rounded-xl border border-[#E7DED0] bg-[#FCFAF6] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h5 className="text-base font-semibold text-[#2A241B]">{req.itemName}</h5>
                          <span
                            className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${getStatusClasses(
                              req.status
                            )}`}
                          >
                            {formatRequestStatus(req.status)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-[#6B5C46]">
                          Requested <span className="font-semibold text-[#2A241B]">{req.requestedQty}</span>
                          <span className="mx-2 text-[#B8AA94]">|</span>
                          Available <span className="font-semibold text-[#2A241B]">{req.availableQty}</span>
                          <span className="mx-2 text-[#B8AA94]">|</span>
                          Source <span className="font-semibold capitalize text-[#2A241B]">{req.source}</span>
                        </p>
                      </div>
                      <div className="rounded-lg bg-white px-3 py-2 shadow-sm">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-[#8A7A62]">Vendor</p>
                        <p className="mt-1 text-sm font-semibold text-[#2A241B]">
                          {req.assignedVendorId?.name ?? "-"}
                        </p>
                      </div>
                    </div>

                    {(req.notes || req.eta) && (
                      <div className="mt-3 rounded-lg border border-[#E7DED0] bg-white px-3 py-3 text-sm text-[#6B5C46]">
                        {req.notes && <p>Notes: {req.notes}</p>}
                        {req.eta && <p className={req.notes ? "mt-1" : ""}>ETA: {req.eta}</p>}
                      </div>
                    )}

                    {renderRequestActions(req)}
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
              <section className="rounded-lg border border-[#D6B26E] bg-[#2A241B] p-6 text-[#F7F1E8] shadow-lg">
              <p className="text-xs uppercase tracking-[0.3em] text-[#E4C992]">Control Priorities</p>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-sm text-[#E9DDC9]">Most urgent now</p>
                  <p className="mt-1 text-lg font-semibold">
                    {criticalItems[0]?.itemName ?? "No critical items right now"}
                  </p>
                </div>
                <div className="rounded-lg border border-[#6A5736] bg-[#342D21] px-4 py-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#E9DDC9]">Critical items</span>
                    <span className="font-semibold">{criticalItems.length}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-[#E9DDC9]">In transit</span>
                    <span className="font-semibold">{inTransitRequests.length}</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <FiPlus className="h-4 w-4 text-[#8A6A3D]" />
                <h4 className="text-lg font-semibold text-[#2A241B]">
                  {editingItemId ? "Update Inventory Item" : "Add Inventory Item"}
                </h4>
              </div>
              <p className="mt-2 text-sm text-[#6B5C46]">
                Keep item records clean and accurate across raw and prepared stock.
              </p>

              <div className="mt-5 grid gap-3">
                <input
                  value={itemForm.itemName}
                  onChange={(event) =>
                    setItemForm((prev) => ({ ...prev, itemName: event.target.value }))
                  }
                  placeholder="Item name"
                  className="h-11 rounded-lg border border-[#E0D5C3] bg-white px-3 text-sm text-[#2A241B] placeholder:text-[#8A7A62]"
                />
                <select
                  value={itemForm.itemType}
                  onChange={(event) => {
                    const nextType = event.target.value as "raw" | "prepared";
                    setItemForm((prev) => ({
                      ...prev,
                      itemType: nextType,
                      unit: nextType === "prepared" ? "portion" : "kg",
                      price: nextType === "prepared" ? prev.price : "",
                    }));
                  }}
                  className="h-11 rounded-lg border border-[#E0D5C3] bg-white px-3 text-sm text-[#2A241B]"
                >
                  <option value="raw">Raw</option>
                  <option value="prepared">Prepared</option>
                </select>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="number"
                    value={itemForm.quantity}
                    onChange={(event) =>
                      setItemForm((prev) => ({ ...prev, quantity: event.target.value }))
                    }
                    placeholder="Quantity"
                    className="h-11 rounded-lg border border-[#E0D5C3] bg-white px-3 text-sm text-[#2A241B] placeholder:text-[#8A7A62]"
                  />
                  <select
                    value={itemForm.unit}
                    onChange={(event) =>
                      setItemForm((prev) => ({ ...prev, unit: event.target.value }))
                    }
                    className="h-11 rounded-lg border border-[#E0D5C3] bg-white px-3 text-sm text-[#2A241B]"
                  >
                    {formUnits.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
                {itemForm.itemType === "prepared" && (
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={itemForm.price}
                    onChange={(event) =>
                      setItemForm((prev) => ({ ...prev, price: event.target.value }))
                    }
                    placeholder="Price"
                    className="h-11 rounded-lg border border-[#E0D5C3] bg-white px-3 text-sm text-[#2A241B] placeholder:text-[#8A7A62]"
                  />
                )}
                <input
                  type="number"
                  value={itemForm.lowStockThreshold}
                  onChange={(event) =>
                    setItemForm((prev) => ({ ...prev, lowStockThreshold: event.target.value }))
                  }
                  placeholder="Low stock threshold"
                  className="h-11 rounded-lg border border-[#E0D5C3] bg-white px-3 text-sm text-[#2A241B] placeholder:text-[#8A7A62]"
                />
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => void handleSaveItem()}
                    disabled={mutationStatus === "loading"}
                    className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#2A241B] px-4 text-sm font-semibold text-[#F7F1E8] disabled:opacity-60"
                  >
                    <FiPlus className="h-4 w-4" />
                    {editingItemId ? "Update Item" : "Add Item"}
                  </button>
                  {editingItemId && (
                    <button
                      onClick={resetItemForm}
                      className="inline-flex h-11 items-center gap-2 rounded-lg border border-[#D9CCB7] bg-white px-4 text-sm font-semibold text-[#6B5C46]"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <FiSend className="h-4 w-4 text-[#8A6A3D]" />
                  <h4 className="text-lg font-semibold text-[#2A241B]">Raise Strategic Procurement Request</h4>
                </div>
                <p className="mt-2 text-sm text-[#6B5C46]">
                Use this when stock needs escalation, planned replenishment, or a sourcing decision from the head side.
                </p>

              <div className="mt-5 grid gap-3">
                <input
                  value={requestForm.itemName}
                  onChange={(event) =>
                    setRequestForm((prev) => ({ ...prev, itemName: event.target.value }))
                  }
                  placeholder="Item name"
                  className="h-11 rounded-lg border border-[#E0D5C3] bg-white px-3 text-sm text-[#2A241B] placeholder:text-[#8A7A62]"
                />
                <input
                  type="number"
                  value={requestForm.requestedQty}
                  onChange={(event) =>
                    setRequestForm((prev) => ({ ...prev, requestedQty: event.target.value }))
                  }
                  placeholder="Requested quantity"
                  className="h-11 rounded-lg border border-[#E0D5C3] bg-white px-3 text-sm text-[#2A241B] placeholder:text-[#8A7A62]"
                />
                <input
                  type="number"
                  value={requestForm.availableQty}
                  onChange={(event) =>
                    setRequestForm((prev) => ({ ...prev, availableQty: event.target.value }))
                  }
                  placeholder="Available quantity (optional)"
                  className="h-11 rounded-lg border border-[#E0D5C3] bg-white px-3 text-sm text-[#2A241B] placeholder:text-[#8A7A62]"
                />
                <textarea
                  value={requestForm.notes}
                  onChange={(event) =>
                    setRequestForm((prev) => ({ ...prev, notes: event.target.value }))
                  }
                  placeholder="Notes for the team"
                  rows={4}
                  className="rounded-lg border border-[#E0D5C3] bg-white px-3 py-3 text-sm text-[#2A241B] placeholder:text-[#8A7A62]"
                />
                <button
                  onClick={() => void handleCreateRequest()}
                  disabled={mutationStatus === "loading"}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#2A241B] px-4 text-sm font-semibold text-[#F7F1E8] disabled:opacity-60"
                >
                  <FiArrowRight className="h-4 w-4" />
                  Create Request
                </button>
              </div>
            </section>

            <section className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[#8A7A62]">Recent Motion</p>
                  <h4 className="mt-1 text-lg font-semibold text-[#2A241B]">Latest Requests</h4>
                </div>
                <span className="rounded-full bg-[#F7F1E8] px-3 py-1 text-xs font-semibold text-[#6B5C46]">
                  {recentRequests.length}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {!recentRequests.length && (
                  <p className="text-sm text-[#8A7A62]">No request activity yet.</p>
                )}
                {recentRequests.map((req) => (
                  <div
                    key={`recent-${req._id}`}
                    className="rounded-lg border border-[#EEE4D5] bg-[#F9F4EC] px-3 py-3 text-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-[#2A241B]">{req.itemName}</span>
                      <span
                        className={`rounded-full border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] ${getStatusClasses(
                          req.status
                        )}`}
                      >
                        {formatRequestStatus(req.status)}
                      </span>
                    </div>
                    <p className="mt-2 text-[#6B5C46]">
                      Qty {req.requestedQty} • Source {req.source}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>

        {status === "loading" && (
          <div className="flex items-center gap-3 rounded-lg border border-[#E4DCCF] bg-white/80 px-4 py-3 text-sm text-[#6B5C46]">
            <ClipLoader size={16} color="#6B5C46" />
            Refreshing inventory dashboard...
          </div>
        )}
      </div>
    </SectionShell>
  );
};

export default InventoryDashboard;
