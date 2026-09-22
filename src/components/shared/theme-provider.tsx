"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";
import type { Preferences } from "@/lib/types";

export function ThemeProvider({
  children,
  defaultTheme,
}: {
  children: ReactNode;
  defaultTheme: Preferences["appearance"];
}) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableColorScheme
      enableSystem
      disableTransitionOnChange
      storageKey="lifeos-theme"
      themes={["light", "dark"]}
    >
      {children}
    </NextThemesProvider>
  );
}
