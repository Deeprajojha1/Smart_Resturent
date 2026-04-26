import mongoose from "mongoose";
import type { Role } from "../constants/roles";
import Inventory from "../models/Inventory.model";
import InventoryRequest, {
  type IInventoryRequest,
  type InventoryRequestStatus,
} from "../models/InventoryRequest.model";
import User from "../models/User.model";

type Requester = {
  id: string;
};

type RequesterContext = {
  id: string;
  role: Role;
  restaurantId: mongoose.Types.ObjectId;
};

type InventoryRequestError = Error & { statusCode?: number };

type CreateInventoryRequestInput = {
  itemName: string;
  requestedQty: number;
  availableQty?: number;
  source?: "pos_order" | "manual";
  sourceOrderId?: string;
  notes?: string;
};

type InventoryRequestQuery = {
  status?: InventoryRequestStatus;
};

type ShortageItem = {
  itemName: string;
  requiredQty: number;
  availableQty: number;
};

const OPEN_REQUEST_STATUSES: InventoryRequestStatus[] = [
  "requested",
  "approved",
  "vendor_assigned",
  "dispatched",
];

const INVENTORY_HEAD_ROLES: Role[] = ["inventory_head", "manager", "admin"];
const INVENTORY_RECEIVE_ROLES: Role[] = [
  "inventory",
  "inventory_head",
  "manager",
  "admin",
];
const INVENTORY_FULFILL_ROLES: Role[] = [
  "cashier",
  "inventory",
  "inventory_head",
  "manager",
  "admin",
];

const throwRoleError = (message: string) => {
  const error: InventoryRequestError = new Error(message);
  error.statusCode = 403;
  throw error;
};

const getRequesterContext = async (requesterId: string): Promise<RequesterContext> => {
  const user = await User.findById(requesterId).select("role restaurantId");

  if (!user) {
    const error: InventoryRequestError = new Error("Requester not found.");
    error.statusCode = 404;
    throw error;
  }

  if (!user.restaurantId) {
    const error: InventoryRequestError = new Error("Restaurant not found for user.");
    error.statusCode = 404;
    throw error;
  }

  return {
    id: requesterId,
    role: user.role,
    restaurantId: user.restaurantId,
  };
};

const appendTimeline = (
  request: IInventoryRequest,
  status: InventoryRequestStatus,
  changedBy: string,
  note?: string
) => {
  request.timeline.push({
    status,
    changedBy: new mongoose.Types.ObjectId(changedBy),
    note,
    changedAt: new Date(),
  });
};

const assertStatus = (
  request: IInventoryRequest,
  allowed: InventoryRequestStatus[],
  message: string
) => {
  if (!allowed.includes(request.status)) {
    const error: InventoryRequestError = new Error(message);
    error.statusCode = 409;
    throw error;
  }
};

const getRequestForRestaurant = async (
  requestId: string,
  requester: RequesterContext
) => {
  const request = await InventoryRequest.findOne({
    _id: requestId,
    restaurantId: requester.restaurantId,
  });

  if (!request) {
    const error: InventoryRequestError = new Error("Inventory request not found.");
    error.statusCode = 404;
    throw error;
  }

  return request;
};

export const createInventoryRequestService = async (
  data: CreateInventoryRequestInput,
  requester: Requester
) => {
  const context = await getRequesterContext(requester.id);

  if (!data.itemName?.trim()) {
    const error: InventoryRequestError = new Error("itemName is required.");
    error.statusCode = 400;
    throw error;
  }

  if (!Number.isFinite(data.requestedQty) || data.requestedQty <= 0) {
    const error: InventoryRequestError = new Error("requestedQty must be greater than zero.");
    error.statusCode = 400;
    throw error;
  }

  const itemName = data.itemName.trim();

  const existingOpen = await InventoryRequest.findOne({
    restaurantId: context.restaurantId,
    itemName,
    status: { $in: OPEN_REQUEST_STATUSES },
  }).sort({ createdAt: -1 });

  if (existingOpen) {
    existingOpen.requestedQty += data.requestedQty;
    existingOpen.availableQty = Math.min(
      existingOpen.availableQty,
      Math.max(0, data.availableQty ?? existingOpen.availableQty)
    );
    appendTimeline(
      existingOpen,
      existingOpen.status,
      context.id,
      "Shortage merged into existing open request."
    );
    await existingOpen.save();
    return existingOpen;
  }

  const request = await InventoryRequest.create({
    restaurantId: context.restaurantId,
    itemName,
    requestedQty: data.requestedQty,
    availableQty: Math.max(0, data.availableQty ?? 0),
    source: data.source ?? "manual",
    sourceOrderId: data.sourceOrderId,
    requestedBy: context.id,
    notes: data.notes?.trim(),
    status: "requested",
    timeline: [
      {
        status: "requested",
        changedBy: context.id,
        note: data.notes?.trim() ?? "Request created.",
        changedAt: new Date(),
      },
    ],
  });

  return request;
};

