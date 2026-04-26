import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiPackage,
  FiPlus,
  FiRefreshCw,
  FiShoppingCart,
  FiTruck,
} from "react-icons/fi";
import useCurrentUser from "../../customhooks/useCurrentUser";
import {
  createPosOrder,
  fulfillInventoryRequest,
  getInventoryRequests,
  getMenuItems,
  getOrders,
  type InventoryRequest,
  type MenuItem,
  type OrderItem,
  type PosOrder,
} from "../../services/adminService";

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

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return error instanceof Error ? error.message : "Something went wrong.";
};

const formatCurrency = (value: number) => `Rs ${value.toLocaleString("en-IN")}`;

type CartLine = OrderItem;

const CashierPOS = () => {
  const { user } = useCurrentUser();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<PosOrder[]>([]);
  const [requests, setRequests] = useState<InventoryRequest[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "upi">("cash");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [fulfillingId, setFulfillingId] = useState<string | null>(null);

  const loadDashboard = async (mode: "initial" | "refresh" = "initial") => {
    if (mode === "initial") {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      setError(null);
      const [menu, posOrders, inventoryRequests] = await Promise.all([
        getMenuItems(),
        getOrders(),
        getInventoryRequests({ status: "all" }),
      ]);

      setMenuItems(menu.filter((item) => item.isAvailable !== false));
      setOrders(posOrders);
      setRequests(inventoryRequests.filter((request) => request.source === "pos_order"));
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  const addToCart = (item: MenuItem) => {
    setCart((current) => {
      const existing = current.find((line) => line.name === item.name);
      if (existing) {
        return current.map((line) =>
          line.name === item.name
            ? { ...line, quantity: line.quantity + 1 }
            : line
        );
      }

      return [
        ...current,
        {
          name: item.name,
          quantity: 1,
          price: item.price,
        },
      ];
    });
  };

  const updateQuantity = (itemName: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((current) => current.filter((line) => line.name !== itemName));
      return;
    }

    setCart((current) =>
      current.map((line) =>
        line.name === itemName ? { ...line, quantity } : line
      )
    );
  };

  const cartTotal = useMemo(
    () => cart.reduce((sum, line) => sum + line.quantity * line.price, 0),
    [cart]
  );

  const posRequests = useMemo(
    () =>
      requests.filter((request) =>
        request.source === "pos_order"
      ),
    [requests]
  );

  const activeRequests = useMemo(
    () =>
      posRequests.filter(
        (request) => !["closed", "cancelled"].includes(request.status)
      ),
    [posRequests]
  );

  const placeOrder = async () => {
    if (!cart.length) {
      setSubmitError("Please add at least one item to the bill.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      await createPosOrder({
        items: cart,
        paymentMethod,
      });

      setCart([]);
      setSubmitSuccess("Bill created successfully.");
      await loadDashboard("refresh");
    } catch (orderError) {
      setSubmitError(getErrorMessage(orderError));
      await loadDashboard("refresh");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFulfillRequest = async (requestId: string) => {
    setFulfillingId(requestId);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      await fulfillInventoryRequest(requestId, "Marked fulfilled from cashier bill flow.");
      setSubmitSuccess("Inventory request marked as fulfilled.");
      await loadDashboard("refresh");
    } catch (requestError) {
      setSubmitError(getErrorMessage(requestError));
    } finally {
      setFulfillingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F1E8] px-4 py-6 text-[#1C1B16] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-[#E0D5C3] bg-[linear-gradient(135deg,#2A241B_0%,#4D3A22_100%)] px-6 py-6 text-[#F7F1E8] shadow-xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#E4C992]">
                Cashier Bill Flow
              </p>
              <h1 className="mt-2 text-3xl font-semibold">POS and Inventory Request Desk</h1>
              <p className="mt-2 max-w-2xl text-sm text-[#E9DDC9]">
                Create bills here. If stock runs short, inventory requests raised from POS stay visible here with vendor assignment and status updates.
              </p>
            </div>
            <div className="rounded-2xl border border-[#6A5736] bg-[#342D21] px-4 py-3 text-sm">
              <p className="text-[#E9DDC9]">Logged in as</p>
              <p className="mt-1 text-lg font-semibold">{user?.name ?? "Cashier"}</p>
              <p className="mt-1 text-[#E9DDC9] capitalize">{user?.role ?? "cashier"}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[#E4DCCF] bg-white/90 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-[#8A7A62]">Menu Items</p>
              <FiPackage className="h-4 w-4 text-[#6B5C46]" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-[#2A241B]">{menuItems.length}</p>
          </div>
          <div className="rounded-2xl border border-[#F0D2C0] bg-[#FFF7F2] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-[#9B6B55]">Active POS Requests</p>
              <FiAlertTriangle className="h-4 w-4 text-[#B85C38]" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-[#2A241B]">{activeRequests.length}</p>
          </div>
          <div className="rounded-2xl border border-[#D7E3DA] bg-[#F3FAF5] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-[#5A7568]">Recent Bills</p>
              <FiShoppingCart className="h-4 w-4 text-[#3F6F5B]" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-[#2A241B]">{orders.length}</p>
          </div>
        </section>

        {(submitError || submitSuccess || error) && (
          <section className="space-y-3">
            {error && (
              <div className="rounded-2xl border border-[#E6CAC3] bg-[#FFF2EE] px-4 py-3 text-sm text-[#9B3F2C]">
                {error}
              </div>
            )}
            {submitError && (
              <div className="rounded-2xl border border-[#E6CAC3] bg-[#FFF2EE] px-4 py-3 text-sm text-[#9B3F2C]">
                {submitError}
              </div>
            )}
            {submitSuccess && (
              <div className="rounded-2xl border border-[#C8DCCF] bg-[#EEF7F0] px-4 py-3 text-sm text-[#2F6A4A]">
                {submitSuccess}
              </div>
            )}
          </section>
        )}

        <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[#8A7A62]">Order Builder</p>
                  <h2 className="mt-1 text-2xl font-semibold text-[#2A241B]">Create Bill</h2>
                </div>
                <button
                  onClick={() => void loadDashboard("refresh")}
                  disabled={refreshing}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#D9CCB7] bg-white px-4 py-2 text-sm font-semibold text-[#6B5C46] disabled:opacity-60"
                >
                  <FiRefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {menuItems.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => addToCart(item)}
                    className="rounded-2xl border border-[#E7DED0] bg-[#FCFAF6] p-4 text-left transition hover:border-[#D6B26E] hover:bg-[#FFF8ED]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-[#2A241B]">{item.name}</h3>
                        <p className="mt-1 text-sm text-[#6B5C46]">{item.category ?? "General"}</p>
                      </div>
                      <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-[#6B5C46]">
                        {formatCurrency(item.price)}
                      </span>
                    </div>
                    {item.description && (
                      <p className="mt-3 line-clamp-2 text-sm text-[#8A7A62]">{item.description}</p>
                    )}
                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#8A6A3D]">
                      <FiPlus className="h-4 w-4" />
                      Add to bill
                    </div>
                  </button>
                ))}

                {!loading && !menuItems.length && (
                  <div className="rounded-2xl border border-dashed border-[#E4DCCF] bg-[#FCFAF6] p-6 text-sm text-[#8A7A62]">
                    No menu items available for billing.
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[#8A7A62]">POS Request Tracker</p>
                  <h2 className="mt-1 text-2xl font-semibold text-[#2A241B]">Inventory Request Status</h2>
                </div>
                <span className="rounded-full bg-[#F7F1E8] px-3 py-1 text-xs font-semibold text-[#6B5C46]">
                  {posRequests.length} requests
                </span>
              </div>

              <div className="mt-5 space-y-4">
                {posRequests.map((request) => (
                  <div key={request._id} className="rounded-2xl border border-[#E7DED0] bg-[#FCFAF6] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold text-[#2A241B]">{request.itemName}</h3>
                          <span
                            className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${getStatusClasses(
                              request.status
                            )}`}
                          >
                            {formatRequestStatus(request.status)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-[#6B5C46]">
                          Required <span className="font-semibold text-[#2A241B]">{request.requestedQty}</span>
                          <span className="mx-2 text-[#B8AA94]">|</span>
                          Available <span className="font-semibold text-[#2A241B]">{request.availableQty}</span>
                        </p>
                      </div>
                      <div className="rounded-xl bg-white px-3 py-2 text-right shadow-sm">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-[#8A7A62]">Vendor</p>
                        <p className="mt-1 text-sm font-semibold text-[#2A241B]">
                          {request.assignedVendorId?.name ?? "Waiting"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      <div className="rounded-xl border border-[#EEE4D5] bg-white px-3 py-3 text-sm">
                        <p className="text-xs uppercase tracking-[0.16em] text-[#8A7A62]">Assigned</p>
                        <p className="mt-1 font-medium text-[#2A241B]">
                          {request.assignedVendorId?.email ?? "Not assigned yet"}
                        </p>
                      </div>
                      <div className="rounded-xl border border-[#EEE4D5] bg-white px-3 py-3 text-sm">
                        <p className="text-xs uppercase tracking-[0.16em] text-[#8A7A62]">ETA</p>
                        <p className="mt-1 font-medium text-[#2A241B]">
                          {request.eta ? new Date(request.eta).toLocaleString("en-IN") : "Pending"}
                        </p>
                      </div>
                      <div className="rounded-xl border border-[#EEE4D5] bg-white px-3 py-3 text-sm">
                        <p className="text-xs uppercase tracking-[0.16em] text-[#8A7A62]">Source</p>
                        <p className="mt-1 font-medium capitalize text-[#2A241B]">
                          {request.source.replaceAll("_", " ")}
                        </p>
                      </div>
                    </div>

                    {request.notes && (
                      <div className="mt-3 rounded-xl border border-[#EEE4D5] bg-white px-3 py-3 text-sm text-[#6B5C46]">
                        {request.notes}
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-[#6B5C46]">
                        {request.status === "requested" && <FiClock className="h-3.5 w-3.5" />}
                        {request.status === "vendor_assigned" && <FiTruck className="h-3.5 w-3.5" />}
                        {request.status === "received" && <FiPackage className="h-3.5 w-3.5" />}
                        {["fulfilled", "closed"].includes(request.status) && (
                          <FiCheckCircle className="h-3.5 w-3.5" />
                        )}
                        Cashier visibility active
                      </div>
                      {request.status === "received" && (
                        <button
                          onClick={() => void handleFulfillRequest(request._id)}
                          disabled={fulfillingId === request._id}
                          className="inline-flex items-center gap-2 rounded-lg bg-[#2A241B] px-4 py-2 text-sm font-semibold text-[#F7F1E8] disabled:opacity-60"
                        >
                          <FiCheckCircle className="h-4 w-4" />
                          {fulfillingId === request._id ? "Updating..." : "Mark Fulfilled"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {!loading && !posRequests.length && (
                  <div className="rounded-2xl border border-dashed border-[#E4DCCF] bg-[#FCFAF6] px-4 py-5 text-sm text-[#8A7A62]">
                    No POS shortage requests yet.
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl border border-[#D6B26E] bg-[#2A241B] p-6 text-[#F7F1E8] shadow-lg">
              <p className="text-xs uppercase tracking-[0.3em] text-[#E4C992]">Current Bill</p>
              <div className="mt-4 space-y-3">
                {!cart.length && <p className="text-sm text-[#E9DDC9]">Add menu items to start billing.</p>}
                {cart.map((line) => (
                  <div key={line.name} className="rounded-xl border border-[#6A5736] bg-[#342D21] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{line.name}</p>
                        <p className="mt-1 text-sm text-[#E9DDC9]">{formatCurrency(line.price)} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(line.name, line.quantity - 1)}
                          className="h-8 w-8 rounded-full border border-[#6A5736] text-sm"
                        >
                          -
                        </button>
                        <span className="min-w-[24px] text-center font-semibold">{line.quantity}</span>
                        <button
                          onClick={() => updateQuantity(line.name, line.quantity + 1)}
                          className="h-8 w-8 rounded-full border border-[#6A5736] text-sm"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-[#E9DDC9]">
                      <span>Line total</span>
                      <span className="font-semibold text-[#F7F1E8]">
                        {formatCurrency(line.quantity * line.price)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-xl border border-[#6A5736] bg-[#342D21] p-4">
                <label className="block text-sm text-[#E9DDC9]">
                  Payment Method
                  <select
                    value={paymentMethod}
                    onChange={(event) =>
                      setPaymentMethod(event.target.value as "cash" | "card" | "upi")
                    }
                    className="mt-2 w-full rounded-lg border border-[#6A5736] bg-[#2A241B] px-3 py-2 text-[#F7F1E8]"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                  </select>
                </label>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-[#6A5736] pt-4">
                <span className="text-sm text-[#E9DDC9]">Bill Total</span>
                <span className="text-2xl font-semibold">{formatCurrency(cartTotal)}</span>
              </div>

              <button
                onClick={() => void placeOrder()}
                disabled={submitting || !cart.length}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#E4C992] px-4 py-3 text-sm font-semibold text-[#2A241B] disabled:opacity-60"
              >
                <FiShoppingCart className="h-4 w-4" />
                {submitting ? "Processing Bill..." : "Place Bill"}
              </button>
            </section>

            <section className="rounded-2xl border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[#8A7A62]">Recent Bills</p>
                  <h2 className="mt-1 text-xl font-semibold text-[#2A241B]">Completed POS Orders</h2>
                </div>
                <span className="rounded-full bg-[#F7F1E8] px-3 py-1 text-xs font-semibold text-[#6B5C46]">
                  {orders.length}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {orders.slice(0, 6).map((order) => (
                  <div key={order._id} className="rounded-xl border border-[#EEE4D5] bg-[#F9F4EC] px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[#2A241B]">{formatCurrency(order.totalAmount)}</p>
                        <p className="mt-1 text-sm text-[#6B5C46]">
                          {(order.items ?? []).map((item) => `${item.name} x${item.quantity}`).join(", ")}
                        </p>
                      </div>
                      <div className="text-right text-sm text-[#6B5C46]">
                        <p className="capitalize">{order.paymentMethod ?? "cash"}</p>
                        <p className="mt-1">{order.createdAt ? new Date(order.createdAt).toLocaleString("en-IN") : "-"}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {!loading && !orders.length && (
                  <p className="text-sm text-[#8A7A62]">No POS bills created yet.</p>
                )}
              </div>
            </section>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CashierPOS;
