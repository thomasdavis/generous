import styles from "./page.module.css";

const shadows = [
  { name: "xs", token: "--shadow-xs", description: "Subtle elevation, inputs" },
  { name: "sm", token: "--shadow-sm", description: "Cards, buttons" },
  { name: "md", token: "--shadow-md", description: "Dropdowns, popovers" },
  { name: "lg", token: "--shadow-lg", description: "Modals, dialogs" },
  { name: "xl", token: "--shadow-xl", description: "Large floating elements" },
  { name: "2xl", token: "--shadow-2xl", description: "Maximum elevation" },
  { name: "inner", token: "--shadow-inner", description: "Inset shadow for pressed states" },
];

export default function ShadowsPage() {
  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>Shadows</h1>
        <p className={styles.description}>
          Our shadow system uses soft, diffuse shadows without hard offsets. This creates a natural
          sense of elevation while maintaining a clean, modern aesthetic.
        </p>
      </header>

      {/* Shadow Scale */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Elevation Scale</h2>
        <p className={styles.sectionDescription}>
          Each shadow level represents a different elevation. Higher elevation = larger shadow.
        </p>
        <div className={styles.shadowGrid}>
          {shadows.map((shadow) => (
            <div key={shadow.name} className={styles.shadowCard}>
              <div className={styles.shadowBox} style={{ boxShadow: `var(${shadow.token})` }} />
              <div className={styles.shadowInfo}>
                <h3 className={styles.shadowName}>{shadow.name}</h3>
                <p className={styles.shadowToken}>{shadow.token}</p>
                <p className={styles.shadowDesc}>{shadow.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Light vs Dark Mode</h2>
        <p className={styles.sectionDescription}>
          Shadows are more subtle in dark mode to avoid harsh contrast.
        </p>
        <div className={styles.comparison}>
          <div className={styles.comparisonBox} style={{ boxShadow: "var(--shadow-lg)" }}>
            <p className={styles.comparisonLabel}>Current theme</p>
            <p className={styles.comparisonToken}>--shadow-lg</p>
          </div>
        </div>
      </section>

      {/* Usage */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Usage Guidelines</h2>
        <div className={styles.guidelines}>
          <div className={styles.guideline}>
            <h3 className={styles.guidelineTitle}>Match shadow to elevation</h3>
            <p className={styles.guidelineText}>
              Use xs/sm for subtle depth on cards, md for dropdowns and popovers, lg/xl for modals
              and dialogs that should appear above the page.
            </p>
          </div>
          <div className={styles.guideline}>
            <h3 className={styles.guidelineTitle}>Avoid hard offsets</h3>
            <p className={styles.guidelineText}>
              Our design system uses soft, diffuse shadows. Never use hard offset shadows as they
              conflict with the refined utility aesthetic.
            </p>
          </div>
          <div className={styles.guideline}>
            <h3 className={styles.guidelineTitle}>Use sparingly</h3>
            <p className={styles.guidelineText}>
              Not everything needs a shadow. Use borders for most elements and reserve shadows for
              elements that truly need to appear elevated.
            </p>
          </div>
        </div>
      </section>

      {/* Code Example */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Code Example</h2>
        <div className={styles.codeBlock}>
          <pre className={styles.code}>
            {`.card {
  background-color: var(--surface-primary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.card:hover {
  box-shadow: var(--shadow-md);
}

.modal {
  box-shadow: var(--shadow-xl);
}`}
          </pre>
        </div>
      </section>
    </div>
  );
}
