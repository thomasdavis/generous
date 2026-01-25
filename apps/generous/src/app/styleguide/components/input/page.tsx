"use client";

import { Input, Label } from "@generous/ui";
import { useState } from "react";
import styles from "./page.module.css";

const sizes = ["sm", "md", "lg"] as const;

export default function InputPage() {
  const [value, setValue] = useState("");

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>Input</h1>
        <p className={styles.description}>
          Text inputs allow users to enter and edit text. They&apos;re the most basic form control
          for collecting user data.
        </p>
      </header>

      {/* Interactive Demo */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Interactive Demo</h2>
        <div className={styles.showcase}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "300px" }}>
            <Label htmlFor="demo-input">Email address</Label>
            <Input
              id="demo-input"
              type="email"
              placeholder="you@example.com"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Sizes */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Sizes</h2>
        <p className={styles.sectionDescription}>
          Three sizes to fit different contexts and information density requirements.
        </p>
        <div className={styles.statesGrid}>
          {sizes.map((size) => (
            <div key={size} className={styles.stateCard}>
              <p className={styles.stateLabel}>{size}</p>
              <div className={styles.statePreview}>
                <Input size={size} placeholder={`Size ${size}`} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* States */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>States</h2>
        <p className={styles.sectionDescription}>
          Visual feedback for different interaction and validation states.
        </p>
        <div className={styles.statesGrid}>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>Default</p>
            <div className={styles.statePreview}>
              <Input placeholder="Default state" />
            </div>
          </div>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>Disabled</p>
            <div className={styles.statePreview}>
              <Input placeholder="Disabled" disabled />
            </div>
          </div>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>Error</p>
            <div className={styles.statePreview}>
              <Input placeholder="Error state" error />
            </div>
          </div>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>With Value</p>
            <div className={styles.statePreview}>
              <Input defaultValue="user@example.com" />
            </div>
          </div>
        </div>
      </section>

      {/* Input Types */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Input Types</h2>
        <p className={styles.sectionDescription}>
          Native HTML input types for different data formats.
        </p>
        <div className={styles.statesGrid}>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>Text</p>
            <div className={styles.statePreview}>
              <Input type="text" placeholder="Enter text" />
            </div>
          </div>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>Email</p>
            <div className={styles.statePreview}>
              <Input type="email" placeholder="email@example.com" />
            </div>
          </div>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>Password</p>
            <div className={styles.statePreview}>
              <Input type="password" placeholder="Enter password" />
            </div>
          </div>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>Number</p>
            <div className={styles.statePreview}>
              <Input type="number" placeholder="0" />
            </div>
          </div>
        </div>
      </section>

      {/* With Adornments */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>With Adornments</h2>
        <p className={styles.sectionDescription}>
          Add icons or text before or after the input to provide context.
        </p>
        <div className={styles.showcase}>
          <Input
            startAdornment={
              <svg
                aria-hidden="true"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            }
            placeholder="Search..."
          />
          <Input
            endAdornment={
              <svg
                aria-hidden="true"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            }
            type="password"
            placeholder="Password"
          />
          <Input
            startAdornment={<span style={{ color: "var(--text-tertiary)" }}>$</span>}
            type="number"
            placeholder="0.00"
          />
        </div>
      </section>

      {/* Usage */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Usage</h2>
        <div className={styles.codeBlock}>
          <pre className={styles.code}>
            <span className={styles.codeKeyword}>import</span> {"{ "}
            <span className={styles.codeComponent}>Input</span>
            {" }"} <span className={styles.codeKeyword}>from</span>{" "}
            <span className={styles.codeString}>&quot;@generous/ui&quot;</span>;{"\n\n"}
            <span className={styles.codeKeyword}>function</span> Example() {"{\n"}
            {"  "}
            <span className={styles.codeKeyword}>return</span> ({"\n"}
            {"    "}&lt;<span className={styles.codeComponent}>Input</span>
            {"\n"}
            {"      "}type=<span className={styles.codeString}>&quot;email&quot;</span>
            {"\n"}
            {"      "}placeholder=
            <span className={styles.codeString}>&quot;you@example.com&quot;</span>
            {"\n"}
            {"      "}size=<span className={styles.codeString}>&quot;md&quot;</span>
            {"\n"}
            {"    "}/&gt;
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
              <td>size</td>
              <td className={styles.propType}>&quot;sm&quot; | &quot;md&quot; | &quot;lg&quot;</td>
              <td className={styles.propDefault}>&quot;md&quot;</td>
              <td>Size of the input</td>
            </tr>
            <tr>
              <td>error</td>
              <td className={styles.propType}>boolean</td>
              <td className={styles.propDefault}>false</td>
              <td>Whether the input is in error state</td>
            </tr>
            <tr>
              <td>disabled</td>
              <td className={styles.propType}>boolean</td>
              <td className={styles.propDefault}>false</td>
              <td>Whether the input is disabled</td>
            </tr>
            <tr>
              <td>startAdornment</td>
              <td className={styles.propType}>ReactNode</td>
              <td className={styles.propDefault}>—</td>
              <td>Element displayed at the start of the input</td>
            </tr>
            <tr>
              <td>endAdornment</td>
              <td className={styles.propType}>ReactNode</td>
              <td className={styles.propDefault}>—</td>
              <td>Element displayed at the end of the input</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Accessibility */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Accessibility</h2>
        <ul style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
          <li>Uses native input element for full browser support</li>
          <li>Always pair with a Label component for accessibility</li>
          <li>Error state communicated via aria-invalid</li>
          <li>Supports all standard input attributes (required, aria-describedby, etc.)</li>
          <li>Focus indicator visible on keyboard navigation</li>
        </ul>
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
              <li>Always include a visible label</li>
              <li>Use appropriate input types</li>
              <li>Provide clear placeholder text</li>
              <li>Show validation errors clearly</li>
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
              <li>Use placeholder as the only label</li>
              <li>Disable inputs without explanation</li>
              <li>Auto-focus on page load</li>
              <li>Use red for non-error states</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
