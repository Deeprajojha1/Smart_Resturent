import { generateWithGemini } from "./gemini.client";

export type InsightPayload = {
  type: "warning" | "info" | "profit";
  message: string;
};

type InsightsInput = {
  revenue: {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
  };
  expenses: {
    totalExpense: number;
  };
  topDishes: Array<{
    _id: string;
    totalSold: number;
  }>;
  lowStockItems: Array<{
    itemName: string;
    quantity: number;
    unit: string;
    lowStockThreshold: number;
  }>;
};

const buildFallbackInsights = (data: InsightsInput): InsightPayload[] => {
  const insights: InsightPayload[] = [];
  const profit = data.revenue.totalRevenue - data.expenses.totalExpense;
  const margin =
    data.revenue.totalRevenue > 0
      ? (profit / data.revenue.totalRevenue) * 100
      : 0;

  if (profit < 0) {
    insights.push({
      type: "warning",
      message: `You are running at a loss of ${Math.abs(profit).toFixed(2)}. Review high-cost categories and reduce waste immediately.`,
    });
  } else {
    insights.push({
      type: "profit",
      message: `Estimated net profit is ${profit.toFixed(2)} with a margin of ${margin.toFixed(1)}%.`,
    });
  }

  if (data.revenue.totalOrders > 0) {
    insights.push({
      type: "info",
      message: `Average order value is ${data.revenue.avgOrderValue.toFixed(2)} across ${data.revenue.totalOrders} orders.`,
    });
  } else {
    insights.push({
      type: "warning",
      message: "No orders found in current dataset. Check order sync or date coverage.",
    });
  }

  if (data.topDishes.length) {
    const best = data.topDishes[0];
    insights.push({
      type: "profit",
      message: `Top-selling item is ${best._id} (${best.totalSold} sold). Consider bundling or promoting it in peak hours.`,
    });
  }

  if (data.lowStockItems.length) {
    const topLowStock = data.lowStockItems
      .slice(0, 2)
      .map((item) => `${item.itemName} (${item.quantity}${item.unit})`)
      .join(", ");
    insights.push({
      type: "warning",
      message: `Low stock alert: ${topLowStock}. Reorder soon to avoid stockouts.`,
    });
  }

  insights.push({
    type: "info",
    message: "AI quota was exceeded, so these are rule-based fallback insights.",
  });

  return insights.slice(0, 5);
};

const parseInsights = (text: string): InsightPayload[] => {
  const trimmed = text.trim();
  const tryParse = (value: string) => {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  };

  const direct = tryParse(trimmed);
  const start = trimmed.indexOf("[");
  const end = trimmed.lastIndexOf("]");
  const sliced =
    start !== -1 && end !== -1 && end > start
      ? tryParse(trimmed.slice(start, end + 1))
      : null;

  const parsed = direct ?? sliced;
  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const rawType = String((item as { type?: string }).type ?? "info");
      const normalizedType: InsightPayload["type"] =
        rawType === "warning" || rawType === "profit" ? rawType : "info";
      const message = String((item as { message?: string }).message ?? "").trim();
      return { type: normalizedType, message };
    })
    .filter((item) => item.message.length > 0);
};

export const generateAiInsights = async (
  data: InsightsInput
): Promise<InsightPayload[]> => {
  const prompt = `
You are a business analyst AI for a restaurant.

Analyze the following data and give 5 actionable insights.

DATA:
Revenue: ${JSON.stringify(data.revenue)}
Expenses: ${JSON.stringify(data.expenses)}
Top Dishes: ${JSON.stringify(data.topDishes)}
Low Stock Items: ${JSON.stringify(data.lowStockItems)}

Rules:
- Give short, clear insights
- Focus on profit, cost, demand, and risk
- Mention specific problems and suggestions
- Avoid generic statements
- Use numbers if possible
- Be specific to restaurant operations
- Output JSON array format:
[
  { "type": "warning/info/profit", "message": "..." }
]
`;

  let insights: InsightPayload[] = [];

  try {
    const responseText = await generateWithGemini(prompt);
    insights = parseInsights(responseText);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error ?? "");
    const isQuotaError =
      message.includes("429") ||
      message.toLowerCase().includes("quota exceeded") ||
      message.toLowerCase().includes("too many requests");
    if (!isQuotaError) {
      throw error;
    }
    insights = buildFallbackInsights(data);
  }

  if (!insights.length) {
    insights = buildFallbackInsights(data);
  }

  return insights;
};
