"use client";

import { Button, Card } from "@generous/ui";
import styles from "./page.module.css";

const variants = ["default", "outline", "elevated"] as const;

export default function CardPage() {
  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>Card</h1>
        <p className={styles.description}>
          Cards are containers that group related content and actions. They create visual hierarchy
          and help users scan information quickly.
        </p>
      </header>

      {/* Interactive Demo */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Interactive Demo</h2>
        <div className={styles.showcase}>
          <Card.Root style={{ width: "100%", maxWidth: "400px" }}>
            <Card.Header>
              <Card.Title>Create Project</Card.Title>
              <Card.Description>Deploy your new project in one-click.</Card.Description>
            </Card.Header>
            <Card.Content>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}>Name</label>
                <input
                  type="text"
                  placeholder="My Project"
                  style={{
                    padding: "8px 12px",
                    border: "1px solid var(--border-default)",
                    borderRadius: "var(--radius-md)",
                    background: "var(--surface-secondary)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>
            </Card.Content>
            <Card.Footer>
              <Button variant="outline">Cancel</Button>
              <Button>Deploy</Button>
            </Card.Footer>
          </Card.Root>
        </div>
      </section>

      {/* Variants */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Variants</h2>
        <p className={styles.sectionDescription}>
          Three visual variants for different contexts and emphasis levels.
        </p>
        <div className={styles.statesGrid}>
          {variants.map((variant) => (
            <div key={variant} className={styles.stateCard}>
              <p className={styles.stateLabel}>{variant}</p>
              <div className={styles.statePreview} style={{ width: "100%" }}>
                <Card.Root variant={variant} style={{ width: "100%" }}>
                  <Card.Header>
                    <Card.Title>Card Title</Card.Title>
                    <Card.Description>Card description text</Card.Description>
                  </Card.Header>
                  <Card.Content>
                    <p style={{ margin: 0, color: "var(--text-secondary)" }}>Content area</p>
                  </Card.Content>
                </Card.Root>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Cards */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Interactive Cards</h2>
        <p className={styles.sectionDescription}>
          Add the interactive prop for hover effects when the entire card is clickable.
        </p>
        <div className={styles.showcase}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: "16px",
              width: "100%",
            }}
          >
            <Card.Root interactive style={{ cursor: "pointer" }}>
              <Card.Header>
                <Card.Title>Analytics</Card.Title>
                <Card.Description>View your dashboard statistics</Card.Description>
              </Card.Header>
            </Card.Root>
            <Card.Root interactive style={{ cursor: "pointer" }}>
              <Card.Header>
                <Card.Title>Settings</Card.Title>
                <Card.Description>Manage your preferences</Card.Description>
              </Card.Header>
            </Card.Root>
            <Card.Root interactive style={{ cursor: "pointer" }}>
              <Card.Header>
                <Card.Title>Billing</Card.Title>
                <Card.Description>View invoices and payments</Card.Description>
              </Card.Header>
            </Card.Root>
          </div>
        </div>
      </section>

      {/* Composition */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Composition</h2>
        <p className={styles.sectionDescription}>
          Cards are composed of flexible subcomponents that can be arranged as needed.
        </p>
        <div className={styles.statesGrid}>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>Header Only</p>
            <Card.Root>
              <Card.Header>
                <Card.Title>Simple Card</Card.Title>
                <Card.Description>Just a header with title and description</Card.Description>
              </Card.Header>
            </Card.Root>
          </div>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>With Content</p>
            <Card.Root>
              <Card.Header>
                <Card.Title>Statistics</Card.Title>
              </Card.Header>
              <Card.Content>
                <div style={{ fontSize: "var(--text-2xl)", fontWeight: 600 }}>2,345</div>
                <div style={{ color: "var(--text-tertiary)", fontSize: "var(--text-sm)" }}>
                  Total views
                </div>
              </Card.Content>
            </Card.Root>
          </div>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>With Footer</p>
            <Card.Root>
              <Card.Header>
                <Card.Title>Notifications</Card.Title>
              </Card.Header>
              <Card.Content>
                <p style={{ margin: 0, color: "var(--text-secondary)" }}>
                  You have 3 unread messages
                </p>
              </Card.Content>
              <Card.Footer>
                <Button size="sm">View All</Button>
              </Card.Footer>
            </Card.Root>
          </div>
        </div>
      </section>

      {/* Usage */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Usage</h2>
        <div className={styles.codeBlock}>
          <pre className={styles.code}>
            <span className={styles.codeKeyword}>import</span> {"{ "}
            <span className={styles.codeComponent}>Card</span>
            {" }"} <span className={styles.codeKeyword}>from</span>{" "}
            <span className={styles.codeString}>&quot;@generous/ui&quot;</span>;{"\n\n"}
            <span className={styles.codeKeyword}>function</span> Example() {"{\n"}
            {"  "}
            <span className={styles.codeKeyword}>return</span> ({"\n"}
            {"    "}&lt;<span className={styles.codeComponent}>Card.Root</span> variant=
            <span className={styles.codeString}>&quot;default&quot;</span>&gt;{"\n"}
            {"      "}&lt;<span className={styles.codeComponent}>Card.Header</span>&gt;{"\n"}
            {"        "}&lt;<span className={styles.codeComponent}>Card.Title</span>&gt;Card
            Title&lt;/<span className={styles.codeComponent}>Card.Title</span>&gt;{"\n"}
            {"        "}&lt;<span className={styles.codeComponent}>Card.Description</span>
            &gt;Description&lt;/<span className={styles.codeComponent}>Card.Description</span>&gt;
            {"\n"}
            {"      "}&lt;/<span className={styles.codeComponent}>Card.Header</span>&gt;{"\n"}
            {"      "}&lt;<span className={styles.codeComponent}>Card.Content</span>&gt;{"\n"}
            {"        "}Content goes here{"\n"}
            {"      "}&lt;/<span className={styles.codeComponent}>Card.Content</span>&gt;{"\n"}
            {"      "}&lt;<span className={styles.codeComponent}>Card.Footer</span>&gt;{"\n"}
            {"        "}&lt;Button&gt;Action&lt;/Button&gt;{"\n"}
            {"      "}&lt;/<span className={styles.codeComponent}>Card.Footer</span>&gt;{"\n"}
            {"    "}&lt;/<span className={styles.codeComponent}>Card.Root</span>&gt;{"\n"}
            {"  "});{"\n"}
            {"}"}
          </pre>
        </div>
      </section>

      {/* Props */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Props</h2>
        <h3 style={{ fontSize: "var(--text-md)", marginBottom: "var(--space-3)" }}>Card.Root</h3>
        <table className={styles.propsTable}>
          <thead>
            <tr>
              <th>Prop</th>
              <th>Type</th>
              <th>Default</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>variant</td>
              <td className={styles.propType}>
                &quot;default&quot; | &quot;outline&quot; | &quot;elevated&quot;
              </td>
              <td className={styles.propDefault}>&quot;default&quot;</td>
              <td>Visual style variant</td>
            </tr>
            <tr>
              <td>interactive</td>
              <td className={styles.propType}>boolean</td>
              <td className={styles.propDefault}>false</td>
              <td>Enable hover effects</td>
            </tr>
          </tbody>
        </table>

        <h3
          style={{
            fontSize: "var(--text-md)",
            marginTop: "var(--space-6)",
            marginBottom: "var(--space-3)",
          }}
        >
          Subcomponents
        </h3>
        <table className={styles.propsTable}>
          <thead>
            <tr>
              <th>Component</th>
              <th>Element</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Card.Header</td>
              <td className={styles.propType}>div</td>
              <td>Container for title and description</td>
            </tr>
            <tr>
              <td>Card.Title</td>
              <td className={styles.propType}>h3</td>
              <td>Card heading</td>
            </tr>
            <tr>
              <td>Card.Description</td>
              <td className={styles.propType}>p</td>
              <td>Supporting text below title</td>
            </tr>
            <tr>
              <td>Card.Content</td>
              <td className={styles.propType}>div</td>
              <td>Main content area</td>
            </tr>
            <tr>
              <td>Card.Footer</td>
              <td className={styles.propType}>div</td>
              <td>Actions and secondary content</td>
            </tr>
          </tbody>
        </table>
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
              <li>Use cards to group related content</li>
              <li>Keep card content focused and scannable</li>
              <li>Use consistent card sizes in grids</li>
              <li>Add interactive prop for clickable cards</li>
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
              <li>Nest cards inside other cards</li>
              <li>Overload cards with too much content</li>
              <li>Mix different card sizes randomly</li>
              <li>Use cards for simple list items</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
