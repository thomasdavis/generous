import Link from "next/link";
import styles from "./page.module.css";

const foundationCards = [
  {
    title: "Colors",
    description: "OKLCH color system with semantic mappings and automatic dark mode.",
    href: "/styleguide/colors",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="13.5" cy="6.5" r="4.5" />
        <circle cx="17.5" cy="17.5" r="4.5" />
        <circle cx="6.5" cy="17.5" r="4.5" />
      </svg>
    ),
  },
  {
    title: "Typography",
    description: "Type scale, weights, and text styles for consistent hierarchy.",
    href: "/styleguide/typography",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="4 7 4 4 20 4 20 7" />
        <line x1="9" y1="20" x2="15" y2="20" />
        <line x1="12" y1="4" x2="12" y2="20" />
      </svg>
    ),
  },
  {
    title: "Spacing",
    description: "Consistent spacing scale from 4px to 96px.",
    href: "/styleguide/spacing",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
  },
  {
    title: "Shadows",
    description: "Soft, diffuse shadows for elevation hierarchy.",
    href: "/styleguide/shadows",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18" />
      </svg>
    ),
  },
  {
    title: "Motion",
    description: "Animation durations, easing curves, and keyframes.",
    href: "/styleguide/motion",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    ),
  },
];

const componentCards = [
  {
    title: "Buttons",
    description: "Primary, secondary, outline, and ghost variants with all states.",
    href: "/styleguide/components/button",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="8" width="18" height="8" rx="2" />
      </svg>
    ),
  },
  {
    title: "Forms",
    description: "Inputs, selects, checkboxes, and complete form patterns.",
    href: "/styleguide/components/form",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18" />
        <path d="M9 21V9" />
      </svg>
    ),
  },
  {
    title: "Dialogs",
    description: "Modal dialogs, alerts, drawers, and sheet overlays.",
    href: "/styleguide/components/dialog",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <line x1="2" y1="8" x2="22" y2="8" />
      </svg>
    ),
  },
  {
    title: "Navigation",
    description: "Tabs, accordion, breadcrumbs, and pagination.",
    href: "/styleguide/components/tabs",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    ),
  },
];

const principles = [
  {
    title: "Technical Precision",
    description:
      "Clean lines, crisp borders, and purposeful whitespace. Every element has a clear function.",
  },
  {
    title: "Trustworthy & Fast",
    description: "High-performance aesthetics with smooth transitions and reduced motion support.",
  },
  {
    title: "Scannable Interface",
    description: "Clear visual hierarchy, uppercase labels, and tight tracking for headings.",
  },
  {
    title: "NO Toy Aesthetics",
    description: "No pill shapes for containers, no hard offset shadows, no rounded everything.",
  },
];

export default function StyleguidePage() {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Refined Utility</h1>
        <p className={styles.heroDescription}>
          A comprehensive design system built with modern CSS, full dark mode support, and
          accessibility at its core. 47 components, one cohesive vision.
        </p>
      </section>

      {/* Design Principles */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Design Principles</h2>
        <div className={styles.principlesGrid}>
          {principles.map((principle) => (
            <div key={principle.title} className={styles.principle}>
              <h3 className={styles.principleTitle}>{principle.title}</h3>
              <p className={styles.principleDescription}>{principle.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Foundation */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Foundation</h2>
        <p className={styles.sectionDescription}>
          Design tokens form the foundation of our system. Colors, typography, spacing, and motion
          are all defined as CSS variables.
        </p>
        <div className={styles.cardsGrid}>
          {foundationCards.map((card) => (
            <Link key={card.href} href={card.href} className={styles.card}>
              <div className={styles.cardIcon}>{card.icon}</div>
              <h3 className={styles.cardTitle}>{card.title}</h3>
              <p className={styles.cardDescription}>{card.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Components */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Components</h2>
        <p className={styles.sectionDescription}>
          47 accessible components built with React and CSS Modules. Each component supports all
          interaction states and dark mode.
        </p>
        <div className={styles.cardsGrid}>
          {componentCards.map((card) => (
            <Link key={card.href} href={card.href} className={styles.card}>
              <div className={styles.cardIcon}>{card.icon}</div>
              <h3 className={styles.cardTitle}>{card.title}</h3>
              <p className={styles.cardDescription}>{card.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