export const raiseInventoryRequestsFromShortages = async (
  shortages: ShortageItem[],
  requester: Requester
) => {
  const requests: IInventoryRequest[] = [];

  for (const shortage of shortages) {
    const missingQty = shortage.requiredQty - shortage.availableQty;
    if (missingQty <= 0) {
      continue;
    }

    const request = await createInventoryRequestService(
      {
        itemName: shortage.itemName,
        requestedQty: missingQty,
        availableQty: shortage.availableQty,
        source: "pos_order",
        notes: "Auto-raised from POS due to insufficient stock.",
      },
      requester
    );

    requests.push(request);
  }

  return requests;
};

export const getInventoryRequestsService = async (
  requester: Requester,
  query: InventoryRequestQuery = {}
) => {
  const context = await getRequesterContext(requester.id);

  const filter: Record<string, unknown> = {
    restaurantId: context.restaurantId,
  };

  if (query.status) {
    filter.status = query.status;
  }

  if (context.role === "vendor") {
    filter.assignedVendorId = context.id;
  }

  return InventoryRequest.find(filter)
    .populate("requestedBy", "name email role")
    .populate("assignedVendorId", "name email role")
    .populate("timeline.changedBy", "name email role")
    .sort({ createdAt: -1 });
};

export const approveInventoryRequestService = async (
  requestId: string,
  requester: Requester,
  note?: string
) => {
  const context = await getRequesterContext(requester.id);

  if (!INVENTORY_HEAD_ROLES.includes(context.role)) {
    throwRoleError("Only inventory head, manager, or admin can approve requests.");
  }

  const request = await getRequestForRestaurant(requestId, context);
  assertStatus(request, ["requested"], "Only requested items can be approved.");

  request.status = "approved";
  appendTimeline(request, "approved", context.id, note?.trim() || "Approved.");

  await request.save();
  return request;
};

export const assignVendorToInventoryRequestService = async (
  requestId: string,
  vendorId: string,
  eta: string | undefined,
  requester: Requester,
  note?: string
) => {
  const context = await getRequesterContext(requester.id);

  if (!INVENTORY_HEAD_ROLES.includes(context.role)) {
    throwRoleError("Only inventory head, manager, or admin can assign vendors.");
  }

  const request = await getRequestForRestaurant(requestId, context);
  assertStatus(
    request,
    ["approved", "vendor_assigned"],
    "Vendor can be assigned only after approval."
  );

  const vendor = await User.findOne({
    _id: vendorId,
    role: "vendor",
    restaurantId: context.restaurantId,
  }).select("_id");

  if (!vendor) {
    const error: InventoryRequestError = new Error(
      "Vendor not found for this restaurant."
    );
    error.statusCode = 404;
    throw error;
  }

  request.assignedVendorId = vendor._id;

  if (eta) {
    const etaDate = new Date(eta);
    if (Number.isNaN(etaDate.getTime())) {
      const error: InventoryRequestError = new Error("Invalid ETA date.");
      error.statusCode = 400;
      throw error;
    }
    request.eta = etaDate;
  }

  request.status = "vendor_assigned";
  appendTimeline(
    request,
    "vendor_assigned",
    context.id,
    note?.trim() || "Vendor assigned."
  );

  await request.save();
  return request;
};

