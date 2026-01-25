"use client";

import { Card } from "@generous/ui";
import styles from "./page.module.css";

export default function LayoutPatternsPage() {
  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>Layout Patterns</h1>
        <p className={styles.description}>
          Common layout patterns using CSS Grid and Flexbox with design tokens. These patterns
          provide consistent spacing and responsive behavior.
        </p>
      </header>

      {/* Spacing Scale */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Spacing Scale</h2>
        <p className={styles.sectionDescription}>
          Use semantic spacing tokens for consistent layouts.
        </p>
        <div className={styles.showcase}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
            {[
              { token: "--space-1", value: "4px" },
              { token: "--space-2", value: "8px" },
              { token: "--space-3", value: "12px" },
              { token: "--space-4", value: "16px" },
              { token: "--space-5", value: "20px" },
              { token: "--space-6", value: "24px" },
              { token: "--space-8", value: "32px" },
              { token: "--space-10", value: "40px" },
              { token: "--space-12", value: "48px" },
            ].map(({ token, value }) => (
              <div key={token} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <code
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--text-sm)",
                    color: "var(--text-secondary)",
                    minWidth: "120px",
                  }}
                >
                  {token}
                </code>
                <div
                  style={{
                    width: value,
                    height: "24px",
                    background: "var(--accent-primary)",
                    borderRadius: "var(--radius-sm)",
                  }}
                />
                <span style={{ color: "var(--text-tertiary)", fontSize: "var(--text-sm)" }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stack Pattern */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Stack Pattern</h2>
        <p className={styles.sectionDescription}>
          Vertical stacking with consistent spacing. Use for lists, form fields, and content
          sections.
        </p>
        <div className={styles.statesGrid}>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>Tight (space-2)</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              <div
                style={{
                  padding: "8px",
                  background: "var(--surface-secondary)",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                Item 1
              </div>
              <div
                style={{
                  padding: "8px",
                  background: "var(--surface-secondary)",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                Item 2
              </div>
              <div
                style={{
                  padding: "8px",
                  background: "var(--surface-secondary)",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                Item 3
              </div>
            </div>
          </div>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>Normal (space-4)</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              <div
                style={{
                  padding: "8px",
                  background: "var(--surface-secondary)",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                Item 1
              </div>
              <div
                style={{
                  padding: "8px",
                  background: "var(--surface-secondary)",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                Item 2
              </div>
              <div
                style={{
                  padding: "8px",
                  background: "var(--surface-secondary)",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                Item 3
              </div>
            </div>
          </div>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>Loose (space-6)</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
              <div
                style={{
                  padding: "8px",
                  background: "var(--surface-secondary)",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                Item 1
              </div>
              <div
                style={{
                  padding: "8px",
                  background: "var(--surface-secondary)",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                Item 2
              </div>
              <div
                style={{
                  padding: "8px",
                  background: "var(--surface-secondary)",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                Item 3
              </div>
            </div>
          </div>
        </div>
        <div className={styles.codeBlock}>
          <pre className={styles.code}>
            {`.stack {\n`}
            {`  display: flex;\n`}
            {`  flex-direction: column;\n`}
            {`  gap: var(--space-4);\n`}
            {`}`}
          </pre>
        </div>
      </section>

      {/* Cluster Pattern */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Cluster Pattern</h2>
        <p className={styles.sectionDescription}>
          Horizontal grouping that wraps. Use for tags, buttons, and inline elements.
        </p>
        <div className={styles.showcase}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
            {["React", "TypeScript", "CSS", "Design Systems", "Accessibility", "Performance"].map(
              (tag) => (
                <span
                  key={tag}
                  style={{
                    padding: "4px 12px",
                    background: "var(--surface-secondary)",
                    borderRadius: "var(--radius-full)",
                    fontSize: "var(--text-sm)",
                  }}
                >
                  {tag}
                </span>
              ),
            )}
          </div>
        </div>
        <div className={styles.codeBlock}>
          <pre className={styles.code}>
            {`.cluster {\n`}
            {`  display: flex;\n`}
            {`  flex-wrap: wrap;\n`}
            {`  gap: var(--space-2);\n`}
            {`}`}
          </pre>
        </div>
      </section>

      {/* Grid Pattern */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Grid Pattern</h2>
        <p className={styles.sectionDescription}>
          Responsive grid layouts using CSS Grid with auto-fit.
        </p>
        <div className={styles.showcase}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "var(--space-4)",
              width: "100%",
            }}
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <Card.Root key={n}>
                <Card.Header>
                  <Card.Title>Card {n}</Card.Title>
                </Card.Header>
                <Card.Content>
                  <p style={{ margin: 0, color: "var(--text-secondary)" }}>Content</p>
                </Card.Content>
              </Card.Root>
            ))}
          </div>
        </div>
        <div className={styles.codeBlock}>
          <pre className={styles.code}>
            {`.grid {\n`}
            {`  display: grid;\n`}
            {`  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\n`}
            {`  gap: var(--space-4);\n`}
            {`}`}
          </pre>
        </div>
      </section>

      {/* Sidebar Layout */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Sidebar Layout</h2>
        <p className={styles.sectionDescription}>Fixed sidebar with flexible content area.</p>
        <div className={styles.showcase}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "240px 1fr",
              gap: "var(--space-4)",
              width: "100%",
              minHeight: "200px",
            }}
          >
            <div
              style={{
                background: "var(--surface-secondary)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-4)",
              }}
            >
              <p style={{ margin: 0, fontWeight: 500 }}>Sidebar</p>
              <p
                style={{
                  margin: "8px 0 0",
                  color: "var(--text-tertiary)",
                  fontSize: "var(--text-sm)",
                }}
              >
                Fixed width
              </p>
            </div>
            <div
              style={{
                background: "var(--surface-secondary)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-4)",
              }}
            >
              <p style={{ margin: 0, fontWeight: 500 }}>Main Content</p>
              <p
                style={{
                  margin: "8px 0 0",
                  color: "var(--text-tertiary)",
                  fontSize: "var(--text-sm)",
                }}
              >
                Flexible width
              </p>
            </div>
          </div>
        </div>
        <div className={styles.codeBlock}>
          <pre className={styles.code}>
            {`.sidebar-layout {\n`}
            {`  display: grid;\n`}
            {`  grid-template-columns: 240px 1fr;\n`}
            {`  gap: var(--space-4);\n`}
            {`}`}
          </pre>
        </div>
      </section>

      {/* Container Pattern */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Container Pattern</h2>
        <p className={styles.sectionDescription}>Centered content with max-width constraints.</p>
        <div className={styles.statesGrid}>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>sm (640px)</p>
            <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>
              Narrow content, dialogs
            </p>
          </div>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>md (768px)</p>
            <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>
              Forms, articles
            </p>
          </div>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>lg (1024px)</p>
            <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>
              Main content areas
            </p>
          </div>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>xl (1280px)</p>
            <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>
              Wide layouts
            </p>
          </div>
        </div>
        <div className={styles.codeBlock}>
          <pre className={styles.code}>
            {`.container {\n`}
            {`  width: 100%;\n`}
            {`  max-width: 1024px;\n`}
            {`  margin-inline: auto;\n`}
            {`  padding-inline: var(--space-4);\n`}
            {`}`}
          </pre>
        </div>
      </section>

      {/* Split Pattern */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Split Pattern</h2>
        <p className={styles.sectionDescription}>Two-column layout with space between items.</p>
        <div className={styles.showcase}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              padding: "var(--space-4)",
              background: "var(--surface-secondary)",
              borderRadius: "var(--radius-lg)",
            }}
          >
            <div>
              <p style={{ margin: 0, fontWeight: 500 }}>Settings</p>
              <p
                style={{
                  margin: "4px 0 0",
                  color: "var(--text-tertiary)",
                  fontSize: "var(--text-sm)",
                }}
              >
                Manage your preferences
              </p>
            </div>
            <span
              style={{
                padding: "4px 12px",
                background: "var(--accent-primary)",
                color: "var(--color-gray-900)",
                borderRadius: "var(--radius-sm)",
                fontWeight: 500,
              }}
            >
              Edit
            </span>
          </div>
        </div>
        <div className={styles.codeBlock}>
          <pre className={styles.code}>
            {`.split {\n`}
            {`  display: flex;\n`}
            {`  justify-content: space-between;\n`}
            {`  align-items: center;\n`}
            {`}`}
          </pre>
        </div>
      </section>

      {/* Best Practices */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Best Practices</h2>
        <div className={styles.statesGrid}>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel} style={{ color: "var(--color-green-500)" }}>
              Do
            </p>
            <ul
              style={{
                color: "var(--text-secondary)",
                fontSize: "var(--text-sm)",
                margin: 0,
                paddingLeft: "var(--space-4)",
              }}
            >
              <li>Use design tokens for spacing</li>
              <li>Prefer CSS Grid for 2D layouts</li>
              <li>Use Flexbox for 1D alignment</li>
              <li>Test at multiple viewport sizes</li>
            </ul>
          </div>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel} style={{ color: "var(--color-red-500)" }}>
              Don&apos;t
            </p>
            <ul
              style={{
                color: "var(--text-secondary)",
                fontSize: "var(--text-sm)",
                margin: 0,
                paddingLeft: "var(--space-4)",
              }}
            >
              <li>Use arbitrary pixel values</li>
              <li>Nest too many flex containers</li>
              <li>Forget mobile-first approach</li>
              <li>Ignore container queries</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
