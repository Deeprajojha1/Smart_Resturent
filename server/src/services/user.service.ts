import User from "../models/User.model";
import type { Role } from "../constants/roles";

type UserError = Error & { statusCode?: number };

export const updateRole = async (userId: string, role: Role) => {
  const user = await User.findById(userId);
  if (!user) {
    const error: UserError = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  user.role = role;
  await user.save();

  return {
    id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
};
