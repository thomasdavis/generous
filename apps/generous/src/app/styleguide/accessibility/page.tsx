import styles from "./page.module.css";

const focusExample = `/* Focus indicator */
.button:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}`;

const reducedMotionExample = `@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}`;

const ariaExample = `<!-- Button with aria-label -->
<button aria-label="Close dialog">
  <XIcon />
</button>

<!-- Live region for notifications -->
<div role="alert" aria-live="polite">
  Changes saved successfully
</div>`;

export default function AccessibilityPage() {
  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>Accessibility</h1>
        <p className={styles.description}>
          Accessibility is not optional. Our design system is built with WCAG 2.1 AA compliance in
          mind, ensuring everyone can use our interfaces.
        </p>
      </header>

      {/* Color Contrast */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Color Contrast</h2>
        <p className={styles.sectionDescription}>
          All text colors meet WCAG AA contrast requirements (4.5:1 for normal text, 3:1 for large
          text).
        </p>
        <div className={styles.contrastGrid}>
          <div className={styles.contrastCard}>
            <div
              className={styles.contrastSample}
              style={{
                backgroundColor: "var(--surface-base)",
                color: "var(--text-primary)",
              }}
            >
              Primary on Base
            </div>
            <div className={styles.contrastInfo}>
              <span className={styles.contrastPass}>PASS</span>
              <span className={styles.contrastRatio}>12.6:1</span>
            </div>
          </div>
          <div className={styles.contrastCard}>
            <div
              className={styles.contrastSample}
              style={{
                backgroundColor: "var(--surface-base)",
                color: "var(--text-secondary)",
              }}
            >
              Secondary on Base
            </div>
            <div className={styles.contrastInfo}>
              <span className={styles.contrastPass}>PASS</span>
              <span className={styles.contrastRatio}>7.1:1</span>
            </div>
          </div>
          <div className={styles.contrastCard}>
            <div
              className={styles.contrastSample}
              style={{
                backgroundColor: "var(--action-primary)",
                color: "var(--action-primary-text)",
              }}
            >
              Button Text
            </div>
            <div className={styles.contrastInfo}>
              <span className={styles.contrastPass}>PASS</span>
              <span className={styles.contrastRatio}>21:1</span>
            </div>
          </div>
          <div className={styles.contrastCard}>
            <div
              className={styles.contrastSample}
              style={{
                backgroundColor: "var(--color-gray-900)",
                color: "var(--accent-primary)",
              }}
            >
              Accent on Dark
            </div>
            <div className={styles.contrastInfo}>
              <span className={styles.contrastPass}>PASS</span>
              <span className={styles.contrastRatio}>11.2:1</span>
            </div>
          </div>
        </div>
      </section>

      {/* Focus Indicators */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Focus Indicators</h2>
        <p className={styles.sectionDescription}>
          All interactive elements have visible focus indicators for keyboard navigation.
        </p>
        <div className={styles.focusDemo}>
          <button type="button" className={styles.focusButton}>
            Tab to me
          </button>
          <button type="button" className={styles.focusButton}>
            Then to me
          </button>
          <a href="#focus-demo" className={styles.focusLink}>
            And links too
          </a>
        </div>
        <div className={styles.codeBlock}>
          <pre className={styles.code}>{focusExample}</pre>
        </div>
      </section>

      {/* Keyboard Navigation */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Keyboard Navigation</h2>
        <p className={styles.sectionDescription}>
          All components support full keyboard navigation following WAI-ARIA patterns.
        </p>
        <div className={styles.keyboardTable}>
          <div className={styles.keyboardRow}>
            <span className={styles.keyboardKey}>Tab</span>
            <span className={styles.keyboardDesc}>Move to next focusable element</span>
          </div>
          <div className={styles.keyboardRow}>
            <span className={styles.keyboardKey}>Shift + Tab</span>
            <span className={styles.keyboardDesc}>Move to previous focusable element</span>
          </div>
          <div className={styles.keyboardRow}>
            <span className={styles.keyboardKey}>Enter / Space</span>
            <span className={styles.keyboardDesc}>Activate buttons and links</span>
          </div>
          <div className={styles.keyboardRow}>
            <span className={styles.keyboardKey}>Escape</span>
            <span className={styles.keyboardDesc}>Close modals, dropdowns, popovers</span>
          </div>
          <div className={styles.keyboardRow}>
            <span className={styles.keyboardKey}>Arrow keys</span>
            <span className={styles.keyboardDesc}>
              Navigate within components (menus, tabs, etc.)
            </span>
          </div>
          <div className={styles.keyboardRow}>
            <span className={styles.keyboardKey}>Home / End</span>
            <span className={styles.keyboardDesc}>Jump to first/last item in lists</span>
          </div>
        </div>
      </section>

      {/* Reduced Motion */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Reduced Motion</h2>
        <p className={styles.sectionDescription}>
          Animations are disabled when users have enabled &quot;Reduce motion&quot; in system
          preferences.
        </p>
        <div className={styles.codeBlock}>
          <pre className={styles.code}>{reducedMotionExample}</pre>
        </div>
      </section>

      {/* Screen Readers */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Screen Reader Support</h2>
        <p className={styles.sectionDescription}>
          Components use semantic HTML and ARIA attributes for screen reader compatibility.
        </p>
        <div className={styles.codeBlock}>
          <pre className={styles.code}>{ariaExample}</pre>
        </div>
      </section>

      {/* Checklist */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Accessibility Checklist</h2>
        <div className={styles.checklist}>
          <label className={styles.checkItem}>
            <input type="checkbox" defaultChecked disabled />
            <span>Color contrast meets WCAG AA (4.5:1 minimum)</span>
          </label>
          <label className={styles.checkItem}>
            <input type="checkbox" defaultChecked disabled />
            <span>Focus indicators are visible on all interactive elements</span>
          </label>
          <label className={styles.checkItem}>
            <input type="checkbox" defaultChecked disabled />
            <span>All functionality is accessible via keyboard</span>
          </label>
          <label className={styles.checkItem}>
            <input type="checkbox" defaultChecked disabled />
            <span>Images have alt text (or aria-hidden if decorative)</span>
          </label>
          <label className={styles.checkItem}>
            <input type="checkbox" defaultChecked disabled />
            <span>Form inputs have associated labels</span>
          </label>
          <label className={styles.checkItem}>
            <input type="checkbox" defaultChecked disabled />
            <span>Error messages are announced to screen readers</span>
          </label>
          <label className={styles.checkItem}>
            <input type="checkbox" defaultChecked disabled />
            <span>Reduced motion is respected</span>
          </label>
          <label className={styles.checkItem}>
            <input type="checkbox" defaultChecked disabled />
            <span>Touch targets are at least 44x44 pixels</span>
          </label>
        </div>
      </section>
    </div>
  );
}
