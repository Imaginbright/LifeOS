"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  CheckCheck,
  Flag,
  ChartNoAxesCombined,
  CreditCard,
  Inbox,
  CalendarDays,
  Settings2,
  Plus,
  Bell,
  ChevronDown,
  Leaf,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/components/shared/app-provider";
import { QuickAdd } from "@/components/shared/quick-add";
import { PublicSiteShell } from "@/components/layout/public-site-shell";
import type { ReactNode } from "react";
const navigation = [
  { href: "/dashboard", label: "Dashboard", mobile: "Home", icon: LayoutGrid },
  { href: "/tasks", label: "Tasks", mobile: "Tasks", icon: CheckCheck },
  { href: "/goals", label: "Goals", mobile: "Goals", icon: Flag },
  {
    href: "/creator",
    label: "Creator",
    mobile: "Creator",
    icon: ChartNoAxesCombined,
  },
  { href: "/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
];
export function AppShell({ children, signedIn }: { children: ReactNode; signedIn: boolean }) {
  const path = usePathname();
  const { inbox, setAddKind, preferences, error, clearError, refresh, loading } = useApp();
  const unread = inbox.filter((item) => !item.read).length;
  if (path === "/" || path === "/privacy" || path === "/terms") {
    return <PublicSiteShell landingAction={path === "/" ? signedIn ? "dashboard" : "login" : undefined}>{children}</PublicSiteShell>;
  }
  if (path === "/login") return <>{children}</>;
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <aside className="sidebar">
        <Link href="/dashboard" className="wordmark">
          <span className="brand-mark">
            <Leaf size={21} />
          </span>
          LifeOS<span className="wordmark-dot">.</span>
        </Link>
        <p className="sidebar-caption">A little more intentional.</p>
        <div className="nav-label">Overview</div>
        <nav aria-label="Main navigation">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn("nav-item", path === item.href && "active")}
              aria-current={path === item.href ? "page" : undefined}
            >
              <item.icon size={19} strokeWidth={1.6} />
              {item.label}
              {item.href === "/inbox" && unread > 0 && (
                <span className="count-badge">{unread}</span>
              )}
            </Link>
          ))}
        </nav>
        <div className="nav-label general-label">General</div>
        <Link
          href="/settings"
          className={cn("nav-item", path === "/settings" && "active")}
          aria-current={path === "/settings" ? "page" : undefined}
        >
          <Settings2 size={19} strokeWidth={1.6} />
          Settings
        </Link>
        <div className="sidebar-bottom">
          <div className="small-reminder">
            <Sun size={21} strokeWidth={1.3} />
            <p>
              Small steps.
              <br />A life well lived.
            </p>
            <span>Make space for what matters.</span>
          </div>
          <Link href="/settings" className="profile">
            <span className="avatar">{preferences.name.charAt(0)}</span>
            <span>
              <strong>{preferences.name}</strong>
              <small>Your personal space</small>
            </span>
            <ChevronDown size={15} />
          </Link>
        </div>
      </aside>
      <div className="main-shell">
        <div className="top-bar">
          <div className="breadcrumb">
            My space<span>/</span>
            <strong>
              {navigation.find((item) => item.href === path)?.label ??
                "Settings"}
            </strong>
          </div>
          <Link href="/dashboard" className="mobile-wordmark">
            LifeOS.
          </Link>
          <div className="top-actions">
            <span className="demo-label">
              <span /> Personal workspace
            </span>
            <button
              className="icon-button desktop-add"
              aria-label="Quick add"
              onClick={() => setAddKind("menu")}
            >
              <Plus size={20} />
            </button>
            <Link
              className="icon-button notification-button"
              href="/inbox"
              aria-label={`Inbox, ${unread} unread notifications`}
            >
              <Bell size={19} />
              {unread > 0 && <i />}
            </Link>
            <Link
              href="/settings"
              className="avatar small"
              aria-label="Open settings"
            >
              {preferences.name.charAt(0)}
            </Link>
          </div>
        </div>
        <main id="main" className="main-content">
          {error && <div className="error-banner" role="alert"><span>{error}</span><button onClick={() => { clearError(); void refresh(); }}>Try again</button></div>}
          {loading && <div className="loading-line" role="status">Loading your space…</div>}
          {children}
          <footer className="page-footer">
            <span>Life, a little more in focus.</span>
            <nav aria-label="Legal links">
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
            </nav>
            <span>
              LifeOS <span className="footer-dot">·</span> Made for your
              everyday
            </span>
          </footer>
        </main>
      </div>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {[navigation[0], navigation[1], navigation[3], navigation[2]].map(
          (item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(path === item.href && "active")}
              aria-current={path === item.href ? "page" : undefined}
            >
              <item.icon size={20} strokeWidth={1.7} />
              <span>{item.mobile}</span>
            </Link>
          ),
        )}
        <button
          className="mobile-quick-add"
          onClick={() => setAddKind("menu")}
          aria-label="Quick add and more pages"
        >
          <Plus size={25} />
        </button>
      </nav>
      <QuickAdd />
    </div>
  );
}
