"use client";

import * as React from "react";
import { ThemeProvider } from "next-themes";
import { GradeLevelProvider } from "@/context/grade-level-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      storageKey="lexa-theme"
      disableTransitionOnChange
    >
      <GradeLevelProvider>{children}</GradeLevelProvider>
    </ThemeProvider>
  );
}
