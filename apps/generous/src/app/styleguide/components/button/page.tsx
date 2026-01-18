"use client";

import { Button } from "@generous/ui";
import styles from "./page.module.css";

const variants = ["primary", "secondary", "outline", "ghost", "destructive"] as const;
const sizes = ["sm", "md", "lg"] as const;

export default function ButtonPage() {
  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>Button</h1>
        <p className={styles.description}>
          Buttons trigger actions or navigation. They communicate what will happen when users
          interact with them.
        </p>
      </header>

      {/* Interactive Demo */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Interactive Demo</h2>
        <div className={styles.showcase}>
          <Button variant="primary">Primary Action</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
      </section>

      {/* Variants */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Variants</h2>
        <p className={styles.sectionDescription}>
          Use different variants to establish visual hierarchy and convey meaning.
        </p>
        <div className={styles.statesGrid}>
          {variants.map((variant) => (
            <div key={variant} className={styles.stateCard}>
              <p className={styles.stateLabel}>{variant}</p>
              <div className={styles.statePreview}>
                <Button variant={variant}>
                  {variant.charAt(0).toUpperCase() + variant.slice(1)}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sizes */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Sizes</h2>
        <p className={styles.sectionDescription}>
          Three sizes to fit different contexts and use cases.
        </p>
        <div className={styles.showcase}>
          {sizes.map((size) => (
            <Button key={size} size={size}>
              Size {size.toUpperCase()}
            </Button>
          ))}
        </div>
      </section>

      {/* States */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>States</h2>
        <p className={styles.sectionDescription}>
          Visual feedback for different interaction states.
        </p>
        <div className={styles.statesGrid}>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>Default</p>
            <div className={styles.statePreview}>
              <Button>Default</Button>
            </div>
          </div>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>Disabled</p>
            <div className={styles.statePreview}>
              <Button disabled>Disabled</Button>
            </div>
          </div>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>Loading</p>
            <div className={styles.statePreview}>
              <Button loading>Loading</Button>
            </div>
          </div>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>Full Width</p>
            <div className={styles.statePreview} style={{ width: "100%" }}>
              <Button fullWidth>Full Width</Button>
            </div>
          </div>
        </div>
      </section>

      {/* With Icons */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>With Icons</h2>
        <p className={styles.sectionDescription}>
          Buttons can include icons to reinforce their meaning.
        </p>
        <div className={styles.showcase}>
          <Button>
            <svg
              aria-hidden="true"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add Item
          </Button>
          <Button variant="secondary">
            Download
            <svg
              aria-hidden="true"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </Button>
          <Button variant="outline">
            <svg
              aria-hidden="true"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit
          </Button>
        </div>
      </section>

      {/* Icon Only */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Icon Only</h2>
        <p className={styles.sectionDescription}>
          Square buttons for icon-only actions. Always include an aria-label.
        </p>
        <div className={styles.showcase}>
          {sizes.map((size) => (
            <Button key={size} size={size} aria-label="Add item">
              <svg
                aria-hidden="true"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </Button>
          ))}
          <Button variant="outline" aria-label="Settings">
            <svg
              aria-hidden="true"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </Button>
          <Button variant="ghost" aria-label="Menu">
            <svg
              aria-hidden="true"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </Button>
        </div>
      </section>

      {/* Usage */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Usage</h2>
        <div className={styles.codeBlock}>
          <pre className={styles.code}>
            <span className={styles.codeKeyword}>import</span> {"{ "}
            <span className={styles.codeComponent}>Button</span>
            {" }"} <span className={styles.codeKeyword}>from</span>{" "}
            <span className={styles.codeString}>"@generous/ui"</span>;{"\n\n"}
            <span className={styles.codeKeyword}>function</span> Example() {"{\n"}
            {"  "}
            <span className={styles.codeKeyword}>return</span> ({"\n"}
            {"    "}&lt;<span className={styles.codeComponent}>Button</span> variant=
            <span className={styles.codeString}>"primary"</span> size=
            <span className={styles.codeString}>"md"</span>&gt;{"\n"}
            {"      "}Click me{"\n"}
            {"    "}&lt;/<span className={styles.codeComponent}>Button</span>&gt;
            {"\n"}
            {"  "});{"\n"}
            {"}"}
          </pre>
        </div>
      </section>

      {/* Props */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Props</h2>
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
                "primary" | "secondary" | "outline" | "ghost" | "destructive"
              </td>
              <td className={styles.propDefault}>"primary"</td>
              <td>Visual style variant</td>
            </tr>
            <tr>
              <td>size</td>
              <td className={styles.propType}>"sm" | "md" | "lg"</td>
              <td className={styles.propDefault}>"md"</td>
              <td>Size of the button</td>
            </tr>
            <tr>
              <td>disabled</td>
              <td className={styles.propType}>boolean</td>
              <td className={styles.propDefault}>false</td>
              <td>Whether the button is disabled</td>
            </tr>
            <tr>
              <td>loading</td>
              <td className={styles.propType}>boolean</td>
              <td className={styles.propDefault}>false</td>
              <td>Show loading spinner</td>
            </tr>
            <tr>
              <td>fullWidth</td>
              <td className={styles.propType}>boolean</td>
              <td className={styles.propDefault}>false</td>
              <td>Make button full width</td>
            </tr>
            <tr>
              <td>asChild</td>
              <td className={styles.propType}>boolean</td>
              <td className={styles.propDefault}>false</td>
              <td>Render as child element (for links)</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Accessibility */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Accessibility</h2>
        <ul style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
          <li>Uses native button element for full keyboard support</li>
          <li>Focus indicator visible on keyboard focus</li>
          <li>Disabled state communicated via aria-disabled</li>
          <li>Loading state announces to screen readers</li>
          <li>Icon-only buttons require aria-label</li>
        </ul>
      </section>
    </div>
  );
}
