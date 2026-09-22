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
export function QuickAdd() {
  const app = useApp();
  const returnFocus = useRef<HTMLElement | null>(null);
  const [cycle, setCycle] = useState<Subscription["billingCycle"]>("monthly");
  const open = app.addKind !== null || app.editingGoal !== null;
  const close = () => {
    app.setAddKind(null);
    app.setEditingGoal(null);
    setCycle("monthly");
  };
  const title = app.editingGoal
    ? "A little progress adds up."
    : app.addKind === "menu"
      ? "Make a little room."
      : app.addKind === "task"
        ? "One thing at a time."
        : app.addKind === "goal"
          ? "Something to work toward."
          : "Keep track of the little things.";
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const str = (key: string) => String(data.get(key) ?? "");
    const num = (key: string) => Number(data.get(key));
    let saved;
    if (app.editingGoal)
      saved = await app.updateGoal(app.editingGoal.id, num("currentValue"));
    else if (app.addKind === "task")
      saved = await app.addTask({
        title: str("title").trim(),
        date: str("date"),
        category: str("category") as Category,
        priority: str("priority") as Task["priority"],
        scope: str("scope") as Task["scope"],
        completed: false,
      });
    else if (app.addKind === "goal")
      saved = await app.addGoal({
        title: str("title").trim(),
        description: str("description").trim(),
        currentValue: num("currentValue"),
        targetValue: num("targetValue"),
        unit: str("unit").trim(),
        category: str("category"),
        deadline: str("deadline"),
      });
    else
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
            {app.editingGoal
              ? "Update goal"
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
              key={app.addKind ?? app.editingGoal?.id}
              onSubmit={submit}
              className="entry-form"
            >
              {app.editingGoal ? (
                <>
                  <p className="editing-title">{app.editingGoal.title}</p>
                  <label>
                    Current progress{" "}
                    <input
                      name="currentValue"
                      type="number"
                      min="0"
                      step="any"
                      defaultValue={app.editingGoal.currentValue}
                      required
                    />
                  </label>
                  <p className="muted">
                    Target: {app.editingGoal.targetValue.toLocaleString()}{" "}
                    {app.editingGoal.unit}
                  </p>
                </>
              ) : app.addKind === "task" ? (
                <>
                  <label>
                    Task title
                    <input
                      name="title"
                      placeholder="What would you like to get done?"
                      required
                      maxLength={120}
                      pattern=".*\S.*"
                    />
                  </label>
                  <div className="form-grid">
                    <label>
                      Date
                      <input
                        name="date"
                        type="date"
                        defaultValue={todayDate()}
                        required
                      />
                    </label>
                    <label>
                      Plan
                      <select name="scope">
                        <option value="daily">Daily task</option>
                        <option value="monthly">Monthly task</option>
                      </select>
                    </label>
                    <label>
                      Priority
                      <select name="priority" defaultValue="Medium">
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                      </select>
                    </label>
                    <label>
                      Category
                      <select name="category">
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
                </>
              ) : app.addKind === "goal" ? (
                <>
                  <label>
                    Goal title
                    <input
                      name="title"
                      placeholder="What are you working toward?"
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
                      maxLength={250}
                    />
                  </label>
                  <div className="form-grid">
                    <label>
                      Current value
                      <input
                        name="currentValue"
                        type="number"
                        defaultValue="0"
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
                        step="any"
                        required
                      />
                    </label>
                    <label>
                      Unit
                      <input
                        name="unit"
                        placeholder="books, subscribers, %…"
                        required
                      />
                    </label>
                    <label>
                      Deadline
                      <input
                        name="deadline"
                        type="date"
                        defaultValue={format(addMonths(new Date(), 3), "yyyy-MM-dd")}
                        required
                      />
                    </label>
                  </div>
                  <label>
                    Category
                    <select name="category">
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
                >
                  Cancel
                </button>
                <button type="submit" className="button primary" disabled={app.pending}>
                  {app.pending ? "Saving…" : app.editingGoal ? "Save progress" : `Add ${app.addKind}`}
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
