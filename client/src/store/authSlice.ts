import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import * as authService from "../services/authService";

type User = authService.AuthUser;

type AuthState = {
  user: User | null;
  token: string | null;
  id?: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  picture?: string;
  status: "idle" | "loading" | "failed";
  error: string | null;
};

const initialState: AuthState = {
  user: null,
  token: null,
  id: undefined,
  name: undefined,
  email: undefined,
  phoneNumber: undefined,
  picture: undefined,
  status: "idle",
  error: null,
};

export const registerUser = createAsyncThunk(
  "auth/register",
  async (payload: {
    name: string;
    email: string;
    password: string;
    phoneNumber: string;
  }) => {
    return authService.register(
      payload.name,
      payload.email,
      payload.password,
      payload.phoneNumber
    );
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (payload: { email: string; password: string }) => {
    return authService.emailLogin(payload.email, payload.password);
  }
);

export const googleAuth = createAsyncThunk(
  "auth/google",
  async (payload: { credential: string }) => {
    return authService.googleLogin(payload.credential);
  }
);

export const fetchMe = createAsyncThunk("auth/me", async () => {
  return authService.getMe();
});

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  return authService.logout();
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = "idle";
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.id = action.payload.user.id;
        state.name = action.payload.user.name;
        state.email = action.payload.user.email;
        state.phoneNumber = action.payload.user.phoneNumber;
        state.picture = action.payload.user.picture;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Registration failed";
      })
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "idle";
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.id = action.payload.user.id;
        state.name = action.payload.user.name;
        state.email = action.payload.user.email;
        state.phoneNumber = action.payload.user.phoneNumber;
        state.picture = action.payload.user.picture;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Login failed";
      })
      .addCase(googleAuth.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(googleAuth.fulfilled, (state, action) => {
        state.status = "idle";
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.id = action.payload.user.id;
        state.name = action.payload.user.name;
        state.email = action.payload.user.email;
        state.phoneNumber = action.payload.user.phoneNumber;
        state.picture = action.payload.user.picture;
      })
      .addCase(googleAuth.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Google login failed";
      })
      .addCase(fetchMe.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMe.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = "idle";
        state.user = action.payload;
        state.id = action.payload.id;
        state.name = action.payload.name;
        state.email = action.payload.email;
        state.phoneNumber = action.payload.phoneNumber;
        state.picture = action.payload.picture;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to fetch profile";
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.id = undefined;
        state.name = undefined;
        state.email = undefined;
        state.phoneNumber = undefined;
        state.picture = undefined;
        state.status = "idle";
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
