import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { AppProvider } from "@/components/shared/app-provider";
import { AppShell } from "@/components/layout/app-shell";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: "LifeOS — Your personal space", template: "%s · LifeOS" },
  description:
    "A calm personal space for your tasks, goals, creative growth, and everyday essentials.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={GeistSans.variable}>
        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
