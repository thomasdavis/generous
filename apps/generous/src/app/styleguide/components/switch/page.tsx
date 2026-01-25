"use client";

import { Label, Switch } from "@generous/ui";
import { useState } from "react";
import styles from "./page.module.css";

const sizes = ["sm", "md", "lg"] as const;

export default function SwitchPage() {
  const [enabled, setEnabled] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
  });

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>Switch</h1>
        <p className={styles.description}>
          Switches toggle between two mutually exclusive states, typically on and off. They provide
          immediate visual feedback and are ideal for settings.
        </p>
      </header>

      {/* Interactive Demo */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Interactive Demo</h2>
        <div className={styles.showcase}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Switch id="demo-switch" checked={enabled} onCheckedChange={setEnabled} />
            <Label htmlFor="demo-switch">Dark mode is {enabled ? "on" : "off"}</Label>
          </div>
        </div>
      </section>

      {/* Sizes */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Sizes</h2>
        <p className={styles.sectionDescription}>
          Three sizes to match different contexts and importance levels.
        </p>
        <div className={styles.statesGrid}>
          {sizes.map((size) => (
            <div key={size} className={styles.stateCard}>
              <p className={styles.stateLabel}>{size}</p>
              <div className={styles.statePreview}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Switch size={size} defaultChecked aria-label={`Size ${size}`} />
                  <span>Setting</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* States */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>States</h2>
        <p className={styles.sectionDescription}>Visual states for different interactions.</p>
        <div className={styles.statesGrid}>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>Off</p>
            <div className={styles.statePreview}>
              <Switch aria-label="Off state" />
            </div>
          </div>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>On</p>
            <div className={styles.statePreview}>
              <Switch defaultChecked aria-label="On state" />
            </div>
          </div>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>Disabled Off</p>
            <div className={styles.statePreview}>
              <Switch disabled aria-label="Disabled off" />
            </div>
          </div>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>Disabled On</p>
            <div className={styles.statePreview}>
              <Switch disabled defaultChecked aria-label="Disabled on" />
            </div>
          </div>
        </div>
      </section>

      {/* Settings Example */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Settings Example</h2>
        <p className={styles.sectionDescription}>
          Switches are commonly used in settings panels for on/off preferences.
        </p>
        <div className={styles.showcase}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              width: "100%",
              maxWidth: "400px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 0",
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              <div>
                <p style={{ margin: 0, fontWeight: 500 }}>Email notifications</p>
                <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--text-tertiary)" }}>
                  Receive updates via email
                </p>
              </div>
              <Switch
                checked={notifications.email}
                onCheckedChange={(c) => setNotifications((p) => ({ ...p, email: c }))}
                aria-label="Email notifications"
              />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 0",
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              <div>
                <p style={{ margin: 0, fontWeight: 500 }}>Push notifications</p>
                <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--text-tertiary)" }}>
                  Receive push notifications on your device
                </p>
              </div>
              <Switch
                checked={notifications.push}
                onCheckedChange={(c) => setNotifications((p) => ({ ...p, push: c }))}
                aria-label="Push notifications"
              />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 0",
              }}
            >
              <div>
                <p style={{ margin: 0, fontWeight: 500 }}>SMS notifications</p>
                <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--text-tertiary)" }}>
                  Receive text message updates
                </p>
              </div>
              <Switch
                checked={notifications.sms}
                onCheckedChange={(c) => setNotifications((p) => ({ ...p, sms: c }))}
                aria-label="SMS notifications"
              />
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
            <span className={styles.codeComponent}>Switch</span>
            {" }"} <span className={styles.codeKeyword}>from</span>{" "}
            <span className={styles.codeString}>&quot;@generous/ui&quot;</span>;{"\n\n"}
            <span className={styles.codeKeyword}>function</span> Example() {"{\n"}
            {"  "}
            <span className={styles.codeKeyword}>const</span> [enabled, setEnabled] =
            useState(false);{"\n\n"}
            {"  "}
            <span className={styles.codeKeyword}>return</span> ({"\n"}
            {"    "}&lt;<span className={styles.codeComponent}>Switch</span>
            {"\n"}
            {"      "}checked={"{enabled}"}
            {"\n"}
            {"      "}onCheckedChange={"{setEnabled}"}
            {"\n"}
            {"      "}aria-label=
            <span className={styles.codeString}>&quot;Enable feature&quot;</span>
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
              <td className={styles.propType}>boolean</td>
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
              <td className={styles.propType}>(checked: boolean) =&gt; void</td>
              <td className={styles.propDefault}>—</td>
              <td>Callback when checked state changes</td>
            </tr>
            <tr>
              <td>size</td>
              <td className={styles.propType}>&quot;sm&quot; | &quot;md&quot; | &quot;lg&quot;</td>
              <td className={styles.propDefault}>&quot;md&quot;</td>
              <td>Size of the switch</td>
            </tr>
            <tr>
              <td>disabled</td>
              <td className={styles.propType}>boolean</td>
              <td className={styles.propDefault}>false</td>
              <td>Whether the switch is disabled</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Switch vs Checkbox */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Switch vs Checkbox</h2>
        <div className={styles.statesGrid}>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel} style={{ color: "var(--color-green-500)" }}>
              Use Switch
            </p>
            <ul
              style={{
                color: "var(--text-secondary)",
                fontSize: "var(--text-sm)",
                margin: 0,
                paddingLeft: "var(--space-4)",
              }}
            >
              <li>Binary on/off settings</li>
              <li>Immediate effect when toggled</li>
              <li>Independent choices</li>
              <li>Settings panels</li>
            </ul>
          </div>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel} style={{ color: "var(--color-blue-500)" }}>
              Use Checkbox
            </p>
            <ul
              style={{
                color: "var(--text-secondary)",
                fontSize: "var(--text-sm)",
                margin: 0,
                paddingLeft: "var(--space-4)",
              }}
            >
              <li>Selection from multiple options</li>
              <li>Requires form submission</li>
              <li>Related choices in a group</li>
              <li>Terms and agreements</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Accessibility */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Accessibility</h2>
        <ul style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
          <li>Uses role=&quot;switch&quot; for proper semantics</li>
          <li>Toggle with Space or Enter key</li>
          <li>aria-checked reflects current state</li>
          <li>Focus indicator visible on keyboard navigation</li>
          <li>Always provide aria-label when no visible label is present</li>
        </ul>
      </section>
    </div>
  );
}
