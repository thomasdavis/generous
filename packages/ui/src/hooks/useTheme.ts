"use client";

import { useCallback, useSyncExternalStore } from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

const THEME_KEY = "refined-utility-theme";

/**
 * Get the system's preferred color scheme
 */
function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Get the stored theme preference
 */
function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }
  return "system";
}

/**
 * Resolve the actual theme to apply
 */
function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === "system") {
    return getSystemTheme();
  }
  return theme;
}

/**
 * Apply theme to the document
 */
function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;

  const resolved = resolveTheme(theme);
  const root = document.documentElement;

  // Add transition class briefly for smooth theme change
  root.setAttribute("data-theme-transition", "");

  // Set the theme
  if (theme === "system") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", theme);
  }

  // Update color-scheme for browser UI
  root.style.colorScheme = resolved;

  // Remove transition class after animation completes
  setTimeout(() => {
    root.removeAttribute("data-theme-transition");
  }, 300);
}

// Event listeners for theme changes
const listeners = new Set<() => void>();

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function notifyListeners(): void {
  for (const listener of listeners) {
    listener();
  }
}

// Current theme state (for SSR safety)
let currentTheme: Theme = "system";
let currentResolved: ResolvedTheme = "light";

// Initialize on client
if (typeof window !== "undefined") {
  currentTheme = getStoredTheme();
  currentResolved = resolveTheme(currentTheme);
  applyTheme(currentTheme);

  // Listen for system preference changes
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (currentTheme === "system") {
      currentResolved = getSystemTheme();
      applyTheme(currentTheme);
      notifyListeners();
    }
  });
}

/**
 * Hook to manage theme state
 *
 * @example
 * const { theme, resolvedTheme, setTheme } = useTheme();
 *
 * // Toggle between light and dark
 * setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
 *
 * // Follow system preference
 * setTheme('system');
 */
export function useTheme() {
  const theme = useSyncExternalStore(
    subscribe,
    () => currentTheme,
    () => "system" as Theme,
  );

  const resolvedTheme = useSyncExternalStore(
    subscribe,
    () => currentResolved,
    () => "light" as ResolvedTheme,
  );

  const setTheme = useCallback((newTheme: Theme) => {
    currentTheme = newTheme;
    currentResolved = resolveTheme(newTheme);

    // Persist to localStorage
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(THEME_KEY, newTheme);
    }

    // Apply to DOM
    applyTheme(newTheme);

    // Notify all listeners
    notifyListeners();
  }, []);

  return {
    theme,
    resolvedTheme,
    setTheme,
    themes: ["light", "dark", "system"] as const,
  };
}

/**
 * Hook to check if we're in dark mode
 *
 * @example
 * const isDark = useIsDarkMode();
 */
export function useIsDarkMode(): boolean {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === "dark";
}
