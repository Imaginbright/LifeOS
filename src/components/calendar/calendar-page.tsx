"use client";
import { useState } from "react";
import Link from "next/link";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { useApp } from "@/components/shared/app-provider";
import { EmptyState, PageHeader } from "@/components/shared/primitives";
import { todayDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { CalendarItem } from "@/lib/types";
import { nextRenewals } from "@/lib/subscription-utils";
export function CalendarPage() {
  const { tasks, goals, subscriptions, preferences } = useApp();
  const today = todayDate();
  const [month, setMonth] = useState(() => new Date(`${today}T12:00:00`));
  const [selected, setSelected] = useState(today);
  const weekStartsOn = preferences.startOfWeek === "monday" ? 1 : 0;
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn }),
  });
  const items: CalendarItem[] = [
    ...tasks
      .filter((task) => task.scope === "daily")
      .map((task) => ({
        id: task.id,
        title: task.title,
        date: task.date,
        category: "task" as const,
        href: "/tasks",
      })),
    ...goals.map((goal) => ({
      id: goal.id,
      title: goal.title,
      date: goal.deadline,
      category: "goal" as const,
      href: "/goals",
    })),
    ...nextRenewals(subscriptions, today)
      .map((item) => ({
        id: item.id,
        title: `${item.name} renewal`,
        date: item.renewalDate,
        category: "renewal" as const,
        href: "/subscriptions",
      })),
  ];
  const selectedItems = items.filter((item) => item.date === selected);
  return (
    <>
      <PageHeader
        eyebrow="A little perspective"
        title="Space for your days."
        description="Your tasks, renewals, and milestones in one place."
      />
      <div className="calendar-layout">
        <section className="card calendar-card">
          <div className="section-title">
            <h2>{format(month, "MMMM yyyy")}</h2>
            <div className="calendar-controls">
              <button
                className="icon-button"
                aria-label="Previous month"
                onClick={() => setMonth((value) => addMonths(value, -1))}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                className="button secondary"
                onClick={() => {
                  setMonth(new Date(`${today}T12:00:00`));
                  setSelected(today);
                }}
              >
                Today
              </button>
              <button
                className="icon-button"
                aria-label="Next month"
                onClick={() => setMonth((value) => addMonths(value, 1))}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <div className="calendar-weekdays">
            {days.slice(0, 7).map((day) => (
              <span key={day.toISOString()}>{format(day, "EEE")}</span>
            ))}
          </div>
          <div className="calendar-grid">
            {days.map((day) => {
              const date = format(day, "yyyy-MM-dd");
              const events = items.filter((item) => item.date === date);
              return (
                <button
                  key={date}
                  className={cn(
                    "calendar-day",
                    !isSameMonth(day, month) && "outside",
                    date === selected && "selected",
                    date === today && "today",
                  )}
                  onClick={() => setSelected(date)}
                  aria-label={`${format(day, "MMMM d, yyyy")}, ${events.length} events`}
                  aria-pressed={date === selected}
                >
                  <span>{format(day, "d")}</span>
                  <div className="day-events">
                    {events.slice(0, 2).map((item) => (
                      <span
                        key={item.id}
                        className={`calendar-event ${item.category}`}
                      >
                        {item.title}
                      </span>
                    ))}
                    {events.length > 2 && (
                      <small>+{events.length - 2} more</small>
                    )}
                  </div>
                  <div className="day-dots">
                    {[...new Set(events.map((item) => item.category))].map(
                      (category) => (
                        <i key={category} className={category} />
                      ),
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="calendar-legend">
            <span>
              <i className="task" />
              Tasks
            </span>
            <span>
              <i className="renewal" />
              Renewals
            </span>
            <span>
              <i className="goal" />
              Goals
            </span>
          </div>
        </section>
        <section className="card day-agenda">
          <p className="eyebrow">A look at your day</p>
          <h2>{format(new Date(`${selected}T12:00:00`), "MMMM d")}</h2>
          {selectedItems.length ? (
            selectedItems.map((item) => (
              <Link key={item.id} href={item.href} className="agenda-item">
                <span className={`agenda-dot ${item.category}`} />
                <span>
                  <small>{item.category}</small>
                  {item.title}
                </span>
                <ArrowUpRight size={15} />
              </Link>
            ))
          ) : (
            <EmptyState
              title="A little breathing room."
              description="Nothing scheduled for this day."
            />
          )}
        </section>
      </div>
    </>
  );
}
