"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = (resolvedTheme ?? "dark") === "dark";

  function toggle() {
    setTheme(isDark ? "light" : "dark");
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={toggle}
      aria-label={isDark ? "Bật chế độ sáng" : "Bật chế độ tối"}
      className="rounded-xl"
    >
      {!mounted ? (
        <span className="inline-block h-4 w-4" aria-hidden />
      ) : isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
      <span className="hidden sm:inline">
        {!mounted ? "Theme" : isDark ? "Sáng" : "Tối"}
      </span>
    </Button>
  );
}
