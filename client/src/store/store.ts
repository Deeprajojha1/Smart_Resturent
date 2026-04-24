import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import adminReducer from "./adminSlice";
import inventoryReducer from "./inventorySlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
    inventory: inventoryReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
