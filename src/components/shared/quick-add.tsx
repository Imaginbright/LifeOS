"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  X,
  CheckCheck,
  Flag,
  CreditCard,
  ArrowRight,
  CalendarDays,
  Settings2,
  Inbox,
} from "lucide-react";
import { useApp } from "./app-provider";
import { todayDate } from "@/lib/date";
import { addDays, addMonths, format } from "date-fns";
import type { Category, Currency, Subscription, Task } from "@/lib/types";
import { recurrenceDescription, type Frequency } from "@/lib/task-recurrence";
export function QuickAdd() {
  const app = useApp();
  const returnFocus = useRef<HTMLElement | null>(null);
  const [cycle, setCycle] = useState<Subscription["billingCycle"]>("monthly");
  const [repeat, setRepeat] = useState<Frequency | "none">("none");
  const [weekdays, setWeekdays] = useState<number[]>([]);
  const [editScope, setEditScope] = useState<"one" | "series">("one");
  const open = app.addKind !== null || app.editingGoal !== null || app.editingTask !== null;
  const close = () => {
    app.setAddKind(null);
    app.setEditingGoal(null);
    app.setEditingTask(null);
    setCycle("monthly");
    setRepeat("none");
    setWeekdays([]);
    setEditScope("one");
  };
  const title = app.editingGoal
    ? "Edit your goal."
    : app.editingTask
      ? "Edit your task."
    : app.addKind === "menu"
      ? "Make a little room."
      : app.addKind === "task"
        ? "One thing at a time."
        : app.addKind === "goal"
          ? "Something to work toward."
          : "Keep track of the little things.";
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (app.pending) return;
    const data = new FormData(event.currentTarget);
    const str = (key: string) => String(data.get(key) ?? "");
    const num = (key: string) => Number(data.get(key));
    let saved;
    if (app.editingTask || app.addKind === "task") {
      const task = {
        title: str("title").trim(),
        notes: str("notes").trim(),
        date: str("date"),
        category: str("category") as Category,
        priority: str("priority") as Task["priority"],
        scope: str("scope") as Task["scope"],
      };
      const interval = num("interval");
      const rule = { ...task, frequency: repeat, interval, weekdays: repeat === "weekly" ? weekdays : [], dayOfMonth: repeat === "monthly" ? Number(task.date.slice(8, 10)) : null, startsOn: task.date, endsOn: str("endsOn") || null };
      saved = app.editingTask?.recurrenceId && editScope === "series"
        ? await app.editTaskSeries(app.editingTask.recurrenceId, { ...rule, from: app.editingTask.occurrenceDate })
        : app.editingTask
          ? await app.editTask(app.editingTask.id, task)
          : repeat !== "none"
            ? await app.addTaskSeries(rule)
            : await app.addTask({ ...task, completed: false });
    } else if (app.editingGoal || app.addKind === "goal") {
      const goal = {
        title: str("title").trim(),
        description: str("description").trim(),
        currentValue: num("currentValue"),
        targetValue: num("targetValue"),
        unit: str("unit").trim(),
        category: str("category"),
        deadline: str("deadline"),
      };
      saved = app.editingGoal
        ? await app.editGoal(app.editingGoal.id, goal)
        : await app.addGoal(goal);
    } else
      saved = await app.addSubscription({
        name: str("name").trim(),
        amount: num("amount"),
        currency: str("currency") as Currency,
        billingCycle: cycle,
        customIntervalDays:
          cycle === "custom" ? num("customIntervalDays") : undefined,
        renewalDate: str("renewalDate"),
        category: str("category"),
        active: true,
      });
    if (saved) close();
  }
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(value) => {
        if (!value) close();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content
          className="dialog-content"
          aria-describedby="dialog-description"
          onOpenAutoFocus={() => {
            returnFocus.current =
              document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (returnFocus.current?.isConnected) returnFocus.current.focus();
          }}
        >
          <div className="sheet-handle" />
          <Dialog.Close
            className="icon-button dialog-close"
            aria-label="Close dialog"
          >
            <X size={20} />
          </Dialog.Close>
          <p className="eyebrow">
            {app.editingGoal || app.editingTask
              ? `Edit ${app.editingGoal ? "goal" : "task"}`
              : app.addKind === "menu"
                ? "Quick add"
                : `Add ${app.addKind}`}
          </p>
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Description id="dialog-description">
            {app.addKind === "menu"
              ? "A task, a goal, or something to keep an eye on."
              : "Give it a place in your personal space."}
          </Dialog.Description>
          {app.addKind === "menu" ? (
            <>
              <div className="quick-options">
                {(
                  [
                    {
                      key: "task",
                      title: "Add task",
                      text: "Free up a little headspace",
                      icon: CheckCheck,
                    },
                    {
                      key: "goal",
                      title: "Add goal",
                      text: "Give your next chapter a direction",
                      icon: Flag,
                    },
                    {
                      key: "subscription",
                      title: "Add subscription",
                      text: "Know what renews next",
                      icon: CreditCard,
                    },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.key}
                    onClick={() => app.setAddKind(item.key)}
                  >
                    <span className="soft-icon">
                      <item.icon size={22} />
                    </span>
                    <span>
                      <strong>{item.title}</strong>
                      <small>{item.text}</small>
                    </span>
                    <ArrowRight size={18} />
                  </button>
                ))}
              </div>
              <p className="eyebrow more-label">Explore your space</p>
              <div className="more-links">
                {[
                  {
                    href: "/subscriptions",
                    title: "Subscriptions",
                    icon: CreditCard,
                  },
                  { href: "/inbox", title: "Inbox", icon: Inbox },
                  { href: "/calendar", title: "Calendar", icon: CalendarDays },
                  { href: "/settings", title: "Settings", icon: Settings2 },
                ].map((item) => (
                  <Link href={item.href} key={item.href} onClick={close}>
                    <item.icon size={18} />
                    {item.title}
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <form
              key={app.editingTask?.id ?? app.editingGoal?.id ?? app.addKind}
              onSubmit={submit}
              className="entry-form"
            >
              {app.editingTask || app.addKind === "task" ? (
                <>
                  <label>
                    Task title
                    <input
                      name="title"
                      placeholder="What would you like to get done?"
                      defaultValue={app.editingTask?.title}
                      required
                      maxLength={120}
                      pattern=".*\S.*"
                    />
                  </label>
                  <label>
                    Notes
                    <textarea name="notes" maxLength={1000} defaultValue={app.editingTask?.notes ?? ""} placeholder="Any details to remember?" />
                  </label>
                  <div className="form-grid">
                    <label>
                      Date
                      <input
                        name="date"
                        type="date"
                        defaultValue={app.editingTask?.date ?? todayDate()}
                        required
                      />
                    </label>
                    {(repeat === "none" || app.editingTask) && <label>
                      Plan
                      <select name="scope" defaultValue={app.editingTask?.scope ?? "daily"} disabled={Boolean(app.editingTask?.recurrence && editScope === "series")}>
                        <option value="daily">Daily task</option>
                        <option value="monthly">Monthly task</option>
                      </select>
                    </label>}
                    <label>
                      Priority
                      <select name="priority" defaultValue={app.editingTask?.priority ?? "Medium"}>
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                      </select>
                    </label>
                    <label>
                      Category
                      <select name="category" defaultValue={app.editingTask?.category ?? "Content"}>
                        {[
                          "Content",
                          "Development",
                          "Personal",
                          "Admin",
                          "Health",
                          "Other",
                        ].map((value) => (
                          <option key={value}>{value}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  {app.editingTask?.recurrence && (
                    <fieldset className="recurrence-options">
                      <legend>Apply changes</legend>
                      <label><input type="radio" name="editScope" checked={editScope === "one"} onChange={() => setEditScope("one")} /> This task</label>
                      <label><input type="radio" name="editScope" checked={editScope === "series"} onChange={() => { setEditScope("series"); setRepeat(app.editingTask!.recurrence!.frequency); setWeekdays(app.editingTask!.recurrence!.weekdays); }} /> This and future tasks</label>
                      <small>{recurrenceDescription(app.editingTask.recurrence)}</small>
                    </fieldset>
                  )}
                  {(!app.editingTask || (app.editingTask.recurrence && editScope === "series")) && (
                    <div className="recurrence-options">
                      <label>Repeat
                        <select aria-label="Repeat" value={repeat} disabled={!app.recurrenceAvailable} onChange={(event) => { const value = event.target.value as Frequency | "none"; setRepeat(value); if (value === "weekly" && !weekdays.length) { const date = (event.currentTarget.form?.elements.namedItem("date") as HTMLInputElement)?.value || todayDate(); const day = new Date(`${date}T00:00:00`).getDay() || 7; setWeekdays([day]); } }}>
                          <option value="none" disabled={Boolean(app.editingTask?.recurrence)}>Does not repeat</option><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option>
                        </select>
                      </label>
                      {!app.recurrenceAvailable && <small>Repeating tasks will be available after the database update.</small>}
                      {repeat !== "none" && <>
                        <label>Every <input name="interval" type="number" min="1" max="365" defaultValue={app.editingTask?.recurrence?.interval ?? 1} required /> {repeat === "daily" ? "day(s)" : repeat === "weekly" ? "week(s)" : "month(s)"}</label>
                        {repeat === "weekly" && <fieldset className="weekday-picker"><legend>On</legend>{["M", "T", "W", "T", "F", "S", "S"].map((label, index) => <button key={index} type="button" aria-label={["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][index]} aria-pressed={weekdays.includes(index + 1)} onClick={() => setWeekdays((current) => current.includes(index + 1) ? current.filter((day) => day !== index + 1) : [...current, index + 1].sort())}>{label}</button>)}</fieldset>}
                        <label>End (optional) <input name="endsOn" type="date" defaultValue={app.editingTask?.recurrence?.endsOn ?? ""} /><small>Leave blank to keep repeating.</small></label>
                      </>}
                    </div>
                  )}
                </>
              ) : app.editingGoal || app.addKind === "goal" ? (
                <>
                  <label>
                    Goal title
                    <input
                      name="title"
                      placeholder="What are you working toward?"
                      defaultValue={app.editingGoal?.title}
                      required
                      maxLength={100}
                      pattern=".*\S.*"
                    />
                  </label>
                  <label>
                    A little context
                    <textarea
                      name="description"
                      placeholder="Why does this matter to you?"
                      defaultValue={app.editingGoal?.description}
                      maxLength={250}
                    />
                  </label>
                  <div className="form-grid">
                    <label>
                      Current value
                      <input
                        name="currentValue"
                        type="number"
                        defaultValue={app.editingGoal?.currentValue ?? 0}
                        min="0"
                        step="any"
                        required
                      />
                    </label>
                    <label>
                      Target value
                      <input
                        name="targetValue"
                        type="number"
                        min="0.01"
                        defaultValue={app.editingGoal?.targetValue}
                        step="any"
                        required
                      />
                    </label>
                    <label>
                      Unit
                      <input
                        name="unit"
                        placeholder="books, subscribers, %…"
                        defaultValue={app.editingGoal?.unit}
                        required
                      />
                    </label>
                    <label>
                      Deadline
                      <input
                        name="deadline"
                        type="date"
                        defaultValue={app.editingGoal?.deadline ?? format(addMonths(new Date(), 3), "yyyy-MM-dd")}
                        required
                      />
                    </label>
                  </div>
                  <label>
                    Category
                    <select name="category" defaultValue={app.editingGoal?.category ?? "Personal"}>
                      <option>Personal</option>
                      <option>Creator</option>
                      <option>Development</option>
                      <option>Health</option>
                    </select>
                  </label>
                </>
              ) : (
                <>
                  <label>
                    Service name
                    <input
                      name="name"
                      placeholder="e.g. Spotify"
                      required
                      maxLength={80}
                      pattern=".*\S.*"
                    />
                  </label>
                  <div className="form-grid">
                    <label>
                      Amount
                      <input
                        name="amount"
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="0.00"
                        required
                      />
                    </label>
                    <label>
                      Currency
                      <select
                        name="currency"
                        defaultValue={app.preferences.currency}
                      >
                        {["NGN", "USD", "GBP", "EUR"].map((value) => (
                          <option key={value}>{value}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Billing cycle
                      <select
                        name="billingCycle"
                        value={cycle}
                        onChange={(event) =>
                          setCycle(
                            event.target.value as Subscription["billingCycle"],
                          )
                        }
                      >
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                        <option value="weekly">Weekly</option>
                        <option value="custom">Custom</option>
                      </select>
                    </label>
                    <label>
                      Next renewal
                      <input
                        name="renewalDate"
                        type="date"
                        defaultValue={format(addDays(new Date(), 7), "yyyy-MM-dd")}
                        required
                      />
                    </label>
                    {cycle === "custom" && (
                      <label>
                        Days between payments
                        <input
                          name="customIntervalDays"
                          type="number"
                          min="1"
                          max="3660"
                          required
                        />
                      </label>
                    )}
                  </div>
                  <label>
                    Category
                    <select name="category">
                      {[
                        "Productivity",
                        "Creative",
                        "Storage",
                        "Entertainment",
                        "Development",
                        "Other",
                      ].map((value) => (
                        <option key={value}>{value}</option>
                      ))}
                    </select>
                  </label>
                </>
              )}
              <div className="form-actions">
                <button
                  type="button"
                  className="button secondary"
                  onClick={close}
                  disabled={app.pending}
                >
                  Cancel
                </button>
                <button type="submit" className="button primary" disabled={app.pending}>
                  {app.pending ? "Saving…" : app.editingGoal ? "Save goal" : app.editingTask ? "Save task" : `Add ${app.addKind}`}
                  <ArrowRight size={16} />
                </button>
              </div>
              {app.error && <p className="form-error" role="alert">{app.error}</p>}
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
