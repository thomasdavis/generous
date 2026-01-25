import styles from "./page.module.css";

const spacingScale = [
  { name: "0", token: "--space-0", value: "0", px: "0px" },
  { name: "px", token: "--space-px", value: "1px", px: "1px" },
  { name: "0.5", token: "--space-0-5", value: "0.125rem", px: "2px" },
  { name: "1", token: "--space-1", value: "0.25rem", px: "4px" },
  { name: "1.5", token: "--space-1-5", value: "0.375rem", px: "6px" },
  { name: "2", token: "--space-2", value: "0.5rem", px: "8px" },
  { name: "2.5", token: "--space-2-5", value: "0.625rem", px: "10px" },
  { name: "3", token: "--space-3", value: "0.75rem", px: "12px" },
  { name: "3.5", token: "--space-3-5", value: "0.875rem", px: "14px" },
  { name: "4", token: "--space-4", value: "1rem", px: "16px" },
  { name: "5", token: "--space-5", value: "1.25rem", px: "20px" },
  { name: "6", token: "--space-6", value: "1.5rem", px: "24px" },
  { name: "7", token: "--space-7", value: "1.75rem", px: "28px" },
  { name: "8", token: "--space-8", value: "2rem", px: "32px" },
  { name: "9", token: "--space-9", value: "2.25rem", px: "36px" },
  { name: "10", token: "--space-10", value: "2.5rem", px: "40px" },
  { name: "11", token: "--space-11", value: "2.75rem", px: "44px" },
  { name: "12", token: "--space-12", value: "3rem", px: "48px" },
  { name: "14", token: "--space-14", value: "3.5rem", px: "56px" },
  { name: "16", token: "--space-16", value: "4rem", px: "64px" },
  { name: "20", token: "--space-20", value: "5rem", px: "80px" },
  { name: "24", token: "--space-24", value: "6rem", px: "96px" },
];

const borderRadii = [
  { name: "none", token: "--radius-none", value: "0" },
  { name: "sm", token: "--radius-sm", value: "2px" },
  { name: "default", token: "--radius-default", value: "4px" },
  { name: "md", token: "--radius-md", value: "6px" },
  { name: "lg", token: "--radius-lg", value: "8px" },
  { name: "xl", token: "--radius-xl", value: "12px" },
  { name: "2xl", token: "--radius-2xl", value: "16px" },
  { name: "3xl", token: "--radius-3xl", value: "24px" },
  { name: "full", token: "--radius-full", value: "9999px" },
];

