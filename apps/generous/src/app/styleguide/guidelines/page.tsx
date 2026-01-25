import styles from "./page.module.css";

const dos = [
  {
    title: "Use semantic tokens",
    description:
      "Always use semantic tokens like --text-primary instead of primitive tokens like --color-gray-900.",
    example: "color: var(--text-primary);",
  },
  {
    title: "Use the spacing scale",
    description:
      "Use spacing tokens for all margins, padding, and gaps. This ensures consistent rhythm.",
    example: "padding: var(--space-4) var(--space-6);",
  },
  {
    title: "Use thin borders",
    description:
      "Borders should be 1px and use subtle colors. Borders define boundaries, not draw attention.",
    example: "border: 1px solid var(--border-subtle);",
  },
  {
    title: "Use soft shadows",
    description:
      "Shadows should be soft and diffuse. Use the shadow scale for consistent elevation.",
    example: "box-shadow: var(--shadow-md);",
  },
  {
    title: "Tight tracking for headings",
    description:
      "Large text looks better with tighter letter-spacing. Use --tracking-tight for headings.",
    example: "letter-spacing: var(--tracking-tight);",
  },
  {
    title: "Wide tracking for labels",
    description:
      "Uppercase labels need wider spacing to be readable. Use --tracking-wider or --tracking-widest.",
    example: "letter-spacing: var(--tracking-widest);",
  },
];

const donts = [
  {
    title: "Hard offset shadows",
    description:
      "Avoid shadows with hard offsets like (4px 4px 0 black). They conflict with our refined aesthetic.",
    example: "box-shadow: 4px 4px 0 black; ❌",
  },
  {
    title: "Pill shapes for containers",
    description:
      "Reserve full-radius pills for small elements like badges. Cards and containers should use --radius-lg or --radius-xl.",
    example: "border-radius: 9999px; /* on a card */ ❌",
  },
  {
    title: "Arbitrary values",
    description: "Never use arbitrary pixel values. Always use design tokens for consistency.",
    example: "padding: 17px; ❌",
  },
  {
    title: "Heavy borders",
    description: "Avoid thick borders that draw too much attention. Keep borders thin (1px).",
    example: "border: 3px solid black; ❌",
  },
  {
    title: "Loose tracking on body text",
    description:
      "Body text should use normal tracking. Wide tracking hurts readability in paragraphs.",
    example: "letter-spacing: 0.1em; /* on paragraphs */ ❌",
  },
  {
    title: "Decorative animations",
    description:
      "Every animation should have a purpose. Avoid animations that don't provide feedback or guide attention.",
    example: "animation: bounce 1s infinite; ❌",
  },
];

export default function GuidelinesPage() {
  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>Guidelines</h1>
        <p className={styles.description}>
          Design principles and best practices for using the Refined Utility design system
          effectively.
        </p>
      </header>

      {/* Design Philosophy */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Design Philosophy</h2>
        <div className={styles.philosophy}>
          <div className={styles.philosophyCard}>
            <h3 className={styles.philosophyTitle}>Technical</h3>
            <p className={styles.philosophyText}>
              Precision and clarity over decoration. Every element serves a purpose.
            </p>
          </div>
          <div className={styles.philosophyCard}>
            <h3 className={styles.philosophyTitle}>Trustworthy</h3>
            <p className={styles.philosophyText}>
              Clean, professional appearance that inspires confidence in the product.
            </p>
          </div>
          <div className={styles.philosophyCard}>
            <h3 className={styles.philosophyTitle}>Fast</h3>
            <p className={styles.philosophyText}>
              Interfaces should feel instant. Animations are subtle and purposeful.
            </p>
          </div>
          <div className={styles.philosophyCard}>
            <h3 className={styles.philosophyTitle}>Scannable</h3>
            <p className={styles.philosophyText}>
              Clear visual hierarchy allows users to quickly find what they need.
            </p>
          </div>
        </div>
      </section>

      {/* Do's */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Do&apos;s</h2>
        <div className={styles.guidelineGrid}>
          {dos.map((item) => (
            <div key={item.title} className={styles.guidelineCard} data-type="do">
              <div className={styles.guidelineIcon}>✓</div>
              <h3 className={styles.guidelineTitle}>{item.title}</h3>
              <p className={styles.guidelineText}>{item.description}</p>
              <code className={styles.guidelineCode}>{item.example}</code>
            </div>
          ))}
        </div>
      </section>

      {/* Don'ts */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Don&apos;ts</h2>
        <div className={styles.guidelineGrid}>
          {donts.map((item) => (
            <div key={item.title} className={styles.guidelineCard} data-type="dont">
              <div className={styles.guidelineIcon}>✗</div>
              <h3 className={styles.guidelineTitle}>{item.title}</h3>
              <p className={styles.guidelineText}>{item.description}</p>
              <code className={styles.guidelineCode}>{item.example}</code>
            </div>
          ))}
        </div>
      </section>

      {/* Component Usage */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Component Usage</h2>
        <div className={styles.usageList}>
          <div className={styles.usageItem}>
            <h3 className={styles.usageTitle}>Buttons</h3>
            <p className={styles.usageText}>
              Use <strong>primary</strong> for main actions (one per view),{" "}
              <strong>secondary</strong> for supporting actions, <strong>outline</strong> for less
              important actions, and <strong>ghost</strong> for inline or toolbar actions.
            </p>
          </div>
          <div className={styles.usageItem}>
            <h3 className={styles.usageTitle}>Cards</h3>
            <p className={styles.usageText}>
              Cards should have <strong>--surface-primary</strong> background, thin border, and{" "}
              <strong>--radius-lg</strong> or larger. Use subtle shadows only when elevation is
              meaningful.
            </p>
          </div>
          <div className={styles.usageItem}>
            <h3 className={styles.usageTitle}>Forms</h3>
            <p className={styles.usageText}>
              Group related fields together. Always include labels. Show validation errors inline
              below the field. Use the Field component for consistent spacing.
            </p>
          </div>
          <div className={styles.usageItem}>
            <h3 className={styles.usageTitle}>Modals</h3>
            <p className={styles.usageText}>
              Use Dialog for confirmations and simple forms. Use Sheet for complex content that
              requires more space. Always provide a clear way to close.
            </p>
          </div>
        </div>
      </section>

      {/* Color Usage */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Color Usage</h2>
        <div className={styles.colorUsage}>
          <div className={styles.colorUsageItem}>
            <div
              className={styles.colorSwatch}
              style={{ backgroundColor: "var(--accent-primary)" }}
            />
            <div className={styles.colorUsageInfo}>
              <h4 className={styles.colorUsageName}>Accent (Neon Lime)</h4>
              <p className={styles.colorUsageDesc}>
                Primary CTAs, focus indicators, success states. Use sparingly for maximum impact.
              </p>
            </div>
          </div>
          <div className={styles.colorUsageItem}>
            <div
              className={styles.colorSwatch}
              style={{ backgroundColor: "var(--action-primary)" }}
            />
            <div className={styles.colorUsageInfo}>
              <h4 className={styles.colorUsageName}>Action Primary (Jet Black / White)</h4>
              <p className={styles.colorUsageDesc}>
                Primary buttons. High contrast, professional appearance.
              </p>
            </div>
          </div>
          <div className={styles.colorUsageItem}>
            <div className={styles.colorSwatch} style={{ backgroundColor: "var(--text-error)" }} />
            <div className={styles.colorUsageInfo}>
              <h4 className={styles.colorUsageName}>Error (Red)</h4>
              <p className={styles.colorUsageDesc}>
                Validation errors, destructive actions, alerts. Never use decoratively.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
