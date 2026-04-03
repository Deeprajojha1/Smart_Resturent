import Employee from "../models/Employee.model";
import User from "../models/User.model";
import type { Role } from "../constants/roles";

type Requester = {
  id: string;
};

type EmployeeInput = {
  userId: string;
  role: Role;
  salary: number;
  joiningDate: string | Date;
  isActive?: boolean;
};

type EmployeeUpdateInput = Partial<{
  role: Role;
  salary: number;
  joiningDate: string | Date;
  isActive: boolean;
}>;

const getRequesterRestaurantId = async (requesterId: string) => {
  const user = await User.findById(requesterId).select("restaurantId");
  return user?.restaurantId ?? null;
};

export const createEmployeeService = async (
  data: EmployeeInput,
  requester: Requester
) => {
  const restaurantId = await getRequesterRestaurantId(requester.id);
  if (!restaurantId) {
    const error = new Error("Restaurant not found for user.");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  const user = await User.findById(data.userId).select("restaurantId role");
  if (!user) {
    const error = new Error("User not found.");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }
  if (user.restaurantId && String(user.restaurantId) !== String(restaurantId)) {
    const error = new Error("User belongs to another restaurant.");
    (error as Error & { statusCode?: number }).statusCode = 400;
    throw error;
  }

  return Employee.create({
    userId: data.userId,
    restaurantId,
    role: data.role,
    salary: data.salary,
    joiningDate: new Date(data.joiningDate),
    isActive: data.isActive ?? true,
  });
};

export const getEmployeesService = async (requester: Requester) => {
  const restaurantId = await getRequesterRestaurantId(requester.id);
  if (!restaurantId) {
    const error = new Error("Restaurant not found for user.");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  return Employee.find({ restaurantId })
    .populate("userId", "name email role")
    .sort({ createdAt: -1 });
};

export const updateEmployeeService = async (
  id: string,
  data: EmployeeUpdateInput,
  requester: Requester
) => {
  const restaurantId = await getRequesterRestaurantId(requester.id);
  if (!restaurantId) {
    const error = new Error("Restaurant not found for user.");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  const update: EmployeeUpdateInput = { ...data };
  if (update.joiningDate) {
    update.joiningDate = new Date(update.joiningDate);
  }

  const employee = await Employee.findOneAndUpdate(
    { _id: id, restaurantId },
    update,
    { new: true }
  );

  if (!employee) {
    const error = new Error("Employee not found.");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  return employee;
};
