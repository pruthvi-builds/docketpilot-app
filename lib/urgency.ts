export function daysUntil(date: Date | string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export type Urgency = "overdue" | "soon" | "month" | "later";

export function urgencyOf(date: Date | string): { level: Urgency; label: string; days: number } {
  const d = daysUntil(date);
  if (d < 0) return { level: "overdue", label: `Overdue by ${Math.abs(d)}d`, days: d };
  if (d === 0) return { level: "overdue", label: "Due today", days: d };
  if (d <= 7) return { level: "soon", label: `Due in ${d}d`, days: d };
  if (d <= 30) return { level: "month", label: `Due in ${d}d`, days: d };
  return { level: "later", label: `Due in ${d}d`, days: d };
}

export const urgencyClasses: Record<Urgency, string> = {
  overdue: "bg-red-100 text-red-800",
  soon: "bg-orange-100 text-orange-800",
  month: "bg-yellow-100 text-yellow-800",
  later: "bg-green-100 text-green-800",
};
