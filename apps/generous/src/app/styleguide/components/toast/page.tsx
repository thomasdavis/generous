"use client";

import { Button, Toast, useToast } from "@generous/ui";
import styles from "./page.module.css";

function ToastDemo() {
  const { addToast, removeAllToasts } = useToast();

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
      <Button
        onClick={() =>
          addToast({
            title: "Changes saved",
            description: "Your settings have been updated successfully.",
          })
        }
      >
        Default Toast
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          addToast({
            title: "Success!",
            description: "Your file has been uploaded.",
            variant: "success",
          })
        }
      >
        Success Toast
      </Button>
      <Button
        variant="destructive"
        onClick={() =>
          addToast({
            title: "Error",
            description: "Something went wrong. Please try again.",
            variant: "error",
          })
        }
      >
        Error Toast
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          addToast({
            title: "Warning",
            description: "Your session will expire in 5 minutes.",
            variant: "warning",
          })
        }
      >
        Warning Toast
      </Button>
      <Button
        variant="ghost"
        onClick={() =>
          addToast({
            title: "New update available",
            description: "A new version is ready to install.",
            variant: "info",
          })
        }
      >
        Info Toast
      </Button>
      <Button variant="outline" onClick={removeAllToasts}>
        Clear All
      </Button>
    </div>
  );
}

function ToastWithAction() {
  const { addToast } = useToast();

  return (
    <Button
      onClick={() =>
        addToast({
          title: "Item deleted",
          description: "The item has been moved to trash.",
          action: (
            <Button size="sm" variant="outline">
              Undo
            </Button>
          ),
        })
      }
    >
      Toast with Action
    </Button>
  );
}

function ToastDuration() {
  const { addToast } = useToast();

  return (
    <div style={{ display: "flex", gap: "12px" }}>
      <Button
        variant="outline"
        onClick={() =>
          addToast({
            title: "Quick toast",
            description: "This will disappear in 2 seconds.",
            duration: 2000,
          })
        }
      >
        2 seconds
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          addToast({
            title: "Persistent toast",
            description: "This toast won't auto-dismiss.",
            duration: 0,
          })
        }
      >
        Persistent
      </Button>
    </div>
  );
}

