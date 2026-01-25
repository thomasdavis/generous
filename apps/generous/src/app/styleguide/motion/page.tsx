import styles from "./page.module.css";

const durations = [
  { name: "75ms", token: "--duration-75", use: "Micro-interactions, hover states" },
  { name: "100ms", token: "--duration-100", use: "Quick feedback" },
  { name: "150ms", token: "--duration-150", use: "Standard transitions" },
  { name: "200ms", token: "--duration-200", use: "Default for most animations" },
  { name: "300ms", token: "--duration-300", use: "Moderate animations" },
  { name: "500ms", token: "--duration-500", use: "Slower, deliberate animations" },
  { name: "700ms", token: "--duration-700", use: "Long animations" },
  { name: "1000ms", token: "--duration-1000", use: "Very slow, dramatic effect" },
];

const easings = [
  {
    name: "linear",
    token: "--ease-linear",
    curve: "linear",
    description: "Constant speed, use for opacity or looping animations",
  },
  {
    name: "ease-in",
    token: "--ease-in",
    curve: "cubic-bezier(0.4, 0, 1, 1)",
    description: "Starts slow, accelerates. Use for exit animations",
  },
  {
    name: "ease-out",
    token: "--ease-out",
    curve: "cubic-bezier(0, 0, 0.2, 1)",
    description: "Starts fast, decelerates. Use for entrance animations",
  },
  {
    name: "ease-in-out",
    token: "--ease-in-out",
    curve: "cubic-bezier(0.4, 0, 0.2, 1)",
    description: "Smooth start and end. Default for most animations",
  },
  {
    name: "spring",
    token: "--ease-spring",
    curve: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    description: "Bouncy overshoot. Use sparingly for playful interactions",
  },
];

export default function MotionPage() {
  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>Motion</h1>
        <p className={styles.description}>
          Motion adds life to interfaces but must be used purposefully. Our system respects
          prefers-reduced-motion and keeps animations subtle and functional.
        </p>
      </header>

      {/* Duration Scale */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Duration Scale</h2>
        <p className={styles.sectionDescription}>
          Shorter durations for small changes, longer for significant transitions.
        </p>
        <div className={styles.durationList}>
          {durations.map((d) => (
            <div key={d.name} className={styles.durationRow}>
              <div className={styles.durationInfo}>
                <span className={styles.durationName}>{d.name}</span>
                <span className={styles.durationToken}>{d.token}</span>
              </div>
              <div className={styles.durationDemo}>
                <div
                  className={styles.durationBar}
                  style={
                    {
                      "--animation-duration": `var(${d.token})`,
                    } as React.CSSProperties
                  }
                />
              </div>
              <span className={styles.durationUse}>{d.use}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Easing Functions */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Easing Functions</h2>
        <p className={styles.sectionDescription}>
          Easing affects how animations feel. The right easing makes motion feel natural.
        </p>
        <div className={styles.easingGrid}>
          {easings.map((e) => (
            <div key={e.name} className={styles.easingCard}>
              <div className={styles.easingDemo}>
                <div
                  className={styles.easingBall}
                  style={
                    {
                      "--easing": `var(${e.token})`,
                    } as React.CSSProperties
                  }
                />
              </div>
              <div className={styles.easingInfo}>
                <h3 className={styles.easingName}>{e.name}</h3>
                <p className={styles.easingToken}>{e.token}</p>
                <p className={styles.easingCurve}>{e.curve}</p>
                <p className={styles.easingDesc}>{e.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reduced Motion */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Reduced Motion</h2>
        <p className={styles.sectionDescription}>
          All animations respect the prefers-reduced-motion media query for accessibility.
        </p>
        <div className={styles.codeBlock}>
          <pre className={styles.code}>
            {`@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}`}
          </pre>
        </div>
      </section>

      {/* Guidelines */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Guidelines</h2>
        <div className={styles.guidelines}>
          <div className={styles.guideline}>
            <h3 className={styles.guidelineTitle}>Be purposeful</h3>
            <p className={styles.guidelineText}>
              Every animation should serve a purpose: provide feedback, guide attention, or show
              relationships. Avoid decoration-only motion.
            </p>
          </div>
          <div className={styles.guideline}>
            <h3 className={styles.guidelineTitle}>Keep it fast</h3>
            <p className={styles.guidelineText}>
              Most UI animations should be 150-300ms. Users should never wait for animations.
              Instant feedback is more important than smooth motion.
            </p>
          </div>
          <div className={styles.guideline}>
            <h3 className={styles.guidelineTitle}>Use ease-out for entrances</h3>
            <p className={styles.guidelineText}>
              Elements entering the screen should use ease-out (fast start, slow end). This feels
              responsive and natural.
            </p>
          </div>
          <div className={styles.guideline}>
            <h3 className={styles.guidelineTitle}>Use ease-in for exits</h3>
            <p className={styles.guidelineText}>
              Elements leaving should use ease-in (slow start, fast end). They accelerate away,
              making room for new content.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
