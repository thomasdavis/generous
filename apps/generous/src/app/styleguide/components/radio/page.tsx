"use client";

import { Label, RadioGroup } from "@generous/ui";
import { useState } from "react";
import styles from "./page.module.css";

const sizes = ["sm", "md", "lg"] as const;

export default function RadioPage() {
  const [value, setValue] = useState("option1");

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>Radio</h1>
        <p className={styles.description}>
          Radio buttons allow users to select a single option from a mutually exclusive set. They
          should be used within a RadioGroup component.
        </p>
      </header>

      {/* Interactive Demo */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Interactive Demo</h2>
        <div className={styles.showcase}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <Label>Select your preferred contact method</Label>
            <RadioGroup.Root value={value} onValueChange={setValue}>
              <RadioGroup.Item value="email">Email</RadioGroup.Item>
              <RadioGroup.Item value="phone">Phone</RadioGroup.Item>
              <RadioGroup.Item value="mail">Mail</RadioGroup.Item>
            </RadioGroup.Root>
          </div>
        </div>
      </section>

      {/* Sizes */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Sizes</h2>
        <p className={styles.sectionDescription}>
          Three sizes to match different contexts and text sizes.
        </p>
        <div className={styles.statesGrid}>
          {sizes.map((size) => (
            <div key={size} className={styles.stateCard}>
              <p className={styles.stateLabel}>{size}</p>
              <div className={styles.statePreview}>
                <RadioGroup.Root defaultValue="1" size={size}>
                  <RadioGroup.Item value="1">Option 1</RadioGroup.Item>
                  <RadioGroup.Item value="2">Option 2</RadioGroup.Item>
                </RadioGroup.Root>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Orientation */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Orientation</h2>
        <p className={styles.sectionDescription}>
          RadioGroup supports vertical (default) and horizontal layouts.
        </p>
        <div className={styles.statesGrid}>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>Vertical</p>
            <div className={styles.statePreview}>
              <RadioGroup.Root defaultValue="a" orientation="vertical">
                <RadioGroup.Item value="a">Option A</RadioGroup.Item>
                <RadioGroup.Item value="b">Option B</RadioGroup.Item>
                <RadioGroup.Item value="c">Option C</RadioGroup.Item>
              </RadioGroup.Root>
            </div>
          </div>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>Horizontal</p>
            <div className={styles.statePreview}>
              <RadioGroup.Root defaultValue="a" orientation="horizontal">
                <RadioGroup.Item value="a">A</RadioGroup.Item>
                <RadioGroup.Item value="b">B</RadioGroup.Item>
                <RadioGroup.Item value="c">C</RadioGroup.Item>
              </RadioGroup.Root>
            </div>
          </div>
        </div>
      </section>

      {/* States */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>States</h2>
        <p className={styles.sectionDescription}>Visual states for different interactions.</p>
        <div className={styles.statesGrid}>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>Default</p>
            <div className={styles.statePreview}>
              <RadioGroup.Root defaultValue="1">
                <RadioGroup.Item value="1">Selected</RadioGroup.Item>
                <RadioGroup.Item value="2">Unselected</RadioGroup.Item>
              </RadioGroup.Root>
            </div>
          </div>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>Disabled</p>
            <div className={styles.statePreview}>
              <RadioGroup.Root defaultValue="1" disabled>
                <RadioGroup.Item value="1">Disabled</RadioGroup.Item>
                <RadioGroup.Item value="2">Also disabled</RadioGroup.Item>
              </RadioGroup.Root>
            </div>
          </div>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>Error</p>
            <div className={styles.statePreview}>
              <RadioGroup.Root error>
                <RadioGroup.Item value="1">Option 1</RadioGroup.Item>
                <RadioGroup.Item value="2">Option 2</RadioGroup.Item>
              </RadioGroup.Root>
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
            <span className={styles.codeComponent}>RadioGroup</span>
            {" }"} <span className={styles.codeKeyword}>from</span>{" "}
            <span className={styles.codeString}>&quot;@generous/ui&quot;</span>;{"\n\n"}
            <span className={styles.codeKeyword}>function</span> Example() {"{\n"}
            {"  "}
            <span className={styles.codeKeyword}>const</span> [value, setValue] = useState(
            <span className={styles.codeString}>&quot;option1&quot;</span>);{"\n\n"}
            {"  "}
            <span className={styles.codeKeyword}>return</span> ({"\n"}
            {"    "}&lt;<span className={styles.codeComponent}>RadioGroup.Root</span> value=
            {"{value}"} onValueChange={"{setValue}"}&gt;{"\n"}
            {"      "}&lt;<span className={styles.codeComponent}>RadioGroup.Item</span> value=
            <span className={styles.codeString}>&quot;option1&quot;</span>&gt;Option 1&lt;/
            <span className={styles.codeComponent}>RadioGroup.Item</span>&gt;{"\n"}
            {"      "}&lt;<span className={styles.codeComponent}>RadioGroup.Item</span> value=
            <span className={styles.codeString}>&quot;option2&quot;</span>&gt;Option 2&lt;/
            <span className={styles.codeComponent}>RadioGroup.Item</span>&gt;{"\n"}
            {"    "}&lt;/<span className={styles.codeComponent}>RadioGroup.Root</span>&gt;
            {"\n"}
            {"  "});{"\n"}
            {"}"}
          </pre>
        </div>
      </section>

      {/* Props */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Props</h2>
        <h3 style={{ fontSize: "var(--text-md)", marginBottom: "var(--space-3)" }}>
          RadioGroup.Root
        </h3>
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
              <td>value</td>
              <td className={styles.propType}>string</td>
              <td className={styles.propDefault}>—</td>
              <td>Controlled value</td>
            </tr>
            <tr>
              <td>defaultValue</td>
              <td className={styles.propType}>string</td>
              <td className={styles.propDefault}>&quot;&quot;</td>
              <td>Default value (uncontrolled)</td>
            </tr>
            <tr>
              <td>onValueChange</td>
              <td className={styles.propType}>(value: string) =&gt; void</td>
              <td className={styles.propDefault}>—</td>
              <td>Callback when value changes</td>
            </tr>
            <tr>
              <td>orientation</td>
              <td className={styles.propType}>&quot;horizontal&quot; | &quot;vertical&quot;</td>
              <td className={styles.propDefault}>&quot;vertical&quot;</td>
              <td>Layout orientation</td>
            </tr>
            <tr>
              <td>size</td>
              <td className={styles.propType}>&quot;sm&quot; | &quot;md&quot; | &quot;lg&quot;</td>
              <td className={styles.propDefault}>&quot;md&quot;</td>
              <td>Size of radio buttons</td>
            </tr>
            <tr>
              <td>disabled</td>
              <td className={styles.propType}>boolean</td>
              <td className={styles.propDefault}>false</td>
              <td>Disable all items</td>
            </tr>
            <tr>
              <td>error</td>
              <td className={styles.propType}>boolean</td>
              <td className={styles.propDefault}>false</td>
              <td>Show error state</td>
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
          RadioGroup.Item
        </h3>
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
              <td>value</td>
              <td className={styles.propType}>string</td>
              <td className={styles.propDefault}>required</td>
              <td>Value of this radio option</td>
            </tr>
            <tr>
              <td>disabled</td>
              <td className={styles.propType}>boolean</td>
              <td className={styles.propDefault}>false</td>
              <td>Disable this item only</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Accessibility */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Accessibility</h2>
        <ul style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
          <li>Uses role=&quot;radiogroup&quot; and role=&quot;radio&quot; for proper semantics</li>
          <li>Arrow keys navigate between options</li>
          <li>Space key selects the focused option</li>
          <li>Focus management handled automatically within group</li>
          <li>Only selected item is in tab order (roving tabindex)</li>
        </ul>
      </section>
    </div>
  );
}
