import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as adminService from "../services/adminService";

export type InventoryState = {
  items: adminService.InventoryItem[];
  lowStock: adminService.InventoryItem[];
  reorder: adminService.InventoryItem[];
  stats: adminService.InventoryStats;
  requests: adminService.InventoryRequest[];
  status: "idle" | "loading" | "failed";
  mutationStatus: "idle" | "loading" | "failed";
  error: string | null;
  mutationError: string | null;
  mutationSuccess: string | null;
};

const initialState: InventoryState = {
  items: [],
  lowStock: [],
  reorder: [],
  stats: [],
  requests: [],
  status: "idle",
  mutationStatus: "idle",
  error: null,
  mutationError: null,
  mutationSuccess: null,
};

export const fetchInventoryDashboard = createAsyncThunk(
  "inventory/fetchDashboard",
  async (params?: { requestStatus?: adminService.InventoryRequestStatus | "all" }) => {
    const [items, lowStock, reorder, stats, requests] = await Promise.all([
      adminService.getInventoryItems(),
      adminService.getLowStock(),
      adminService.getReorderSuggestions(),
      adminService.getInventoryStats(),
      adminService.getInventoryRequests({ status: params?.requestStatus ?? "all" }),
    ]);

    return { items, lowStock, reorder, stats, requests };
  }
);

export const createInventoryItemThunk = createAsyncThunk(
  "inventory/createItem",
  async (payload: adminService.InventoryCreateInput) => {
    return adminService.addInventoryItem(payload);
  }
);

export const updateInventoryItemThunk = createAsyncThunk(
  "inventory/updateItem",
  async (payload: { id: string; data: adminService.InventoryCreateInput }) => {
    return adminService.updateInventoryItem(payload.id, payload.data);
  }
);

export const deleteInventoryItemThunk = createAsyncThunk(
  "inventory/deleteItem",
  async (id: string) => {
    await adminService.deleteInventoryItem(id);
    return id;
  }
);

export const adjustInventoryStockThunk = createAsyncThunk(
  "inventory/adjustStock",
  async (payload: { id: string; quantity: number }) => {
    return adminService.updateInventoryStock(payload.id, { quantity: payload.quantity });
  }
);

export const createInventoryRequestThunk = createAsyncThunk(
  "inventory/createRequest",
  async (payload: { itemName: string; requestedQty: number; availableQty?: number; notes?: string }) => {
    return adminService.createInventoryRequest(payload);
  }
);

export const approveInventoryRequestThunk = createAsyncThunk(
  "inventory/approveRequest",
  async (payload: { id: string; note?: string }) => {
    return adminService.approveInventoryRequest(payload.id, payload.note);
  }
);

export const assignInventoryVendorThunk = createAsyncThunk(
  "inventory/assignVendor",
  async (payload: { id: string; vendorId: string; eta?: string; note?: string }) => {
    return adminService.assignInventoryRequestVendor(payload.id, {
      vendorId: payload.vendorId,
      eta: payload.eta,
      note: payload.note,
    });
  }
);

export const dispatchInventoryRequestThunk = createAsyncThunk(
  "inventory/dispatchRequest",
  async (payload: { id: string; note?: string }) => {
    return adminService.dispatchInventoryRequest(payload.id, payload.note);
  }
);

export const receiveInventoryRequestThunk = createAsyncThunk(
  "inventory/receiveRequest",
  async (payload: { id: string; receivedQty?: number; note?: string }) => {
    return adminService.receiveInventoryRequest(payload.id, {
      receivedQty: payload.receivedQty,
      note: payload.note,
    });
  }
);

export const fulfillInventoryRequestThunk = createAsyncThunk(
  "inventory/fulfillRequest",
  async (payload: { id: string; note?: string }) => {
    return adminService.fulfillInventoryRequest(payload.id, payload.note);
  }
);

export const closeInventoryRequestThunk = createAsyncThunk(
  "inventory/closeRequest",
  async (payload: { id: string; note?: string }) => {
    return adminService.closeInventoryRequest(payload.id, payload.note);
  }
);

export const cancelInventoryRequestThunk = createAsyncThunk(
  "inventory/cancelRequest",
  async (payload: { id: string; note?: string }) => {
    return adminService.cancelInventoryRequest(payload.id, payload.note);
  }
);

const setMutationPending = (state: InventoryState) => {
  state.mutationStatus = "loading";
  state.mutationError = null;
  state.mutationSuccess = null;
};

