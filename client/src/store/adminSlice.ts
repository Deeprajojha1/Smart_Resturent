import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as adminService from "../services/adminService";

type Kpi = {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "flat";
};

export type DashboardSummary = {
  kpis: Kpi[];
  topDishes: { name: string; totalSold: number }[];
  recentOrders: {
    id: string;
    status: string;
    totalAmount: number;
    createdAt: string;
  }[];
  inventoryAlerts: { itemName: string; quantity: number }[];
  onlineOrders: {
    id: string;
    status: string;
    totalAmount: number;
    paymentStatus: string;
  }[];
};

type AdminState = {
  dashboard: DashboardSummary | null;
  status: "idle" | "loading" | "failed";
  error: string | null;
};

const initialState: AdminState = {
  dashboard: null,
  status: "idle",
  error: null,
};

export const fetchDashboardSummary = createAsyncThunk(
  "admin/fetchDashboardSummary",
  async (params: { startDate?: string; endDate?: string } | undefined) => {
    return adminService.getDashboardSummary(params);
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardSummary.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
        state.status = "idle";
        state.dashboard = action.payload;
      })
      .addCase(fetchDashboardSummary.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to load dashboard";
      });
  },
});

export default adminSlice.reducer;