export const markInventoryRequestDispatchedService = async (
  requestId: string,
  requester: Requester,
  note?: string
) => {
  const context = await getRequesterContext(requester.id);
  const request = await getRequestForRestaurant(requestId, context);

  assertStatus(
    request,
    ["vendor_assigned"],
    "Only vendor-assigned requests can be marked as dispatched."
  );

  const isAssignedVendor =
    request.assignedVendorId &&
    String(request.assignedVendorId) === context.id &&
    context.role === "vendor";
  const canOverride = INVENTORY_HEAD_ROLES.includes(context.role);

  if (!isAssignedVendor && !canOverride) {
    throwRoleError(
      "Only assigned vendor or inventory head/manager/admin can mark dispatch."
    );
  }

  request.status = "dispatched";
  appendTimeline(
    request,
    "dispatched",
    context.id,
    note?.trim() || "Marked as dispatched."
  );

  await request.save();
  return request;
};

export const markInventoryRequestReceivedService = async (
  requestId: string,
  requester: Requester,
  receivedQty?: number,
  note?: string
) => {
  const context = await getRequesterContext(requester.id);

  if (!INVENTORY_RECEIVE_ROLES.includes(context.role)) {
    throwRoleError(
      "Only inventory staff/head, manager, or admin can mark received."
    );
  }

  const request = await getRequestForRestaurant(requestId, context);
  assertStatus(
    request,
    ["dispatched", "vendor_assigned"],
    "Only dispatched/vendor-assigned requests can be marked as received."
  );

  const quantityToAdd = Number.isFinite(receivedQty) && (receivedQty as number) > 0
    ? Number(receivedQty)
    : request.requestedQty;

  const inventoryItem = await Inventory.findOne({
    restaurantId: context.restaurantId,
    itemName: request.itemName,
  });

  if (inventoryItem) {
    inventoryItem.quantity += quantityToAdd;
    await inventoryItem.save();
  } else {
    await Inventory.create({
      restaurantId: context.restaurantId,
      itemName: request.itemName,
      quantity: quantityToAdd,
      unit: "unit",
      lowStockThreshold: 0,
    });
  }

  request.status = "received";
  appendTimeline(
    request,
    "received",
    context.id,
    note?.trim() || `Received quantity: ${quantityToAdd}.`
  );

  await request.save();
  return request;
};

export const markInventoryRequestFulfilledService = async (
  requestId: string,
  requester: Requester,
  note?: string
) => {
  const context = await getRequesterContext(requester.id);

  if (!INVENTORY_FULFILL_ROLES.includes(context.role)) {
    throwRoleError("You are not allowed to mark this request as fulfilled.");
  }

  const request = await getRequestForRestaurant(requestId, context);
  assertStatus(request, ["received"], "Only received requests can be fulfilled.");

  request.status = "fulfilled";
  appendTimeline(
    request,
    "fulfilled",
    context.id,
    note?.trim() || "Request fulfilled."
  );

  await request.save();
  return request;
};

export const closeInventoryRequestService = async (
  requestId: string,
  requester: Requester,
  note?: string
) => {
  const context = await getRequesterContext(requester.id);

  if (!INVENTORY_HEAD_ROLES.includes(context.role)) {
    throwRoleError("Only inventory head, manager, or admin can close requests.");
  }

  const request = await getRequestForRestaurant(requestId, context);
  assertStatus(
    request,
    ["fulfilled", "received", "cancelled"],
    "Only fulfilled/received/cancelled requests can be closed."
  );

  request.status = "closed";
  appendTimeline(request, "closed", context.id, note?.trim() || "Closed.");

  await request.save();
  return request;
};

export const cancelInventoryRequestService = async (
  requestId: string,
  requester: Requester,
  note?: string
) => {
  const context = await getRequesterContext(requester.id);

  if (!INVENTORY_HEAD_ROLES.includes(context.role)) {
    throwRoleError("Only inventory head, manager, or admin can cancel requests.");
  }

  const request = await getRequestForRestaurant(requestId, context);
  assertStatus(
    request,
    ["requested", "approved", "vendor_assigned", "dispatched"],
    "Only open requests can be cancelled."
  );

  request.status = "cancelled";
  appendTimeline(request, "cancelled", context.id, note?.trim() || "Cancelled.");

  await request.save();
  return request;
};