const setMutationFailed = (state: InventoryState, action: { error: { message?: string } }) => {
  state.mutationStatus = "failed";
  state.mutationError = action.error.message ?? "Action failed";
};

const setMutationSuccess = (state: InventoryState, message: string) => {
  state.mutationStatus = "idle";
  state.mutationError = null;
  state.mutationSuccess = message;
};

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    clearInventoryMessages: (state) => {
      state.mutationError = null;
      state.mutationSuccess = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventoryDashboard.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchInventoryDashboard.fulfilled, (state, action) => {
        state.status = "idle";
        state.items = action.payload.items;
        state.lowStock = action.payload.lowStock;
        state.reorder = action.payload.reorder;
        state.stats = action.payload.stats;
        state.requests = action.payload.requests;
      })
      .addCase(fetchInventoryDashboard.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to load inventory dashboard";
      })
      .addCase(createInventoryItemThunk.pending, setMutationPending)
      .addCase(createInventoryItemThunk.fulfilled, (state) => {
        setMutationSuccess(state, "Inventory item created successfully.");
      })
      .addCase(createInventoryItemThunk.rejected, setMutationFailed)
      .addCase(updateInventoryItemThunk.pending, setMutationPending)
      .addCase(updateInventoryItemThunk.fulfilled, (state) => {
        setMutationSuccess(state, "Inventory item updated successfully.");
      })
      .addCase(updateInventoryItemThunk.rejected, setMutationFailed)
      .addCase(deleteInventoryItemThunk.pending, setMutationPending)
      .addCase(deleteInventoryItemThunk.fulfilled, (state) => {
        setMutationSuccess(state, "Inventory item deleted successfully.");
      })
      .addCase(deleteInventoryItemThunk.rejected, setMutationFailed)
      .addCase(adjustInventoryStockThunk.pending, setMutationPending)
      .addCase(adjustInventoryStockThunk.fulfilled, (state) => {
        setMutationSuccess(state, "Inventory stock adjusted.");
      })
      .addCase(adjustInventoryStockThunk.rejected, setMutationFailed)
      .addCase(createInventoryRequestThunk.pending, setMutationPending)
      .addCase(createInventoryRequestThunk.fulfilled, (state) => {
        setMutationSuccess(state, "Inventory request created.");
      })
      .addCase(createInventoryRequestThunk.rejected, setMutationFailed)
      .addCase(approveInventoryRequestThunk.pending, setMutationPending)
      .addCase(approveInventoryRequestThunk.fulfilled, (state) => {
        setMutationSuccess(state, "Inventory request approved.");
      })
      .addCase(approveInventoryRequestThunk.rejected, setMutationFailed)
      .addCase(assignInventoryVendorThunk.pending, setMutationPending)
      .addCase(assignInventoryVendorThunk.fulfilled, (state) => {
        setMutationSuccess(state, "Vendor assigned successfully.");
      })
      .addCase(assignInventoryVendorThunk.rejected, setMutationFailed)
      .addCase(dispatchInventoryRequestThunk.pending, setMutationPending)
      .addCase(dispatchInventoryRequestThunk.fulfilled, (state) => {
        setMutationSuccess(state, "Request marked as dispatched.");
      })
      .addCase(dispatchInventoryRequestThunk.rejected, setMutationFailed)
      .addCase(receiveInventoryRequestThunk.pending, setMutationPending)
      .addCase(receiveInventoryRequestThunk.fulfilled, (state) => {
        setMutationSuccess(state, "Request marked as received.");
      })
      .addCase(receiveInventoryRequestThunk.rejected, setMutationFailed)
      .addCase(fulfillInventoryRequestThunk.pending, setMutationPending)
      .addCase(fulfillInventoryRequestThunk.fulfilled, (state) => {
        setMutationSuccess(state, "Request fulfilled.");
      })
      .addCase(fulfillInventoryRequestThunk.rejected, setMutationFailed)
      .addCase(closeInventoryRequestThunk.pending, setMutationPending)
      .addCase(closeInventoryRequestThunk.fulfilled, (state) => {
        setMutationSuccess(state, "Request closed.");
      })
      .addCase(closeInventoryRequestThunk.rejected, setMutationFailed)
      .addCase(cancelInventoryRequestThunk.pending, setMutationPending)
      .addCase(cancelInventoryRequestThunk.fulfilled, (state) => {
        setMutationSuccess(state, "Request cancelled.");
      })
      .addCase(cancelInventoryRequestThunk.rejected, setMutationFailed);
  },
});

export const { clearInventoryMessages } = inventorySlice.actions;
export default inventorySlice.reducer;
