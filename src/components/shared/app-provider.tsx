"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, useSyncExternalStore, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import type { AppData, Goal, Preferences, Subscription, Task } from "@/lib/types";

export type AddKind = "menu" | "task" | "goal" | "subscription" | null;
const defaults: AppData = {
  tasks: [], goals: [], subscriptions: [], inbox: [], socialAccounts: [], socialSnapshots: [], connectedAccounts: [],
  preferences: { appearance: "light", currency: "NGN", startOfWeek: "monday", notifications: true, name: "You", timezone: "Africa/Lagos" },
};

const subscribeToHydration = () => () => {};
const isAppearance = (value: string | undefined): value is Preferences["appearance"] =>
  value === "light" || value === "dark" || value === "system";

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error || "The change could not be saved");
  return body as T;
}

function useAppState() {
  const path = usePathname();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const themeReady = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const appearance = isAppearance(theme) ? theme : defaults.preferences.appearance;
  const resolvedAppearance = resolvedTheme === "dark" ? "dark" : "light";
  const publicPage = ["/login", "/privacy", "/terms"].includes(path);
  const [data, setData] = useState<AppData>(defaults);
  const [loading, setLoading] = useState(!publicPage);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [socialPending, setSocialPending] = useState<string | null>(null);
  const [addKind, setAddKind] = useState<AddKind>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const loaded = useRef(false);
  const preferencesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const themeRef = useRef(theme);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  const refresh = useCallback(async () => {
    if (publicPage) { setLoading(false); return; }
    setLoading(true); setError("");
    try {
      const incoming = await api<AppData>("/api/data", { cache: "no-store" });
      const browserAppearance = isAppearance(themeRef.current)
        ? themeRef.current
        : incoming.preferences.appearance;
      const profileAppearance = incoming.preferences.appearance;
      incoming.preferences = { ...incoming.preferences, appearance: browserAppearance };
      setData(incoming);
      loaded.current = true;
      if (browserAppearance !== profileAppearance) {
        void api("/api/profile", {
          method: "PATCH",
          body: JSON.stringify({ ...incoming.preferences, appearance: browserAppearance }),
        }).catch((reason) => setError(reason.message));
      }
    }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Your data could not be loaded"); }
    finally { setLoading(false); }
  }, [publicPage]);

  useEffect(() => {
    const timer = setTimeout(() => { void refresh(); }, 0);
    return () => clearTimeout(timer);
  }, [refresh]);

  const setPreferences: Dispatch<SetStateAction<Preferences>> = (next) => {
    setData((current) => {
      const requested = typeof next === "function" ? next(current.preferences) : next;
      const preferences = {
        ...requested,
        appearance: isAppearance(themeRef.current)
          ? themeRef.current
          : current.preferences.appearance,
      };
      if (loaded.current) {
        if (preferencesTimer.current) clearTimeout(preferencesTimer.current);
        preferencesTimer.current = setTimeout(() => {
          void api("/api/profile", { method: "PATCH", body: JSON.stringify(preferences) }).catch((reason) => setError(reason.message));
        }, 450);
      }
      return { ...current, preferences };
    });
  };

  const setAppearance = (next: Preferences["appearance"]) => {
    setTheme(next);
    themeRef.current = next;
    setData((current) => {
      const preferences = { ...current.preferences, appearance: next };
      if (loaded.current) {
        void api("/api/profile", {
          method: "PATCH",
          body: JSON.stringify(preferences),
        }).catch((reason) => setError(reason.message));
      }
      return { ...current, preferences };
    });
  };

  async function mutate<T>(work: () => Promise<T>, success: string) {
    setPending(true); setError("");
    try { const result = await work(); setAnnouncement(success); return result; }
    catch (reason) { setError(reason instanceof Error ? reason.message : "The change could not be saved"); return null; }
    finally { setPending(false); }
  }

  return {
    ...data, appearance, resolvedAppearance, themeReady, setAppearance, loading, error, pending, socialPending, refresh, addKind, setAddKind, editingGoal, setEditingGoal, setPreferences, announcement,
    clearError: () => setError(""),
    toggleTask: async (id: string) => {
      const previous = data.tasks;
      const task = previous.find((item) => item.id === id); if (!task) return;
      setData((current) => ({ ...current, tasks: current.tasks.map((item) => item.id === id ? { ...item, completed: !item.completed } : item) }));
      const saved = await mutate(() => api<Task>(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify({ completed: !task.completed }) }), "Task updated");
      if (!saved) setData((current) => ({ ...current, tasks: previous }));
    },
    addTask: (task: Omit<Task, "id">) => mutate(async () => {
      const saved = await api<Task>("/api/tasks", { method: "POST", body: JSON.stringify(task) });
      setData((current) => ({ ...current, tasks: [...current.tasks, saved] })); return saved;
    }, "Task added"),
    addGoal: (goal: Omit<Goal, "id">) => mutate(async () => {
      const saved = await api<Goal>("/api/goals", { method: "POST", body: JSON.stringify(goal) });
      setData((current) => ({ ...current, goals: [...current.goals, saved] })); return saved;
    }, "Goal added"),
    updateGoal: (id: string, currentValue: number) => mutate(async () => {
      const saved = await api<Goal>(`/api/goals/${id}`, { method: "PATCH", body: JSON.stringify({ currentValue }) });
      setData((current) => ({ ...current, goals: current.goals.map((item) => item.id === id ? saved : item) })); return saved;
    }, "Goal progress updated"),
    addSubscription: (subscription: Omit<Subscription, "id">) => mutate(async () => {
      const saved = await api<Subscription>("/api/subscriptions", { method: "POST", body: JSON.stringify(subscription) });
      setData((current) => ({ ...current, subscriptions: [...current.subscriptions, saved] })); return saved;
    }, "Subscription added"),
    markRead: async (id?: string) => {
      const saved = await mutate(() => api("/api/inbox", { method: "PATCH", body: JSON.stringify({ action: id ? "read" : "read_all", id }) }), "Inbox updated");
      if (saved) setData((current) => ({ ...current, inbox: current.inbox.map((item) => !id || item.id === id ? { ...item, read: true } : item) }));
    },
    dismiss: async (id: string) => {
      const saved = await mutate(() => api("/api/inbox", { method: "PATCH", body: JSON.stringify({ action: "dismiss", id }) }), "Notification dismissed");
      if (saved) setData((current) => ({ ...current, inbox: current.inbox.filter((item) => item.id !== id) }));
    },
    syncSocial: async (platform: string) => {
      setSocialPending(platform); setError("");
      try {
        const result = await api<{ status?: string; message?: string; results?: Array<{ status: string }> }>("/api/social/sync", { method: "POST", body: JSON.stringify({ platform }) });
        if (result.results?.some((item) => item.status === "failed")) throw new Error("This account could not be synced. Check its connection status.");
        await refresh(); setAnnouncement(result.status === "skipped" ? result.message || "Recently synced" : `${platform} synced`); return true;
      }
      catch (reason) { setError(reason instanceof Error ? reason.message : "Sync failed"); return null; }
      finally { setSocialPending(null); }
    },
    disconnectSocial: async (platform: string) => {
      setSocialPending(platform); setError("");
      try { await api(`/api/social/${platform}/disconnect`, { method: "POST" }); await refresh(); setAnnouncement(`${platform} disconnected`); return true; }
      catch (reason) { setError(reason instanceof Error ? reason.message : "Disconnect failed"); return null; }
      finally { setSocialPending(null); }
    },
  };
}

type AppState = ReturnType<typeof useAppState>;
const AppContext = createContext<AppState | null>(null);
export function AppProvider({ children }: { children: ReactNode }) {
  const state = useAppState();
  return <AppContext.Provider value={state}>{children}<span className="sr-only" role="status">{state.announcement}</span></AppContext.Provider>;
}
export function useApp() { const value = useContext(AppContext); if (!value) throw new Error("useApp needs AppProvider"); return value; }