export default function ToastPage() {
  return (
    <Toast.Provider>
      <div className={styles.page}>
        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.title}>Toast</h1>
          <p className={styles.description}>
            Toasts display brief, temporary notifications. They appear at the edge of the screen and
            automatically dismiss after a timeout.
          </p>
        </header>

        {/* Interactive Demo */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Interactive Demo</h2>
          <p className={styles.sectionDescription}>
            Click the buttons below to trigger different toast variants.
          </p>
          <div className={styles.showcase}>
            <ToastDemo />
          </div>
        </section>

        {/* Variants */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Variants</h2>
          <p className={styles.sectionDescription}>
            Five semantic variants to communicate different types of messages.
          </p>
          <div className={styles.statesGrid}>
            <div className={styles.stateCard}>
              <p className={styles.stateLabel}>Default</p>
              <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>
                General notifications and information
              </p>
            </div>
            <div className={styles.stateCard}>
              <p className={styles.stateLabel}>Success</p>
              <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>
                Completed actions and confirmations
              </p>
            </div>
            <div className={styles.stateCard}>
              <p className={styles.stateLabel}>Error</p>
              <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>
                Failed operations and errors
              </p>
            </div>
            <div className={styles.stateCard}>
              <p className={styles.stateLabel}>Warning</p>
              <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>
                Cautionary messages and alerts
              </p>
            </div>
            <div className={styles.stateCard}>
              <p className={styles.stateLabel}>Info</p>
              <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>
                Informational updates and tips
              </p>
            </div>
          </div>
        </section>

        {/* With Action */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>With Action</h2>
          <p className={styles.sectionDescription}>
            Toasts can include an action button for undo or related actions.
          </p>
          <div className={styles.showcase}>
            <ToastWithAction />
          </div>
        </section>

        {/* Duration */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Duration</h2>
          <p className={styles.sectionDescription}>
            Control how long toasts remain visible. Set duration to 0 for persistent toasts.
          </p>
          <div className={styles.showcase}>
            <ToastDuration />
          </div>
        </section>

        {/* Usage */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Usage</h2>
          <div className={styles.codeBlock}>
            <pre className={styles.code}>
              <span className={styles.codeKeyword}>import</span> {"{ "}
              <span className={styles.codeComponent}>Toast</span>,{" "}
              <span className={styles.codeComponent}>useToast</span>
              {" }"} <span className={styles.codeKeyword}>from</span>{" "}
              <span className={styles.codeString}>&quot;@generous/ui&quot;</span>;{"\n\n"}
              {"// Wrap your app with Toast.Provider\n"}
              <span className={styles.codeKeyword}>function</span> App() {"{\n"}
              {"  "}
              <span className={styles.codeKeyword}>return</span> ({"\n"}
              {"    "}&lt;<span className={styles.codeComponent}>Toast.Provider</span>&gt;{"\n"}
              {"      "}&lt;YourApp /&gt;{"\n"}
              {"      "}&lt;<span className={styles.codeComponent}>Toast.Viewport</span> position=
              <span className={styles.codeString}>&quot;bottom-right&quot;</span> /&gt;{"\n"}
              {"    "}&lt;/<span className={styles.codeComponent}>Toast.Provider</span>&gt;{"\n"}
              {"  "});{"\n"}
              {"}"}
              {"\n\n"}
              {"// Use the hook to trigger toasts\n"}
              <span className={styles.codeKeyword}>function</span> MyComponent() {"{\n"}
              {"  "}
              <span className={styles.codeKeyword}>const</span> {"{ addToast }"} = useToast();
              {"\n\n"}
              {"  "}
              <span className={styles.codeKeyword}>return</span> ({"\n"}
              {"    "}&lt;button onClick=
              {'{() => addToast({ title: "Saved!", variant: "success" })}'}&gt;{"\n"}
              {"      "}Save{"\n"}
              {"    "}&lt;/button&gt;{"\n"}
              {"  "});{"\n"}
              {"}"}
            </pre>
          </div>
        </section>

        {/* Props */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Props</h2>
          <h3 style={{ fontSize: "var(--text-md)", marginBottom: "var(--space-3)" }}>
            Toast.Provider
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
                <td>maxToasts</td>
                <td className={styles.propType}>number</td>
                <td className={styles.propDefault}>5</td>
                <td>Maximum toasts visible at once</td>
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
            Toast.Viewport
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
                <td>position</td>
                <td className={styles.propType}>
                  &quot;top-left&quot; | &quot;top-center&quot; | &quot;top-right&quot; |
                  &quot;bottom-left&quot; | &quot;bottom-center&quot; | &quot;bottom-right&quot;
                </td>
                <td className={styles.propDefault}>&quot;bottom-right&quot;</td>
                <td>Position of toast container</td>
              </tr>
              <tr>
                <td>label</td>
                <td className={styles.propType}>string</td>
                <td className={styles.propDefault}>&quot;Notifications&quot;</td>
                <td>Accessible label for the region</td>
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
            addToast Options
          </h3>
          <table className={styles.propsTable}>
            <thead>
              <tr>
                <th>Option</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>title</td>
                <td className={styles.propType}>string</td>
                <td className={styles.propDefault}>—</td>
                <td>Toast title</td>
              </tr>
              <tr>
                <td>description</td>
                <td className={styles.propType}>string</td>
                <td className={styles.propDefault}>—</td>
                <td>Toast description</td>
              </tr>
              <tr>
                <td>variant</td>
                <td className={styles.propType}>
                  &quot;default&quot; | &quot;success&quot; | &quot;error&quot; |
                  &quot;warning&quot; | &quot;info&quot;
                </td>
                <td className={styles.propDefault}>&quot;default&quot;</td>
                <td>Visual variant</td>
              </tr>
              <tr>
                <td>duration</td>
                <td className={styles.propType}>number</td>
                <td className={styles.propDefault}>5000</td>
                <td>Auto-dismiss time in ms (0 = persistent)</td>
              </tr>
              <tr>
                <td>action</td>
                <td className={styles.propType}>ReactNode</td>
                <td className={styles.propDefault}>—</td>
                <td>Action element (typically a button)</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Accessibility */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Accessibility</h2>
          <ul style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
            <li>Uses role=&quot;alert&quot; for immediate announcement</li>
            <li>Viewport uses role=&quot;region&quot; with aria-label</li>
            <li>Dismiss button is keyboard accessible</li>
            <li>Progress bar is hidden from screen readers</li>
            <li>Respects prefers-reduced-motion for animations</li>
          </ul>
        </section>

        {/* Toast Viewport must be inside Provider */}
        <Toast.Viewport position="bottom-right" />
      </div>
    </Toast.Provider>
  );
}
