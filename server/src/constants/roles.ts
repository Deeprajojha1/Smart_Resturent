export const ROLES = ["cashier", "manager", "admin", "inventory", "vendor"] as const;

export type Role = (typeof ROLES)[number];
