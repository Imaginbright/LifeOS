"use client";

import { Monitor, Moon, Sun, LogOut, RefreshCw, Unplug } from "lucide-react";
import { useApp } from "@/components/shared/app-provider";
import { PageHeader } from "@/components/shared/primitives";
import { PlatformIcon } from "@/components/shared/platform-icon";
import { signOut } from "@/app/login/actions";
import type { Currency, Platform, Preferences } from "@/lib/types";

const providers: Array<{ platform: Platform; label: string }> = [{ platform: "youtube", label: "YouTube" }, { platform: "tiktok", label: "TikTok" }, { platform: "instagram", label: "Instagram" }];
const notices: Record<string, string> = { youtube_connected: "YouTube connected successfully.", tiktok_connected: "TikTok connected successfully.", youtube_denied: "YouTube authorization was cancelled.", tiktok_denied: "TikTok authorization was cancelled.", youtube_state_error: "The YouTube connection expired. Please try again.", tiktok_state_error: "The TikTok connection expired. Please try again.", youtube_error: "YouTube could not be connected. Please try again.", tiktok_error: "TikTok could not be connected. Please try again.", tiktok_https_required: "Connect TikTok from the deployed LifeOS app.", youtube_config: "YouTube is not configured." };

export function SettingsPage({ noticeKey }: { noticeKey?: string }) {
  const { preferences, appearance, themeReady, setAppearance, setPreferences, socialAccounts, connectedAccounts, socialPending, syncSocial, disconnectSocial } = useApp();
  const notice = noticeKey ? notices[noticeKey] ?? "The connection status changed." : "";
  const update = <K extends keyof Preferences>(key: K, value: Preferences[K]) => setPreferences((previous) => ({ ...previous, [key]: value }));
  return (
    <>
      <PageHeader eyebrow="Make yourself at home" title="Your space, your way." description="The little preferences that make it feel like you." />
      {notice && <div className="status-banner" role="status">{notice}</div>}
      <div className="settings-layout">
        <section className="card settings-card"><h2>The everyday details</h2>
          <div className="setting-row"><div><h3>What should we call you?</h3><p>A familiar face in your personal space.</p></div><label className="sr-only" htmlFor="display-name">Display name</label><input id="display-name" value={preferences.name} maxLength={30} onChange={(event) => update("name", event.target.value)} /></div>
          <div className="setting-row"><div><h3>Preferred currency</h3><p>Your default when adding subscriptions.</p></div><label className="sr-only" htmlFor="preferred-currency">Preferred currency</label><select id="preferred-currency" value={preferences.currency} onChange={(event) => update("currency", event.target.value as Currency)}>{["NGN", "USD", "GBP", "EUR"].map((value) => <option key={value}>{value}</option>)}</select></div>
          <div className="setting-row"><div><h3>Start of week</h3><p>A fresh start, on your terms.</p></div><label className="sr-only" htmlFor="start-week">Start of week</label><select id="start-week" value={preferences.startOfWeek} onChange={(event) => update("startOfWeek", event.target.value as Preferences["startOfWeek"])}><option value="monday">Monday</option><option value="sunday">Sunday</option></select></div>
        </section>
        <section className="card settings-card"><h2>Appearance</h2><p className="section-subtitle">Find your comfortable light.</p><div className="appearance-options">{([{ value: "light", title: "Light", icon: Sun }, { value: "dark", title: "Dark", icon: Moon }, { value: "system", title: "System", icon: Monitor }] as const).map((item) => <button key={item.value} className={themeReady && appearance === item.value ? "selected" : ""} aria-pressed={themeReady && appearance === item.value} disabled={!themeReady} onClick={() => setAppearance(item.value)}><item.icon size={24} strokeWidth={1.5} /><span>{item.title}</span></button>)}</div></section>
        <section className="card settings-card"><h2>Creator accounts</h2><p className="section-subtitle">Connect the accounts whose audience you want to follow.</p>
          {providers.map(({ platform, label }) => {
            const summary = socialAccounts.find((item) => item.platform === platform);
            const account = connectedAccounts.find((item) => item.platform === platform);
            const connected = summary?.status === "connected"; const busy = socialPending === platform;
            const status = platform === "instagram" ? "Needs setup" : connected ? `Connected${platform === "tiktok" ? " · Sandbox" : ""}` : summary?.status === "token_expired" ? "Token expired" : summary?.status === "error" ? "Connection error" : "Not connected";
            const avatar = account?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- provider avatar hosts are user-specific and dynamic.
              <img className="account-avatar" src={account.avatarUrl} alt="" referrerPolicy="no-referrer" />
            ) : <PlatformIcon platform={platform} />;
            return <div className="setting-row account-setting" key={platform}>{avatar}<div><h3>{account?.displayName || label}</h3><p>{status}{account?.lastSyncedAt ? ` · Synced ${new Date(account.lastSyncedAt).toLocaleDateString()}` : ""}</p>{account?.lastError && <small className="form-error">{account.lastError}</small>}</div><div className="account-actions">
              {platform === "instagram" ? <button className="button secondary" disabled>Needs setup</button> : connected ? <><button className="button secondary" disabled={busy} onClick={() => void syncSocial(platform)}><RefreshCw size={15} />{busy ? "Syncing…" : "Sync now"}</button><button className="icon-button" disabled={busy} aria-label={`Disconnect ${label}`} onClick={() => void disconnectSocial(platform)}><Unplug size={16} /></button></> : <a className="button secondary" href={`/api/integrations/${platform}/connect`}>{summary?.status === "token_expired" || summary?.status === "error" ? "Reconnect" : "Connect"}</a>}
            </div></div>;
          })}
        </section>
        <section className="card settings-card"><h2>Notifications</h2><div className="setting-row"><div><h3>Reminder preference</h3><p>Save your preference for future reminder delivery.</p></div><button className={`switch ${preferences.notifications ? "checked" : ""}`} role="switch" aria-label="Enable reminders" aria-checked={preferences.notifications} onClick={() => update("notifications", !preferences.notifications)}><span /></button></div><p className="settings-note">Your internal inbox stays available even when reminders are off.</p></section>
        <section className="card settings-card"><h2>Account</h2><div className="setting-row"><div><h3>{preferences.email ?? "Signed in"}</h3><p>Your LifeOS workspace is private to this account.</p></div><form action={signOut}><button className="button secondary" type="submit"><LogOut size={16} />Sign out</button></form></div></section>
      </div>
      <p className="data-note">Changes are saved securely to your private workspace.</p>
    </>
  );
}
