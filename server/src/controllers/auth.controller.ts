import type { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service";
import { ROLES, type Role } from "../constants/roles";

type AuthError = Error & { statusCode?: number };

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    role?: string;
  };
}

const tokenCookieOptions = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password, phoneNumber } = req.body as {
      name?: string;
      email?: string;
      password?: string;
      phoneNumber?: string;
      role?: Role;
    };

    if (!name || !email || !password || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password, and phone number are required.",
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    if (req.body.role && !ROLES.includes(req.body.role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role provided.",
      });
    }

    const result = await authService.register(
      name,
      email,
      password,
      phoneNumber,
      (req.body.role as Role | undefined) ?? "customer"
    );
    res.cookie("token", result.token, tokenCookieOptions);
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    const err = error as AuthError;
    if (err.statusCode) {
      return res
        .status(err.statusCode)
        .json({ success: false, message: err.message });
    }
    return next(err);
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required." });
    }

    const result = await authService.emailLogin(email, password);
    res.cookie("token", result.token, tokenCookieOptions);
    return res.json({ success: true, data: result });
  } catch (error) {
    const err = error as AuthError;
    if (err.statusCode) {
      return res
        .status(err.statusCode)
        .json({ success: false, message: err.message });
    }
    return next(err);
  }
};

export const googleAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { credential } = req.body as { credential?: string };

    if (!credential) {
      return res
        .status(400)
        .json({ success: false, message: "Google credential is required." });
    }

    const result = await authService.googleLogin(credential);
    res.cookie("token", result.token, tokenCookieOptions);
    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};

export const getMe = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized" });
    }
    const user = await authService.getUserProfile(req.user._id);
    return res.json({ success: true, data: user });
  } catch (error) {
    return next(error);
  }
};

export const logout = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.clearCookie("token", tokenCookieOptions);
    return res.json({
      success: true,
      data: { message: "Logged out successfully" },
    });
  } catch (error) {
    return next(error);
  }
};
