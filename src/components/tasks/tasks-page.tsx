"use client";
import * as Tabs from "@radix-ui/react-tabs";
import { useSearchParams } from "next/navigation";
import { format, parseISO } from "date-fns";
import { useApp } from "@/components/shared/app-provider";
import {
  AddButton,
  EmptyState,
  PageHeader,
} from "@/components/shared/primitives";
import { TaskList, TaskProgress } from "./task-list";
import { todayDate } from "@/lib/date";
export function TasksPage() {
  const { tasks, setAddKind } = useApp();
  const current = todayDate();
  const currentDate = parseISO(current);
  const searchParams = useSearchParams();
  const selected = searchParams.get("view");
  const view =
    selected === "upcoming" || selected === "monthly" ? selected : "today";
  const setView = (value: string) => {
    window.history.replaceState(
      null,
      "",
      value === "today" ? "/tasks" : `/tasks?view=${value}`,
    );
  };
  const today = tasks.filter(
    (task) => task.scope === "daily" && task.date === current,
  );
  const monthly = tasks.filter(
    (task) => task.scope === "monthly" && task.date.startsWith(current.slice(0, 7)),
  );
  const upcoming = tasks.filter(
    (task) => task.scope === "daily" && task.date > current,
  );
  const overdue = tasks.filter(
    (task) =>
      task.scope === "daily" && task.date < current && !task.completed,
  );
  return (
    <>
      <PageHeader
        eyebrow="A little more headspace"
        title="Your tasks."
        description="Make room for what matters today."
        action={
          <AddButton onClick={() => setAddKind("task")}>Add task</AddButton>
        }
      />
      <Tabs.Root value={view} onValueChange={setView}>
        <Tabs.List className="tabs" aria-label="Task views">
          {["today", "upcoming", "monthly"].map((value) => (
            <Tabs.Trigger value={value} key={value}>
              {value}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        <Tabs.Content value="today">
          <section className="card tasks-page-card">
            <div className="section-title">
              <div>
                <p className="eyebrow">Today</p>
                <h2>{format(currentDate, "EEEE, MMMM d")}</h2>
              </div>
              <span className="date-tile">
                {format(currentDate, "d")}<small>{format(currentDate, "MMM").toUpperCase()}</small>
              </span>
            </div>
            <TaskProgress tasks={today} />
            <TaskList tasks={today} />
          </section>
        </Tabs.Content>
        <Tabs.Content value="upcoming">
          <div className="upcoming-groups">
            {overdue.length > 0 && (
              <section className="card">
                <div className="section-title">
                  <h2>Ready for a fresh start</h2>
                  <span className="tag warning">{overdue.length} overdue</span>
                </div>
                <TaskList tasks={overdue} />
              </section>
            )}
            {[...new Set(upcoming.map((task) => task.date))]
              .sort()
              .map((date) => (
                <section className="card" key={date}>
                  <div className="section-title">
                    <h2>{format(parseISO(date), "EEEE, MMMM d")}</h2>
                    <span className="muted">
                      {upcoming.filter((task) => task.date === date).length}{" "}
                      tasks
                    </span>
                  </div>
                  <TaskList
                    tasks={upcoming.filter((task) => task.date === date)}
                  />
                </section>
              ))}
            {!upcoming.length && !overdue.length && (
              <EmptyState
                title="Your horizon is clear."
                description="Add a task for a future date to see it here."
              />
            )}
          </div>
        </Tabs.Content>
        <Tabs.Content value="monthly">
          <div className="monthly-overview">
            <div>
              <p className="eyebrow">The bigger picture</p>
              <h2>
                {format(currentDate, "MMMM")} <span>{format(currentDate, "yyyy")}</span>
              </h2>
            </div>
            <div>
              <strong>
                {monthly.filter((task) => task.completed).length}
                <span> / {monthly.length}</span>
              </strong>
              <p>monthly intentions complete</p>
            </div>
          </div>
          <div className="monthly-grid">
            {[...new Set(monthly.map((task) => task.category))].map(
              (category) => (
                <section className="card monthly-category" key={category}>
                  <div className="section-title">
                    <h2>{category}</h2>
                    <span className="tag">
                      {
                        monthly.filter(
                          (task) =>
                            task.category === category && task.completed,
                        ).length
                      }{" "}
                      /{" "}
                      {
                        monthly.filter((task) => task.category === category)
                          .length
                      }
                    </span>
                  </div>
                  <TaskList
                    tasks={monthly.filter((task) => task.category === category)}
                  />
                </section>
              ),
            )}
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </>
  );
}
