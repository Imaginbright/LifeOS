"use client";

import Link from "next/link";
import { Leaf, Moon, Sun } from "lucide-react";
import type { ReactNode } from "react";
import { useApp } from "@/components/shared/app-provider";
import { SUPPORT_EMAIL } from "@/lib/site";

export function PublicSiteShell({ children }: { children: ReactNode }) {
  const { preferences, setPreferences } = useApp();
  const dark = preferences.appearance === "dark";

  return (
    <div className="public-site-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="public-header">
        <Link href="/" className="wordmark" aria-label="LifeOS home">
          <span className="brand-mark">
            <Leaf size={21} />
          </span>
          LifeOS<span className="wordmark-dot">.</span>
        </Link>
        <nav aria-label="Legal navigation">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <button
            className="icon-button legal-theme-toggle"
            type="button"
            aria-label={`Use ${dark ? "light" : "dark"} appearance`}
            onClick={() =>
              setPreferences((current) => ({
                ...current,
                appearance: dark ? "light" : "dark",
              }))
            }
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </nav>
      </header>

      <main id="main" className="public-main">
        {children}
      </main>

      <footer className="public-footer">
        <div>
          <Link href="/" className="public-footer-brand">
            LifeOS.
          </Link>
          <p>A personal space for a more intentional everyday.</p>
        </div>
        <nav aria-label="Footer navigation">
          <Link href="/">Back to LifeOS</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
          <a href={`mailto:${SUPPORT_EMAIL}`}>Contact</a>
        </nav>
        <p className="public-copyright">© 2026 LifeOS</p>
      </footer>
    </div>
  );
}
