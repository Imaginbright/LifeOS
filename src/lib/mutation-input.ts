import type { Category, Goal, Task } from "@/lib/types";

const taskCategories: Category[] = ["Content", "Development", "Personal", "Admin", "Health", "Other"];
const isDate = (value: unknown): value is string => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
const text = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";

export function taskWrite(body: Record<string, unknown>) {
  const title = text(body.title, 120);
  const notes = text(body.notes, 1000);
  const scope = body.scope;
  const priority = typeof body.priority === "string" ? body.priority.toLowerCase() : "";
  const category = body.category;
  const date = body.date;
  if (!title || !isDate(date) || !["daily", "monthly"].includes(String(scope)) || !["low", "medium", "high"].includes(priority) || !taskCategories.includes(category as Category)) return null;
  return {
    title,
    notes,
    scope: scope as Task["scope"],
    priority,
    category: category as Category,
    due_date: scope === "daily" ? date : null,
    period_month: scope === "monthly" ? `${date.slice(0, 7)}-01` : null,
  };
}

export function goalWrite(body: Record<string, unknown>) {
  const title = text(body.title, 100);
  const description = text(body.description, 250);
  const unit = text(body.unit, 30);
  const category = text(body.category, 40);
  const current = Number(body.currentValue);
  const target = Number(body.targetValue);
  if (!title || !unit || !category || !isDate(body.deadline) || !Number.isFinite(current) || current < 0 || !Number.isFinite(target) || target <= 0) return null;
  return { title, description, unit, category, deadline: body.deadline as Goal["deadline"], current_value: current, target_value: target };
}

export const needsGoalCheckin = (previous: number, next: number) => previous !== next;
