"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ThemeValue = "light" | "dark" | "system";

const themeMeta: Record<ThemeValue, { label: string; icon: typeof Sun }> = {
  light: { label: "Light", icon: Sun },
  dark: { label: "Dark", icon: Moon },
  system: { label: "System", icon: Monitor },
};

export function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = (mounted ? theme : "system") as ThemeValue;
  const ActiveIcon = themeMeta[currentTheme].icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={compact ? "icon" : "sm"}
          className={compact ? "rounded-full" : "gap-2 rounded-full"}
        >
          <ActiveIcon className="h-4 w-4" />
          {!compact && themeMeta[currentTheme].label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(Object.entries(themeMeta) as Array<[ThemeValue, { label: string; icon: typeof Sun }]>).map(
          ([value, config]) => {
            const Icon = config.icon;

            return (
              <DropdownMenuItem key={value} onClick={() => setTheme(value)} className="gap-2">
                <Icon className="h-4 w-4" />
                {config.label}
              </DropdownMenuItem>
            );
          },
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
