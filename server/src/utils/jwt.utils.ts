import jwt from "jsonwebtoken";
import type { IUser } from "../models/User.model";

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("JWT_SECRET is not defined in your .env file");
}

export const generateToken = (user: IUser) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    jwtSecret,
    { expiresIn: "7d" }
  );
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, jwtSecret);
};
