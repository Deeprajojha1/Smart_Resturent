export const ROLES = [
	"cashier",
	"manager",
	"admin",
	"inventory",
	"inventory_head",
	"vendor",
] as const;

export type Role = (typeof ROLES)[number];
