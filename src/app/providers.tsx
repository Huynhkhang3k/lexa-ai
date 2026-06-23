"use client";

import * as React from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { ProfileSync } from "@/components/auth/profile-sync";
import { FirebaseAnalytics } from "@/components/analytics/firebase-analytics";
import { GradeLevelProvider } from "@/context/grade-level-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        storageKey="lexa-theme"
        disableTransitionOnChange
      >
        <GradeLevelProvider>
          <FirebaseAnalytics />
          <ProfileSync />
          {children}
        </GradeLevelProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
