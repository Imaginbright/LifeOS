export type Frequency = "daily" | "weekly" | "monthly";
export type RecurrenceRule = {
  frequency: Frequency;
  interval: number;
  weekdays: number[];
  dayOfMonth: number | null;
  startsOn: string;
  endsOn: string | null;
  active: boolean;
};

const dayMs = 86_400_000;
const utc = (date: string) => new Date(`${date}T00:00:00Z`);
const iso = (date: Date) => date.toISOString().slice(0, 10);
const weekday = (date: Date) => date.getUTCDay() || 7;
const monday = (date: Date) => Math.floor((date.getTime() - (weekday(date) - 1) * dayMs) / dayMs);

export function occurrenceDates(rule: RecurrenceRule, from: string, through: string): string[] {
  if (!rule.active || through < rule.startsOn || (rule.endsOn && from > rule.endsOn)) return [];
  const start = utc(rule.startsOn);
  const first = utc(from > rule.startsOn ? from : rule.startsOn);
  const last = utc(rule.endsOn && rule.endsOn < through ? rule.endsOn : through);
  const result: string[] = [];
  for (let time = first.getTime(); time <= last.getTime(); time += dayMs) {
    const date = new Date(time);
    const days = Math.round((time - start.getTime()) / dayMs);
    const months = (date.getUTCFullYear() - start.getUTCFullYear()) * 12 + date.getUTCMonth() - start.getUTCMonth();
    const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
    const matches = rule.frequency === "daily"
      ? days % rule.interval === 0
      : rule.frequency === "weekly"
        ? (monday(date) - monday(start)) / 7 % rule.interval === 0 && rule.weekdays.includes(weekday(date))
        : months % rule.interval === 0 && date.getUTCDate() === Math.min(rule.dayOfMonth ?? start.getUTCDate(), lastDay);
    if (matches) result.push(iso(date));
  }
  return result;
}

export function recurrenceDescription(rule: Pick<RecurrenceRule, "frequency" | "interval" | "weekdays" | "dayOfMonth">): string {
  const names = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  if (rule.frequency === "daily") return rule.interval === 1 ? "Every day" : `Every ${rule.interval} days`;
  if (rule.frequency === "weekly") return `${rule.interval === 1 ? "Every week" : `Every ${rule.interval} weeks`} on ${rule.weekdays.map((day) => names[day]).join(", ")}`;
  return `${rule.interval === 1 ? "Every month" : `Every ${rule.interval} months`} on day ${rule.dayOfMonth}`;
}

export function isOverdue(task: { date: string; completed: boolean; skipped?: boolean }, today: string) {
  return task.date < today && !task.completed && !task.skipped;
}

export function futureUncompleted<T extends { occurrenceDate?: string; completed: boolean; skipped?: boolean }>(tasks: T[], from: string): T[] {
  return tasks.filter((task) => task.occurrenceDate && task.occurrenceDate >= from && !task.completed && !task.skipped);
}
