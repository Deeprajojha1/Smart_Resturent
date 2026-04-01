import type { Feature, Problem, Role, Stat, Step } from "../types";

export const problems: Problem[] = [
  {
    title: "Disconnected POS",
    description: "Sales live in one system while finance lives in another.",
  },
  {
    title: "Manual Spreadsheets",
    description: "Teams burn hours reconciling numbers that never match.",
  },
  {
    title: "Inventory Mismatch",
    description: "Over-ordering and stockouts drain profit every week.",
  },
  {
    title: "No Real-Time Insights",
    description: "Decisions arrive after the damage is done.",
  },
];

export const features: Feature[] = [
  {
    title: "Fresh Ingredients",
    description: "Sourced daily from local markets and farms for unbeatable freshness.",
    icon: "🌿"
  },
  {
    title: "Expert Chefs",
    description: "Award-winning team with decades of culinary experience.",
    icon: "👨‍🍳"
  },
  {
    title: "Lightning Service",
    description: "From order to table in under 10 minutes guaranteed.",
    icon: "⚡"
  },
  {
    title: "Diverse Menu",
    description: "Indian, Continental, Fusion - something for everyone.",
    icon: "🌍"
  },
  {
    title: "Hygienic Practices",
    description: "Highest standards of cleanliness and food safety.",
    icon: "🧼"
  },
  {
    title: "Easy Ordering",
    description: "App, phone, or walk-in - order your way.",
    icon: "📱"
  },
];

export const steps: Step[] = [
  {
    title: "Capture Data",
    description: "Orders, expenses, and inventory sync in real time.",
  },
  {
    title: "AI Processing",
    description: "LaunchForge structures every datapoint across the stack.",
  },
  {
    title: "Smart Insights",
    description: "Get predictions, alerts, and profit suggestions instantly.",
  },
];

export const roles: Role[] = [
  {
    title: "Admin",
    description: "Full control over finance, AI policies, and global insights.",
  },
  {
    title: "Manager",
    description: "Owns daily operations, forecasts, and inventory accuracy.",
  },
  {
    title: "Cashier",
    description: "Focused POS workflows with guided prompts and alerts.",
  },
];

export const stats: Stat[] = [
  { label: "Weekly Revenue", value: "$182.4k", trend: "+12.6%" },
  { label: "Profit Margin", value: "27.3%", trend: "+3.1%" },
  { label: "Waste Reduction", value: "-18%", trend: "AI optimized" },
];

export const techStack = [
  "MongoDB",
  "Express",
  "React",
  "Node.js",
  "TypeScript",
  "Tailwind CSS",
  "AI Engine",
];

