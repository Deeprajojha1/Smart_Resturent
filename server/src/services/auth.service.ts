import bcrypt from "bcryptjs";
import User from "../models/User.model";
import { verifyGoogleToken } from "../config/google.config";
import { generateToken } from "../utils/jwt.utils";

type AuthError = Error & { statusCode?: number };

type GoogleUser = {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
};

// user register
export const register = async (
  name: string,
  email: string,
  password: string,
  phoneNumber: string
) => {
  const existing = await User.findOne({ email });
  if (existing) {
    const error: AuthError = new Error("Email already registered.");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    phoneNumber,
  });
  const token = generateToken(user);

  return {
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      phoneNumber: user.phoneNumber,
      role: user.role,
      restaurantId: user.restaurantId,
    },
  };
};

// user login
export const emailLogin = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  if (!user || !user.password) {
    const error: AuthError = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error: AuthError = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  user.lastLogin = new Date();
  await user.save();
  const token = generateToken(user);

  return {
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      phoneNumber: user.phoneNumber,
      role: user.role,
      restaurantId: user.restaurantId,
    },
  };
};

// google login
export const googleLogin = async (credential: string) => {
  const googleUser = (await verifyGoogleToken(credential)) as GoogleUser;

  const existingByEmail = await User.findOne({ email: googleUser.email });
  if (!existingByEmail) {
    const error: AuthError = new Error(
      "Email is not registered. Please sign up first."
    );
    error.statusCode = 401;
    throw error;
  }

  const user = await User.findOneAndUpdate(
    { _id: existingByEmail._id },
    {
      googleId: googleUser.googleId,
      name: googleUser.name,
      picture: googleUser.picture,
      lastLogin: new Date(),
    },
    {
      returnDocument: "after",
      upsert: false,
    }
  );

  if (!user) {
    const error: AuthError = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  const token = generateToken(user);

  return {
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      phoneNumber: user.phoneNumber,
      role: user.role,
      restaurantId: user.restaurantId,
    },
  };
};

// get user profile
export const getUserProfile = async (userId: string) => {
  const user = await User.findById(userId).select("-__v -googleId");

  if (!user) {
    throw new Error("User not found");
  }

  return {
    id: user._id,
    email: user.email,
    name: user.name,
    picture: user.picture,
    phoneNumber: user.phoneNumber,
    role: user.role,
    restaurantId: user.restaurantId,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
  };
};
