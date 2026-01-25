"use client";

import { Accordion } from "@generous/ui";
import { useState } from "react";
import styles from "./page.module.css";

export default function AccordionPage() {
  const [singleValue, setSingleValue] = useState<string>("");
  const [multipleValue, setMultipleValue] = useState<string[]>(["item-1"]);

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>Accordion</h1>
        <p className={styles.description}>
          Accordions display collapsible content sections. They help organize information and reduce
          visual clutter by showing only one section at a time.
        </p>
      </header>

      {/* Interactive Demo */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Interactive Demo</h2>
        <div className={styles.showcase}>
          <div style={{ width: "100%", maxWidth: "500px" }}>
            <Accordion.Root type="single" collapsible defaultValue="item-1">
              <Accordion.Item value="item-1">
                <Accordion.Trigger>What is your return policy?</Accordion.Trigger>
                <Accordion.Content>
                  We offer a 30-day return policy for all unused items in their original packaging.
                  Simply contact our support team to initiate a return.
                </Accordion.Content>
              </Accordion.Item>
              <Accordion.Item value="item-2">
                <Accordion.Trigger>How long does shipping take?</Accordion.Trigger>
                <Accordion.Content>
                  Standard shipping takes 5-7 business days. Express shipping is available for 2-3
                  day delivery at an additional cost.
                </Accordion.Content>
              </Accordion.Item>
              <Accordion.Item value="item-3">
                <Accordion.Trigger>Do you offer international shipping?</Accordion.Trigger>
                <Accordion.Content>
                  Yes, we ship to over 50 countries worldwide. International shipping times vary by
                  location, typically 10-14 business days.
                </Accordion.Content>
              </Accordion.Item>
            </Accordion.Root>
          </div>
        </div>
      </section>

      {/* Single vs Multiple */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Single vs Multiple</h2>
        <p className={styles.sectionDescription}>
          Choose between single (one panel at a time) or multiple (any number open) modes.
        </p>
        <div className={styles.statesGrid}>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>Single</p>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "var(--text-sm)",
                marginBottom: "12px",
              }}
            >
              Only one item can be open at a time
            </p>
            <Accordion.Root
              type="single"
              value={singleValue}
              onValueChange={setSingleValue}
              collapsible
            >
              <Accordion.Item value="s1">
                <Accordion.Trigger>Section 1</Accordion.Trigger>
                <Accordion.Content>Content for section 1</Accordion.Content>
              </Accordion.Item>
              <Accordion.Item value="s2">
                <Accordion.Trigger>Section 2</Accordion.Trigger>
                <Accordion.Content>Content for section 2</Accordion.Content>
              </Accordion.Item>
            </Accordion.Root>
          </div>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>Multiple</p>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "var(--text-sm)",
                marginBottom: "12px",
              }}
            >
              Multiple items can be open simultaneously
            </p>
            <Accordion.Root type="multiple" value={multipleValue} onValueChange={setMultipleValue}>
              <Accordion.Item value="m1">
                <Accordion.Trigger>Section 1</Accordion.Trigger>
                <Accordion.Content>Content for section 1</Accordion.Content>
              </Accordion.Item>
              <Accordion.Item value="m2">
                <Accordion.Trigger>Section 2</Accordion.Trigger>
                <Accordion.Content>Content for section 2</Accordion.Content>
              </Accordion.Item>
            </Accordion.Root>
          </div>
        </div>
      </section>

      {/* Collapsible */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Collapsible</h2>
        <p className={styles.sectionDescription}>
          In single mode, the collapsible prop determines if all items can be closed.
        </p>
        <div className={styles.statesGrid}>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>Collapsible</p>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "var(--text-sm)",
                marginBottom: "12px",
              }}
            >
              Click the open item to close it
            </p>
            <Accordion.Root type="single" collapsible defaultValue="c1">
              <Accordion.Item value="c1">
                <Accordion.Trigger>Click to collapse</Accordion.Trigger>
                <Accordion.Content>This section can be closed</Accordion.Content>
              </Accordion.Item>
            </Accordion.Root>
          </div>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>Non-Collapsible</p>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "var(--text-sm)",
                marginBottom: "12px",
              }}
            >
              One item must always be open
            </p>
            <Accordion.Root type="single" defaultValue="nc1">
              <Accordion.Item value="nc1">
                <Accordion.Trigger>Section 1</Accordion.Trigger>
                <Accordion.Content>Always one open</Accordion.Content>
              </Accordion.Item>
              <Accordion.Item value="nc2">
                <Accordion.Trigger>Section 2</Accordion.Trigger>
                <Accordion.Content>Switch between sections</Accordion.Content>
              </Accordion.Item>
            </Accordion.Root>
          </div>
        </div>
      </section>

      {/* Disabled Items */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Disabled Items</h2>
        <p className={styles.sectionDescription}>
          Individual items can be disabled while keeping others interactive.
        </p>
        <div className={styles.showcase}>
          <div style={{ width: "100%", maxWidth: "500px" }}>
            <Accordion.Root type="single" collapsible>
              <Accordion.Item value="d1">
                <Accordion.Trigger>Active Item</Accordion.Trigger>
                <Accordion.Content>This item is active and clickable.</Accordion.Content>
              </Accordion.Item>
              <Accordion.Item value="d2" disabled>
                <Accordion.Trigger>Disabled Item</Accordion.Trigger>
                <Accordion.Content>This content is not accessible.</Accordion.Content>
              </Accordion.Item>
              <Accordion.Item value="d3">
                <Accordion.Trigger>Another Active Item</Accordion.Trigger>
                <Accordion.Content>This item is also active.</Accordion.Content>
              </Accordion.Item>
            </Accordion.Root>
          </div>
        </div>
      </section>

      {/* Usage */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Usage</h2>
        <div className={styles.codeBlock}>
          <pre className={styles.code}>
            <span className={styles.codeKeyword}>import</span> {"{ "}
            <span className={styles.codeComponent}>Accordion</span>
            {" }"} <span className={styles.codeKeyword}>from</span>{" "}
            <span className={styles.codeString}>&quot;@generous/ui&quot;</span>;{"\n\n"}
            <span className={styles.codeKeyword}>function</span> Example() {"{\n"}
            {"  "}
            <span className={styles.codeKeyword}>return</span> ({"\n"}
            {"    "}&lt;<span className={styles.codeComponent}>Accordion.Root</span> type=
            <span className={styles.codeString}>&quot;single&quot;</span> collapsible&gt;{"\n"}
            {"      "}&lt;<span className={styles.codeComponent}>Accordion.Item</span> value=
            <span className={styles.codeString}>&quot;item-1&quot;</span>&gt;{"\n"}
            {"        "}&lt;<span className={styles.codeComponent}>Accordion.Trigger</span>
            &gt;Section Title&lt;/<span className={styles.codeComponent}>Accordion.Trigger</span>
            &gt;{"\n"}
            {"        "}&lt;<span className={styles.codeComponent}>Accordion.Content</span>&gt;
            {"\n"}
            {"          "}Section content goes here.{"\n"}
            {"        "}&lt;/<span className={styles.codeComponent}>Accordion.Content</span>&gt;
            {"\n"}
            {"      "}&lt;/<span className={styles.codeComponent}>Accordion.Item</span>&gt;{"\n"}
            {"    "}&lt;/<span className={styles.codeComponent}>Accordion.Root</span>&gt;{"\n"}
            {"  "});{"\n"}
            {"}"}
          </pre>
        </div>
      </section>

      {/* Props */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Props</h2>
        <h3 style={{ fontSize: "var(--text-md)", marginBottom: "var(--space-3)" }}>
          Accordion.Root
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
              <td>type</td>
              <td className={styles.propType}>&quot;single&quot; | &quot;multiple&quot;</td>
              <td className={styles.propDefault}>required</td>
              <td>Allow one or multiple items open</td>
            </tr>
            <tr>
              <td>value</td>
              <td className={styles.propType}>string | string[]</td>
              <td className={styles.propDefault}>—</td>
              <td>Controlled open item(s)</td>
            </tr>
            <tr>
              <td>defaultValue</td>
              <td className={styles.propType}>string | string[]</td>
              <td className={styles.propDefault}>—</td>
              <td>Default open item(s)</td>
            </tr>
            <tr>
              <td>onValueChange</td>
              <td className={styles.propType}>(value) =&gt; void</td>
              <td className={styles.propDefault}>—</td>
              <td>Callback when value changes</td>
            </tr>
            <tr>
              <td>collapsible</td>
              <td className={styles.propType}>boolean</td>
              <td className={styles.propDefault}>false</td>
              <td>Allow closing all items (single mode only)</td>
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
          Accordion.Item
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
              <td>Unique identifier for the item</td>
            </tr>
            <tr>
              <td>disabled</td>
              <td className={styles.propType}>boolean</td>
              <td className={styles.propDefault}>false</td>
              <td>Disable this item</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Accessibility */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Accessibility</h2>
        <ul style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
          <li>Triggers use proper heading hierarchy (h3)</li>
          <li>Content regions use aria-labelledby to reference triggers</li>
          <li>aria-expanded indicates open/closed state</li>
          <li>Arrow keys navigate between triggers</li>
          <li>Enter and Space toggle the focused item</li>
        </ul>
      </section>
    </div>
  );
}
