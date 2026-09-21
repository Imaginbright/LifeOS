"use client";
import { Monitor, Moon, Sun } from "lucide-react";
import { useApp } from "@/components/shared/app-provider";
import { PageHeader } from "@/components/shared/primitives";
import { PlatformIcon } from "@/components/shared/platform-icon";
import { socialAccounts } from "@/lib/mock-data";
import type { Currency, Preferences } from "@/lib/types";
export function SettingsPage() {
  const { preferences, setPreferences } = useApp();
  const update = <K extends keyof Preferences>(key: K, value: Preferences[K]) =>
    setPreferences((previous) => ({ ...previous, [key]: value }));
  return (
    <>
      <PageHeader
        eyebrow="Make yourself at home"
        title="Your space, your way."
        description="The little preferences that make it feel like you."
      />
      <div className="settings-layout">
        <section className="card settings-card">
          <h2>The everyday details</h2>
          <div className="setting-row">
            <div>
              <h3>What should we call you?</h3>
              <p>A familiar face in your personal space.</p>
            </div>
            <label className="sr-only" htmlFor="display-name">
              Display name
            </label>
            <input
              id="display-name"
              value={preferences.name}
              maxLength={30}
              onChange={(event) => update("name", event.target.value)}
            />
          </div>
          <div className="setting-row">
            <div>
              <h3>Preferred currency</h3>
              <p>Your default when adding subscriptions.</p>
            </div>
            <label className="sr-only" htmlFor="preferred-currency">
              Preferred currency
            </label>
            <select
              id="preferred-currency"
              value={preferences.currency}
              onChange={(event) =>
                update("currency", event.target.value as Currency)
              }
            >
              {["NGN", "USD", "GBP", "EUR"].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </div>
          <div className="setting-row">
            <div>
              <h3>Start of week</h3>
              <p>A fresh start, on your terms.</p>
            </div>
            <label className="sr-only" htmlFor="start-week">
              Start of week
            </label>
            <select
              id="start-week"
              value={preferences.startOfWeek}
              onChange={(event) =>
                update(
                  "startOfWeek",
                  event.target.value as Preferences["startOfWeek"],
                )
              }
            >
              <option value="monday">Monday</option>
              <option value="sunday">Sunday</option>
            </select>
          </div>
        </section>
        <section className="card settings-card">
          <h2>Appearance</h2>
          <p className="section-subtitle">Find your comfortable light.</p>
          <div className="appearance-options">
            {(
              [
                { value: "light", title: "Light", icon: Sun },
                { value: "dark", title: "Dark", icon: Moon },
                { value: "system", title: "System", icon: Monitor },
              ] as const
            ).map((item) => (
              <button
                key={item.value}
                className={
                  preferences.appearance === item.value ? "selected" : ""
                }
                aria-pressed={preferences.appearance === item.value}
                onClick={() => update("appearance", item.value)}
              >
                <item.icon size={24} strokeWidth={1.5} />
                <span>{item.title}</span>
              </button>
            ))}
          </div>
        </section>
        <section className="card settings-card">
          <h2>Creator accounts</h2>
          <p className="section-subtitle">
            A home for your connections, when they’re ready.
          </p>
          {socialAccounts.map((account) => (
            <div className="setting-row account-setting" key={account.id}>
              <PlatformIcon platform={account.platform} />
              <div>
                <h3>{account.displayName}</h3>
                <p>Not connected</p>
              </div>
              <button className="button secondary" disabled>
                Coming soon
              </button>
            </div>
          ))}
        </section>
        <section className="card settings-card">
          <h2>Notifications</h2>
          <div className="setting-row">
            <div>
              <h3>Reminder preference</h3>
              <p>Save your preference for future reminder delivery.</p>
            </div>
            <button
              className={`switch ${preferences.notifications ? "checked" : ""}`}
              role="switch"
              aria-label="Enable reminders"
              aria-checked={preferences.notifications}
              onClick={() =>
                update("notifications", !preferences.notifications)
              }
            >
              <span />
            </button>
          </div>
          <p className="settings-note">
            Your inbox stays available. Reminder delivery is coming later.
          </p>
        </section>
      </div>
      <p className="data-note">
        This is your frontend preview. Changes stay with you until you refresh.
      </p>
    </>
  );
}
