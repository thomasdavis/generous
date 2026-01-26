import styles from "./page.module.css";

export const metadata = {
  title: "About | Generous",
  description: "Learn about Generous - an AI-powered conversational UI builder",
};

export default function AboutPage() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>About Generous</h1>
          <p className={styles.tagline}>AI-Powered Conversational UI Builder</p>
        </header>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>What is Generous?</h2>
          <p className={styles.text}>
            Generous is a next-generation UI builder that lets you create dynamic, interactive
            components through natural language conversations. Simply describe what you want, and
            watch as AI generates beautiful, functional UI components in real-time.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Key Features</h2>
          <div className={styles.features}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>🎨</div>
              <h3 className={styles.featureTitle}>Dynamic Components</h3>
              <p className={styles.featureText}>
                Generate interactive cards, charts, forms, and dashboards from natural language
                descriptions.
              </p>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>🔧</div>
              <h3 className={styles.featureTitle}>Built-in Tools</h3>
              <p className={styles.featureText}>
                Weather, stock prices, calculations, web search, and more - all accessible through
                conversation.
              </p>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>🐾</div>
              <h3 className={styles.featureTitle}>Pet Store API</h3>
              <p className={styles.featureText}>
                Full CRUD operations for pets, customers, orders, and inventory - perfect for
                testing and demos.
              </p>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>⚡</div>
              <h3 className={styles.featureTitle}>Real-time Updates</h3>
              <p className={styles.featureText}>
                Components stay in sync with live data through automatic refresh and SWR-powered
                fetching.
              </p>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>💾</div>
              <h3 className={styles.featureTitle}>Persistent Storage</h3>
              <p className={styles.featureText}>
                Your conversations and created components are saved locally with IndexedDB for
                offline access.
              </p>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>🎯</div>
              <h3 className={styles.featureTitle}>Design System</h3>
              <p className={styles.featureText}>
                Built on a comprehensive design system with 47+ components following accessibility
                best practices.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Technology Stack</h2>
          <div className={styles.techStack}>
            <div className={styles.techItem}>
              <strong>Frontend:</strong> Next.js 16, React 19, TypeScript
            </div>
            <div className={styles.techItem}>
              <strong>AI:</strong> OpenAI GPT-4.1-mini, Vercel AI SDK
            </div>
            <div className={styles.techItem}>
              <strong>Database:</strong> PostgreSQL, Drizzle ORM
            </div>
            <div className={styles.techItem}>
              <strong>Auth:</strong> Better Auth
            </div>
            <div className={styles.techItem}>
              <strong>Styling:</strong> CSS Modules, Design Tokens
            </div>
            <div className={styles.techItem}>
              <strong>Testing:</strong> Vitest, Playwright
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Get Started</h2>
          <div className={styles.cta}>
            <a href="/" className={styles.ctaButton}>
              Try the Chat Interface
            </a>
            <a href="/styleguide" className={styles.ctaButtonSecondary}>
              Explore the Design System
            </a>
          </div>
        </section>

        <footer className={styles.footer}>
          <p className={styles.footerText}>Built with ❤️ using AI-assisted development</p>
        </footer>
      </main>
    </div>
  );
}
