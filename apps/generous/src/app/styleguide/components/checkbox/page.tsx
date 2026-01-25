"use client";

import { Checkbox, Label } from "@generous/ui";
import { useState } from "react";
import styles from "./page.module.css";

const sizes = ["sm", "md", "lg"] as const;

export default function CheckboxPage() {
  const [checked, setChecked] = useState(false);
  const [items, setItems] = useState({ apple: false, banana: true, cherry: false });

  const allChecked = Object.values(items).every(Boolean);
  const someChecked = Object.values(items).some(Boolean) && !allChecked;

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>Checkbox</h1>
        <p className={styles.description}>
          Checkboxes allow users to select one or more options from a set. They support checked,
          unchecked, and indeterminate states.
        </p>
      </header>

      {/* Interactive Demo */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Interactive Demo</h2>
        <div className={styles.showcase}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Checkbox
              id="demo-checkbox"
              checked={checked}
              onCheckedChange={(c) => setChecked(c === true)}
            />
            <Label htmlFor="demo-checkbox">I agree to the terms and conditions</Label>
          </div>
        </div>
      </section>

      {/* Sizes */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Sizes</h2>
        <p className={styles.sectionDescription}>
          Three sizes to match different text sizes and contexts.
        </p>
        <div className={styles.statesGrid}>
          {sizes.map((size) => (
            <div key={size} className={styles.stateCard}>
              <p className={styles.stateLabel}>{size}</p>
              <div className={styles.statePreview}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Checkbox size={size} defaultChecked aria-label={`Size ${size}`} />
                  <span
                    style={{ fontSize: size === "sm" ? "12px" : size === "lg" ? "16px" : "14px" }}
                  >
                    Option
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* States */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>States</h2>
        <p className={styles.sectionDescription}>
          Visual states for different interactions and validation scenarios.
        </p>
        <div className={styles.statesGrid}>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>Unchecked</p>
            <div className={styles.statePreview}>
              <Checkbox aria-label="Unchecked" />
            </div>
          </div>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>Checked</p>
            <div className={styles.statePreview}>
              <Checkbox defaultChecked aria-label="Checked" />
            </div>
          </div>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>Indeterminate</p>
            <div className={styles.statePreview}>
              <Checkbox checked="indeterminate" aria-label="Indeterminate" />
            </div>
          </div>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>Disabled</p>
            <div className={styles.statePreview}>
              <Checkbox disabled aria-label="Disabled" />
            </div>
          </div>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>Disabled Checked</p>
            <div className={styles.statePreview}>
              <Checkbox disabled defaultChecked aria-label="Disabled checked" />
            </div>
          </div>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>Error</p>
            <div className={styles.statePreview}>
              <Checkbox error aria-label="Error" />
            </div>
          </div>
        </div>
      </section>

      {/* Indeterminate State */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Indeterminate State</h2>
        <p className={styles.sectionDescription}>
          Use the indeterminate state for &quot;select all&quot; patterns when some but not all
          children are selected.
        </p>
        <div className={styles.showcase}>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Checkbox
                checked={allChecked ? true : someChecked ? "indeterminate" : false}
                onCheckedChange={(c) => {
                  const newValue = c === true;
                  setItems({ apple: newValue, banana: newValue, cherry: newValue });
                }}
                aria-label="Select all fruits"
              />
              <span style={{ fontWeight: 600 }}>Select all fruits</span>
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px", paddingLeft: "24px" }}
            >
              {Object.entries(items).map(([fruit, isChecked]) => (
                <div key={fruit} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={(c) => setItems((prev) => ({ ...prev, [fruit]: c === true }))}
                    aria-label={fruit}
                  />
                  <span style={{ textTransform: "capitalize" }}>{fruit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Usage */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Usage</h2>
        <div className={styles.codeBlock}>
          <pre className={styles.code}>
            <span className={styles.codeKeyword}>import</span> {"{ "}
            <span className={styles.codeComponent}>Checkbox</span>
            {" }"} <span className={styles.codeKeyword}>from</span>{" "}
            <span className={styles.codeString}>&quot;@generous/ui&quot;</span>;{"\n\n"}
            <span className={styles.codeKeyword}>function</span> Example() {"{\n"}
            {"  "}
            <span className={styles.codeKeyword}>const</span> [checked, setChecked] =
            useState(false);{"\n\n"}
            {"  "}
            <span className={styles.codeKeyword}>return</span> ({"\n"}
            {"    "}&lt;<span className={styles.codeComponent}>Checkbox</span>
            {"\n"}
            {"      "}checked={"{checked}"}
            {"\n"}
            {"      "}onCheckedChange={"{setChecked}"}
            {"\n"}
            {"      "}aria-label=<span className={styles.codeString}>&quot;Accept terms&quot;</span>
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
              <td>checked</td>
              <td className={styles.propType}>boolean | &quot;indeterminate&quot;</td>
              <td className={styles.propDefault}>—</td>
              <td>Controlled checked state</td>
            </tr>
            <tr>
              <td>defaultChecked</td>
              <td className={styles.propType}>boolean</td>
              <td className={styles.propDefault}>false</td>
              <td>Default checked state (uncontrolled)</td>
            </tr>
            <tr>
              <td>onCheckedChange</td>
              <td className={styles.propType}>
                (checked: boolean | &quot;indeterminate&quot;) =&gt; void
              </td>
              <td className={styles.propDefault}>—</td>
              <td>Callback when checked state changes</td>
            </tr>
            <tr>
              <td>size</td>
              <td className={styles.propType}>&quot;sm&quot; | &quot;md&quot; | &quot;lg&quot;</td>
              <td className={styles.propDefault}>&quot;md&quot;</td>
              <td>Size of the checkbox</td>
            </tr>
            <tr>
              <td>error</td>
              <td className={styles.propType}>boolean</td>
              <td className={styles.propDefault}>false</td>
              <td>Whether the checkbox is in error state</td>
            </tr>
            <tr>
              <td>disabled</td>
              <td className={styles.propType}>boolean</td>
              <td className={styles.propDefault}>false</td>
              <td>Whether the checkbox is disabled</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Accessibility */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Accessibility</h2>
        <ul style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
          <li>Uses role=&quot;checkbox&quot; with proper aria-checked states</li>
          <li>Supports keyboard activation with Space key</li>
          <li>Indeterminate state uses aria-checked=&quot;mixed&quot;</li>
          <li>Focus indicator visible on keyboard navigation</li>
          <li>Always provide aria-label when no visible label is present</li>
        </ul>
      </section>
    </div>
  );
}
