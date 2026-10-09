import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { AppProvider } from "@/components/shared/app-provider";
import { AppShell } from "@/components/layout/app-shell";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { mapPreferences } from "@/lib/data-mappers";
import type { Preferences } from "@/lib/types";
import "./globals.css";
import { SITE_URL } from "@/lib/site";
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "LifeOS", template: "%s · LifeOS" },
  description:
    "Personal dashboard for tasks, goals, subscriptions, and creator work.",
  appleWebApp: { capable: true, title: "LifeOS", statusBarStyle: "default" },
  other: { "apple-mobile-web-app-capable": "yes" },
  icons: {
    icon: [{ url: "/icons/lifeos-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f5f2" },
    { media: "(prefers-color-scheme: dark)", color: "#101510" },
  ],
};
async function initialSession(): Promise<{
  appearance: Preferences["appearance"];
  preferences?: Preferences;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await getCurrentUser();
    if (!user) return { appearance: "light" };

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    return {
      appearance:
        data?.appearance === "dark" || data?.appearance === "system"
          ? data.appearance
          : "light",
      preferences: data ? mapPreferences(data, user.email) : undefined,
    };
  } catch {
    return { appearance: "light" };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { appearance, preferences } = await initialSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={GeistSans.variable}>
        <ThemeProvider defaultTheme={appearance}>
          <AppProvider initialPreferences={preferences}>
            <AppShell>{children}</AppShell>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
