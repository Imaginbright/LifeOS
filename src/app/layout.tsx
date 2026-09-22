import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { AppProvider } from "@/components/shared/app-provider";
import { AppShell } from "@/components/layout/app-shell";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { createClient } from "@/lib/supabase/server";
import type { Preferences } from "@/lib/types";
import "./globals.css";
import { SITE_URL } from "@/lib/site";
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "LifeOS — Your personal space", template: "%s · LifeOS" },
  description:
    "A calm personal space for your tasks, goals, creative growth, and everyday essentials.",
};
async function defaultAppearance(): Promise<Preferences["appearance"]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return "light";

    const { data } = await supabase
      .from("profiles")
      .select("appearance")
      .eq("id", user.id)
      .maybeSingle();
    return data?.appearance === "dark" || data?.appearance === "system"
      ? data.appearance
      : "light";
  } catch {
    return "light";
  }
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const appearance = await defaultAppearance();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={GeistSans.variable}>
        <ThemeProvider defaultTheme={appearance}>
          <AppProvider>
            <AppShell>{children}</AppShell>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
