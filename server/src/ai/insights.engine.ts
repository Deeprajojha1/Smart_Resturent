import { geminiModel } from "./gemini.client";

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

  const result = await geminiModel.generateContent(prompt);
  const responseText = result.response.text();
  let insights = parseInsights(responseText);

  if (!insights.length) {
    insights = [{ type: "info", message: "No insights generated." }];
  }

  return insights;
};
