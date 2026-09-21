"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import {
  goals as initialGoals,
  tasks as initialTasks,
  monthlyTasks,
  subscriptions as initialSubscriptions,
  inboxItems,
} from "@/lib/mock-data";
import type { Goal, Preferences, Subscription, Task } from "@/lib/types";
export type AddKind = "menu" | "task" | "goal" | "subscription" | null;
function useAppState() {
  const [tasks, setTasks] = useState([...initialTasks, ...monthlyTasks]);
  const [goals, setGoals] = useState(initialGoals);
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [inbox, setInbox] = useState(inboxItems);
  const [addKind, setAddKind] = useState<AddKind>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [preferences, setPreferences] = useState<Preferences>({
    appearance: "light",
    currency: "NGN",
    startOfWeek: "monday",
    notifications: true,
    name: "Somto",
  });
  const [announcement, setAnnouncement] = useState("");
  return {
    tasks,
    goals,
    subscriptions,
    inbox,
    addKind,
    setAddKind,
    editingGoal,
    setEditingGoal,
    preferences,
    setPreferences,
    announcement,
    toggleTask: (id: string) =>
      setTasks((items) =>
        items.map((item) =>
          item.id === id ? { ...item, completed: !item.completed } : item,
        ),
      ),
    addTask: (task: Omit<Task, "id">) => {
      setTasks((items) => [...items, { ...task, id: crypto.randomUUID() }]);
      setAnnouncement("Task added");
    },
    addGoal: (goal: Omit<Goal, "id">) => {
      setGoals((items) => [...items, { ...goal, id: crypto.randomUUID() }]);
      setAnnouncement("Goal added");
    },
    updateGoal: (id: string, currentValue: number) => {
      setGoals((items) =>
        items.map((item) =>
          item.id === id ? { ...item, currentValue } : item,
        ),
      );
      setAnnouncement("Goal progress updated");
    },
    addSubscription: (subscription: Omit<Subscription, "id">) => {
      setSubscriptions((items) => [
        ...items,
        { ...subscription, id: crypto.randomUUID() },
      ]);
      setAnnouncement("Subscription added");
    },
    markRead: (id?: string) =>
      setInbox((items) =>
        items.map((item) =>
          !id || item.id === id ? { ...item, read: true } : item,
        ),
      ),
    dismiss: (id: string) =>
      setInbox((items) => items.filter((item) => item.id !== id)),
  };
}
type AppState = ReturnType<typeof useAppState>;
const AppContext = createContext<AppState | null>(null);
export function AppProvider({ children }: { children: ReactNode }) {
  const state = useAppState();
  return (
    <AppContext.Provider value={state}>
      <div data-theme={state.preferences.appearance}>
        {children}
        <span className="sr-only" role="status">
          {state.announcement}
        </span>
      </div>
    </AppContext.Provider>
  );
}
export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error("useApp needs AppProvider");
  return value;
}
