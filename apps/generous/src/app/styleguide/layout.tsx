"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import styles from "./layout.module.css";

const navigation = [
  {
    title: "Foundation",
    items: [
      { label: "Overview", href: "/styleguide" },
      { label: "Colors", href: "/styleguide/colors" },
      { label: "Typography", href: "/styleguide/typography" },
      { label: "Spacing", href: "/styleguide/spacing" },
      { label: "Shadows", href: "/styleguide/shadows" },
      { label: "Motion", href: "/styleguide/motion" },
    ],
  },
  {
    title: "Components",
    items: [
      { label: "All Components", href: "/styleguide/components" },
      { label: "Button", href: "/styleguide/components/button" },
      { label: "Input", href: "/styleguide/components/input" },
      { label: "Checkbox", href: "/styleguide/components/checkbox" },
      { label: "Radio", href: "/styleguide/components/radio" },
      { label: "Switch", href: "/styleguide/components/switch" },
      { label: "Select", href: "/styleguide/components/select" },
      { label: "Dialog", href: "/styleguide/components/dialog" },
      { label: "Popover", href: "/styleguide/components/popover" },
      { label: "Tooltip", href: "/styleguide/components/tooltip" },
      { label: "Toast", href: "/styleguide/components/toast" },
      { label: "Tabs", href: "/styleguide/components/tabs" },
      { label: "Accordion", href: "/styleguide/components/accordion" },
      { label: "Card", href: "/styleguide/components/card" },
      { label: "Table", href: "/styleguide/components/table" },
      { label: "Form", href: "/styleguide/components/form" },
    ],
  },
  {
    title: "Patterns",
    items: [
      { label: "Layout", href: "/styleguide/patterns/layout" },
      { label: "Forms", href: "/styleguide/patterns/forms" },
      { label: "Compositions", href: "/styleguide/patterns/compositions" },
    ],
  },
  {
    title: "Resources",
    items: [
      { label: "Accessibility", href: "/styleguide/accessibility" },
      { label: "Guidelines", href: "/styleguide/guidelines" },
    ],
  },
];

function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = stored || (systemDark ? "dark" : "light");
    setTheme(initial);
    document.documentElement.dataset.theme = initial;
  }, []);

  const toggle = useCallback(() => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);
  }, [theme]);

  if (!mounted) {
    return (
      <button type="button" className={styles.themeToggle} aria-label="Toggle theme">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="4" />
        </svg>
      </button>
    );
  }

  return (
    <button
      type="button"
      className={styles.themeToggle}
      onClick={toggle}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ) : (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      )}
    </button>
  );
}

export default function StyleguideLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link href="/styleguide" className={styles.logo}>
            <span className={styles.logoMark} />
            <span>Refined Utility</span>
          </Link>
          <ThemeToggle />
        </div>

        <nav className={styles.nav}>
          {navigation.map((section) => (
            <div key={section.title} className={styles.navSection}>
              <div className={styles.navSectionTitle}>{section.title}</div>
              <ul className={styles.navList}>
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={styles.navLink}
                      data-active={pathname === item.href}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <main className={styles.main}>
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}
