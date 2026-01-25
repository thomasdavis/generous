import styles from "./page.module.css";

const fontSizes = [
  { name: "xs", token: "--text-xs", size: "12px", example: "Extra small text" },
  { name: "sm", token: "--text-sm", size: "14px", example: "Small text for captions" },
  { name: "base", token: "--text-base", size: "16px", example: "Base text size for body copy" },
  { name: "lg", token: "--text-lg", size: "18px", example: "Large text for emphasis" },
  { name: "xl", token: "--text-xl", size: "20px", example: "Extra large text" },
  { name: "2xl", token: "--text-2xl", size: "24px", example: "Display text" },
  { name: "3xl", token: "--text-3xl", size: "30px", example: "Heading 3" },
  { name: "4xl", token: "--text-4xl", size: "36px", example: "Heading 2" },
  { name: "5xl", token: "--text-5xl", size: "48px", example: "Heading 1" },
  { name: "6xl", token: "--text-6xl", size: "60px", example: "Display" },
];

const fontWeights = [
  { name: "Thin", token: "--font-thin", weight: "100" },
  { name: "Extra Light", token: "--font-extralight", weight: "200" },
  { name: "Light", token: "--font-light", weight: "300" },
  { name: "Normal", token: "--font-normal", weight: "400" },
  { name: "Medium", token: "--font-medium", weight: "500" },
  { name: "Semibold", token: "--font-semibold", weight: "600" },
  { name: "Bold", token: "--font-bold", weight: "700" },
  { name: "Extra Bold", token: "--font-extrabold", weight: "800" },
  { name: "Black", token: "--font-black", weight: "900" },
];

const lineHeights = [
  { name: "None", token: "--leading-none", value: "1", description: "Tight headlines" },
  { name: "Tight", token: "--leading-tight", value: "1.25", description: "Compact headings" },
  { name: "Snug", token: "--leading-snug", value: "1.375", description: "Slightly compact" },
  { name: "Normal", token: "--leading-normal", value: "1.5", description: "Default body text" },
  {
    name: "Relaxed",
    token: "--leading-relaxed",
    value: "1.625",
    description: "Readable long-form",
  },
  { name: "Loose", token: "--leading-loose", value: "2", description: "Very spacious" },
];

const letterSpacings = [
  { name: "Tighter", token: "--tracking-tighter", value: "-0.05em", example: "TIGHTER" },
  { name: "Tight", token: "--tracking-tight", value: "-0.025em", example: "TIGHT" },
  { name: "Normal", token: "--tracking-normal", value: "0", example: "NORMAL" },
  { name: "Wide", token: "--tracking-wide", value: "0.025em", example: "WIDE" },
  { name: "Wider", token: "--tracking-wider", value: "0.05em", example: "WIDER" },
  { name: "Widest", token: "--tracking-widest", value: "0.1em", example: "WIDEST" },
];

