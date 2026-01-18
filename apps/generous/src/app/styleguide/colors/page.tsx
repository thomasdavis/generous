import styles from "./page.module.css";

const grayScale = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

const semanticSurfaces = [
  { name: "Base", token: "--surface-base", style: { backgroundColor: "var(--surface-base)" } },
  {
    name: "Primary",
    token: "--surface-primary",
    style: { backgroundColor: "var(--surface-primary)" },
  },
  {
    name: "Secondary",
    token: "--surface-secondary",
    style: { backgroundColor: "var(--surface-secondary)" },
  },
  { name: "Hover", token: "--surface-hover", style: { backgroundColor: "var(--surface-hover)" } },
  {
    name: "Success",
    token: "--surface-success",
    style: { backgroundColor: "var(--surface-success)" },
  },
  { name: "Error", token: "--surface-error", style: { backgroundColor: "var(--surface-error)" } },
  {
    name: "Warning",
    token: "--surface-warning",
    style: { backgroundColor: "var(--surface-warning)" },
  },
  { name: "Info", token: "--surface-info", style: { backgroundColor: "var(--surface-info)" } },
];

const textColors = [
  { name: "Primary", token: "--text-primary", style: { color: "var(--text-primary)" } },
  { name: "Secondary", token: "--text-secondary", style: { color: "var(--text-secondary)" } },
  { name: "Tertiary", token: "--text-tertiary", style: { color: "var(--text-tertiary)" } },
  { name: "Disabled", token: "--text-disabled", style: { color: "var(--text-disabled)" } },
  { name: "Success", token: "--text-success", style: { color: "var(--text-success)" } },
  { name: "Error", token: "--text-error", style: { color: "var(--text-error)" } },
  { name: "Warning", token: "--text-warning", style: { color: "var(--text-warning)" } },
  { name: "Info", token: "--text-info", style: { color: "var(--text-info)" } },
];

const borderColors = [
  {
    name: "Default",
    token: "--border-default",
    style: { backgroundColor: "var(--border-default)" },
  },
  { name: "Subtle", token: "--border-subtle", style: { backgroundColor: "var(--border-subtle)" } },
  { name: "Strong", token: "--border-strong", style: { backgroundColor: "var(--border-strong)" } },
  { name: "Focus", token: "--border-focus", style: { backgroundColor: "var(--border-focus)" } },
  {
    name: "Success",
    token: "--border-success",
    style: { backgroundColor: "var(--border-success)" },
  },
  { name: "Error", token: "--border-error", style: { backgroundColor: "var(--border-error)" } },
];

export default function ColorsPage() {
  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>Colors</h1>
        <p className={styles.description}>
          Our color system uses OKLCH for perceptually uniform colors with automatic dark mode
          support via CSS light-dark() function.
        </p>
      </header>

      {/* Accent Color */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Accent - Neon Lime "Spark"</h2>
        <div className={styles.accentShowcase}>
          <div className={styles.accentBox} />
          <div className={styles.accentInfo}>
            <h3 className={styles.accentName}>Neon Lime</h3>
            <p className={styles.accentValue}>#ccff00 · oklch(93% 0.27 120)</p>
            <p className={styles.accentDescription}>
              The signature accent color used for primary actions, focus states, and key interactive
              elements. High contrast and high energy.
            </p>
          </div>
        </div>
      </section>

      {/* Gray Scale */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Gray Scale</h2>
        <p className={styles.sectionDescription}>
          Neutral gray palette used for surfaces, text, and borders.
        </p>
        <div className={styles.colorScale}>
          <p className={styles.colorScaleName}>Gray</p>
          <div className={styles.colorScaleRow}>
            {grayScale.map((shade) => (
              <div
                key={shade}
                className={styles.colorSwatch}
                style={{
                  backgroundColor: `var(--color-gray-${shade})`,
                  color: shade > 500 ? "white" : "black",
                }}
              >
                <span className={styles.colorSwatchLabel}>{shade}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Semantic Surfaces */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Surface Colors</h2>
        <p className={styles.sectionDescription}>
          Semantic surface colors that automatically adapt between light and dark modes.
        </p>
        <div className={styles.semanticGrid}>
          {semanticSurfaces.map((surface) => (
            <div key={surface.token} className={styles.semanticCard}>
              <div className={styles.semanticSwatch} style={surface.style} />
              <div className={styles.semanticInfo}>
                <p className={styles.semanticName}>{surface.name}</p>
                <p className={styles.semanticToken}>{surface.token}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Text Colors */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Text Colors</h2>
        <p className={styles.sectionDescription}>Semantic text colors for hierarchy and states.</p>
        <div className={styles.textExamples}>
          {textColors.map((text) => (
            <div key={text.token} className={styles.textExample}>
              <p className={styles.textSample} style={text.style}>
                {text.name} text example
              </p>
              <p className={styles.textToken}>{text.token}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Border Colors */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Border Colors</h2>
        <p className={styles.sectionDescription}>Semantic border colors for various UI states.</p>
        <div className={styles.semanticGrid}>
          {borderColors.map((border) => (
            <div key={border.token} className={styles.semanticCard}>
              <div className={styles.semanticSwatch} style={{ ...border.style, height: 8 }} />
              <div className={styles.semanticInfo}>
                <p className={styles.semanticName}>{border.name}</p>
                <p className={styles.semanticToken}>{border.token}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Usage Example */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Usage</h2>
        <div className={styles.surfaceStack}>
          <div className={styles.surfaceExample} style={{ backgroundColor: "var(--surface-base)" }}>
            <p className={styles.surfaceLabel}>Base Surface</p>
            <p className={styles.surfaceToken}>background-color: var(--surface-base);</p>
          </div>
          <div
            className={styles.surfaceExample}
            style={{ backgroundColor: "var(--surface-primary)" }}
          >
            <p className={styles.surfaceLabel}>Primary Surface (Cards)</p>
            <p className={styles.surfaceToken}>background-color: var(--surface-primary);</p>
          </div>
          <div
            className={styles.surfaceExample}
            style={{ backgroundColor: "var(--surface-secondary)" }}
          >
            <p className={styles.surfaceLabel}>Secondary Surface (Inset)</p>
            <p className={styles.surfaceToken}>background-color: var(--surface-secondary);</p>
          </div>
        </div>
      </section>
    </div>
  );
}