export default function SpacingPage() {
  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>Spacing</h1>
        <p className={styles.description}>
          Our spacing system is based on a 4px base unit with consistent scale for padding, margins,
          and gaps throughout the interface.
        </p>
      </header>

      {/* Spacing Scale Visual */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Spacing Scale</h2>
        <p className={styles.sectionDescription}>
          Based on 4px base unit. Use for padding, margin, gap, and other spacing needs.
        </p>
        <div className={styles.spacingScale}>
          {spacingScale.map((space) => (
            <div key={space.name} className={styles.spacingRow}>
              <div className={styles.spacingInfo}>
                <span className={styles.spacingName}>{space.name}</span>
                <span className={styles.spacingPx}>{space.px}</span>
              </div>
              <div className={styles.spacingVisual}>
                <div className={styles.spacingBar} style={{ width: `var(${space.token})` }} />
              </div>
              <span className={styles.spacingToken}>{space.token}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Usage Examples */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Common Usage</h2>
        <div className={styles.usageGrid}>
          <div className={styles.usageCard}>
            <h3 className={styles.usageTitle}>Component Padding</h3>
            <div className={styles.usageExample}>
              <div className={styles.paddingDemo}>
                <div
                  className={styles.paddingBox}
                  style={{ padding: "var(--space-2) var(--space-3)" }}
                >
                  <span>Button (sm)</span>
                </div>
                <code className={styles.usageCode}>--space-2 --space-3</code>
              </div>
              <div className={styles.paddingDemo}>
                <div
                  className={styles.paddingBox}
                  style={{ padding: "var(--space-2-5) var(--space-4)" }}
                >
                  <span>Button (md)</span>
                </div>
                <code className={styles.usageCode}>--space-2-5 --space-4</code>
              </div>
              <div className={styles.paddingDemo}>
                <div
                  className={styles.paddingBox}
                  style={{ padding: "var(--space-3) var(--space-6)" }}
                >
                  <span>Button (lg)</span>
                </div>
                <code className={styles.usageCode}>--space-3 --space-6</code>
              </div>
            </div>
          </div>

          <div className={styles.usageCard}>
            <h3 className={styles.usageTitle}>Card Spacing</h3>
            <div className={styles.cardDemo}>
              <div className={styles.cardBox}>
                <div className={styles.cardHeader}>Card Header</div>
                <div className={styles.cardBody}>Card content with proper padding</div>
              </div>
              <code className={styles.usageCode}>padding: --space-6</code>
            </div>
          </div>

          <div className={styles.usageCard}>
            <h3 className={styles.usageTitle}>Stack Gap</h3>
            <div className={styles.stackDemo}>
              <div className={styles.stackItems} style={{ gap: "var(--space-2)" }}>
                <div className={styles.stackItem}>Item</div>
                <div className={styles.stackItem}>Item</div>
                <div className={styles.stackItem}>Item</div>
              </div>
              <code className={styles.usageCode}>gap: --space-2 (tight)</code>
            </div>
            <div className={styles.stackDemo}>
              <div className={styles.stackItems} style={{ gap: "var(--space-4)" }}>
                <div className={styles.stackItem}>Item</div>
                <div className={styles.stackItem}>Item</div>
                <div className={styles.stackItem}>Item</div>
              </div>
              <code className={styles.usageCode}>gap: --space-4 (default)</code>
            </div>
          </div>

          <div className={styles.usageCard}>
            <h3 className={styles.usageTitle}>Section Spacing</h3>
            <div className={styles.sectionDemo}>
              <div className={styles.sectionBox}>Section 1</div>
              <div className={styles.sectionGap} style={{ height: "var(--space-12)" }}>
                <span>--space-12</span>
              </div>
              <div className={styles.sectionBox}>Section 2</div>
            </div>
          </div>
        </div>
      </section>

      {/* Border Radius */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Border Radius</h2>
        <p className={styles.sectionDescription}>
          Consistent radius values for rounded corners. Use larger radii for larger elements.
        </p>
        <div className={styles.radiusGrid}>
          {borderRadii.map((radius) => (
            <div key={radius.name} className={styles.radiusCard}>
              <div className={styles.radiusBox} style={{ borderRadius: `var(${radius.token})` }} />
              <div className={styles.radiusInfo}>
                <span className={styles.radiusName}>{radius.name}</span>
                <span className={styles.radiusValue}>{radius.value}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Guidelines */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Guidelines</h2>
        <div className={styles.guidelines}>
          <div className={styles.guideline}>
            <h3 className={styles.guidelineTitle}>Use consistent spacing</h3>
            <p className={styles.guidelineText}>
              Always use spacing tokens instead of arbitrary values. This ensures visual consistency
              across the entire interface.
            </p>
          </div>
          <div className={styles.guideline}>
            <h3 className={styles.guidelineTitle}>Match radius to size</h3>
            <p className={styles.guidelineText}>
              Larger elements should have larger border radius. Small buttons use radius-md, cards
              use radius-lg or radius-xl.
            </p>
          </div>
          <div className={styles.guideline}>
            <h3 className={styles.guidelineTitle}>Maintain visual hierarchy</h3>
            <p className={styles.guidelineText}>
              Use larger spacing to separate distinct sections, smaller spacing for related items
              within a group.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