export default function TypographyPage() {
  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>Typography</h1>
        <p className={styles.description}>
          Our typography system uses system fonts for optimal performance with a Major Third scale
          (1.25) for harmonious size progression.
        </p>
      </header>

      {/* Font Families */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Font Families</h2>
        <div className={styles.fontFamilies}>
          <div className={styles.fontFamily}>
            <p className={styles.fontFamilySample} style={{ fontFamily: "var(--font-sans)" }}>
              The quick brown fox jumps over the lazy dog
            </p>
            <div className={styles.fontFamilyInfo}>
              <p className={styles.fontFamilyName}>Sans-serif (Default)</p>
              <p className={styles.fontFamilyToken}>--font-sans</p>
              <p className={styles.fontFamilyValue}>system-ui, -apple-system, sans-serif</p>
            </div>
          </div>
          <div className={styles.fontFamily}>
            <p className={styles.fontFamilySample} style={{ fontFamily: "var(--font-mono)" }}>
              const greeting = &quot;Hello, World!&quot;;
            </p>
            <div className={styles.fontFamilyInfo}>
              <p className={styles.fontFamilyName}>Monospace</p>
              <p className={styles.fontFamilyToken}>--font-mono</p>
              <p className={styles.fontFamilyValue}>ui-monospace, SFMono-Regular, monospace</p>
            </div>
          </div>
        </div>
      </section>

      {/* Type Scale */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Type Scale</h2>
        <p className={styles.sectionDescription}>
          Based on a Major Third scale (1.25 ratio) for harmonious progression.
        </p>
        <div className={styles.typeScale}>
          {fontSizes.map((size) => (
            <div key={size.name} className={styles.typeScaleRow}>
              <div className={styles.typeScaleInfo}>
                <span className={styles.typeScaleName}>{size.name}</span>
                <span className={styles.typeScaleSize}>{size.size}</span>
                <span className={styles.typeScaleToken}>{size.token}</span>
              </div>
              <p className={styles.typeScaleSample} style={{ fontSize: `var(${size.token})` }}>
                {size.example}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Font Weights */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Font Weights</h2>
        <p className={styles.sectionDescription}>
          Use weight strategically: medium for UI elements, semibold/bold for headings.
        </p>
        <div className={styles.weightGrid}>
          {fontWeights.map((weight) => (
            <div key={weight.name} className={styles.weightCard}>
              <p className={styles.weightSample} style={{ fontWeight: `var(${weight.token})` }}>
                Aa
              </p>
              <div className={styles.weightInfo}>
                <p className={styles.weightName}>{weight.name}</p>
                <p className={styles.weightValue}>{weight.weight}</p>
                <p className={styles.weightToken}>{weight.token}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Line Heights */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Line Heights</h2>
        <p className={styles.sectionDescription}>
          Line height affects readability. Use tighter for headings, normal/relaxed for body text.
        </p>
        <div className={styles.lineHeights}>
          {lineHeights.map((lh) => (
            <div key={lh.name} className={styles.lineHeightRow}>
              <div className={styles.lineHeightInfo}>
                <span className={styles.lineHeightName}>{lh.name}</span>
                <span className={styles.lineHeightValue}>{lh.value}</span>
                <span className={styles.lineHeightDesc}>{lh.description}</span>
              </div>
              <div className={styles.lineHeightSample} style={{ lineHeight: `var(${lh.token})` }}>
                <p>
                  This is sample text to demonstrate line height. Multiple lines help visualize the
                  vertical rhythm and spacing between lines of text.
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Letter Spacing */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Letter Spacing (Tracking)</h2>
        <p className={styles.sectionDescription}>
          Tight tracking for headings, wide tracking for uppercase labels.
        </p>
        <div className={styles.trackingGrid}>
          {letterSpacings.map((ls) => (
            <div key={ls.name} className={styles.trackingCard}>
              <p className={styles.trackingSample} style={{ letterSpacing: `var(${ls.token})` }}>
                {ls.example}
              </p>
              <div className={styles.trackingInfo}>
                <p className={styles.trackingName}>{ls.name}</p>
                <p className={styles.trackingValue}>{ls.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Usage Examples */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Usage Guidelines</h2>
        <div className={styles.usageExamples}>
          <div className={styles.usageExample}>
            <h3 className={styles.usageTitle}>Headings</h3>
            <p className={styles.usageCode}>
              font-size: var(--text-3xl);
              <br />
              font-weight: var(--font-bold);
              <br />
              letter-spacing: var(--tracking-tight);
              <br />
              line-height: var(--leading-tight);
            </p>
            <div className={styles.usageDemo}>
              <h4
                style={{
                  fontSize: "var(--text-3xl)",
                  fontWeight: "var(--font-bold)",
                  letterSpacing: "var(--tracking-tight)",
                  lineHeight: "var(--leading-tight)",
                  margin: 0,
                }}
              >
                Page Heading
              </h4>
            </div>
          </div>

          <div className={styles.usageExample}>
            <h3 className={styles.usageTitle}>Labels (Uppercase)</h3>
            <p className={styles.usageCode}>
              font-size: var(--text-xs);
              <br />
              font-weight: var(--font-semibold);
              <br />
              letter-spacing: var(--tracking-widest);
              <br />
              text-transform: uppercase;
            </p>
            <div className={styles.usageDemo}>
              <span
                style={{
                  fontSize: "var(--text-xs)",
                  fontWeight: "var(--font-semibold)",
                  letterSpacing: "var(--tracking-widest)",
                  textTransform: "uppercase",
                  color: "var(--text-secondary)",
                }}
              >
                Section Label
              </span>
            </div>
          </div>

          <div className={styles.usageExample}>
            <h3 className={styles.usageTitle}>Body Text</h3>
            <p className={styles.usageCode}>
              font-size: var(--text-base);
              <br />
              font-weight: var(--font-normal);
              <br />
              line-height: var(--leading-relaxed);
              <br />
              color: var(--text-primary);
            </p>
            <div className={styles.usageDemo}>
              <p
                style={{
                  fontSize: "var(--text-base)",
                  fontWeight: "var(--font-normal)",
                  lineHeight: "var(--leading-relaxed)",
                  color: "var(--text-primary)",
                  margin: 0,
                }}
              >
                Body text should be easy to read with comfortable line height. This is the default
                style for paragraphs and long-form content.
              </p>
            </div>
          </div>

          <div className={styles.usageExample}>
            <h3 className={styles.usageTitle}>Code</h3>
            <p className={styles.usageCode}>
              font-family: var(--font-mono);
              <br />
              font-size: var(--text-sm);
              <br />
              background: var(--surface-secondary);
            </p>
            <div className={styles.usageDemo}>
              <code
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-sm)",
                  backgroundColor: "var(--surface-secondary)",
                  padding: "var(--space-1) var(--space-2)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                const value = calculate();
              </code>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
