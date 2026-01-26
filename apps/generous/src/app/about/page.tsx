import styles from "./page.module.css";

export const metadata = {
  title: "About | Generous",
  description: "Technical overview of the Generous prototype",
};

export default function AboutPage() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>How This Works</h1>
          <p className={styles.tagline}>Technical overview of the prototype</p>
        </header>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Architecture</h2>
          <p className={styles.text}>
            This is a prototype exploring AI-generated UI components. The core idea: an LLM outputs
            JSONL patches that describe a component tree, which gets rendered by{" "}
            <code>@json-render/react</code>.
          </p>
          <pre className={styles.codeBlock}>{`User prompt
    ↓
Chat API (GPT-4.1-mini)
    ↓
JSONL patches (streamed)
    ↓
json-render tree
    ↓
React components (from registry)`}</pre>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>JSONL Patch Format</h2>
          <p className={styles.text}>
            The AI outputs newline-delimited JSON patches. Each patch adds an element or sets data:
          </p>
          <pre
            className={styles.codeBlock}
          >{`{"op":"set","path":"/data","value":{"formField":"initial"}}
{"op":"set","path":"/root","value":"card1"}
{"op":"add","path":"/elements/card1","value":{"type":"Card","props":{"title":"My Card"},"children":["text1"]}}
{"op":"add","path":"/elements/text1","value":{"type":"Text","props":{"content":"Hello"},"children":[]}}`}</pre>
          <p className={styles.text}>
            This builds a tree with a root element, child references by key, and optional reactive
            data. The format streams well - each line is valid JSON, so we can render progressively.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Component Registry</h2>
          <p className={styles.text}>
            Components are defined in <code>tool-registry.tsx</code>. Each component receives props
            from the JSONL and can trigger actions. The registry acts as a whitelist - the AI can
            only use components we've defined.
          </p>
          <p className={styles.text}>
            Available components: Button, Card, Input, Select, Grid, Stack, Metric, PetList,
            InventoryList, StatusMessage, etc. See{" "}
            <a href="/styleguide/catalog">/styleguide/catalog</a> for the full list.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Action System</h2>
          <p className={styles.text}>
            Components can trigger actions via <code>onAction</code>. Actions are defined in{" "}
            <code>StoredComponentRenderer.tsx</code>:
          </p>
          <pre
            className={styles.codeBlock}
          >{`set       - Update a data path: {path: "/field", value: "new"}
toggle    - Toggle boolean: {path: "/isOpen"}
increment - Add to number: {path: "/count", by: 1}
apiCall   - HTTP request: {endpoint, method, bodyPaths, revalidate}`}</pre>
          <p className={styles.text}>
            The <code>apiCall</code> action reads form values from data paths, makes the request,
            and triggers SWR revalidation. This lets forms actually submit data.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Data Binding</h2>
          <p className={styles.text}>
            <code>@json-render/react</code> provides a DataProvider context. Form inputs read/write
            to paths like <code>/form/itemName</code>. When you type, it calls the <code>set</code>{" "}
            action. When you submit, <code>apiCall</code> reads those paths to build the request
            body.
          </p>
          <pre className={styles.codeBlock}>{`// Input bound to /form/name
<Input valuePath="/form/name" />

// Button that submits the form
<Button action={{
  name: "apiCall",
  params: {
    endpoint: "/api/pets",
    bodyPaths: { name: "/form/name" }
  }
}} />`}</pre>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Tool Catalog</h2>
          <p className={styles.text}>
            The AI's system prompt includes <code>tool-catalog.ts</code> which documents all
            available components with their props schemas. This constrains what the AI can generate
            and provides examples of how to use each component.
          </p>
          <p className={styles.text}>
            The catalog uses Zod schemas for validation. If the AI outputs invalid props, rendering
            fails gracefully.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Design System</h2>
          <p className={styles.text}>
            <code>@generous/ui</code> is a separate package with Base UI primitives + design tokens.
            The tool-registry components use CSS Modules that reference these tokens (
            <code>--surface-primary</code>, <code>--text-secondary</code>, etc).
          </p>
          <p className={styles.text}>
            See <a href="/styleguide">/styleguide</a> for the full design system documentation.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Persistence</h2>
          <p className={styles.text}>
            Chat history and created components are stored in IndexedDB via <code>db.ts</code>. Grid
            positions are also persisted so components stay where you put them.
          </p>
          <p className={styles.text}>
            The pet store data lives in PostgreSQL (Neon) via Drizzle ORM. The API routes in{" "}
            <code>/api/pets</code>, <code>/api/inventory</code>, etc. are standard REST.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Key Files</h2>
          <pre
            className={styles.codeBlock}
          >{`/api/chat/route.ts     - Chat endpoint, defines AI tools + system prompt
/components/
  tool-registry.tsx    - All renderable components
  StoredComponentRenderer.tsx - Renders saved components with action handlers
  ToolResultRenderer.tsx - Renders inline tool results in chat
/lib/
  tool-catalog.ts      - Component schemas for AI prompt
  db.ts                - IndexedDB persistence
  app-state.tsx        - React context for app state`}</pre>
        </section>

        <footer className={styles.footer}>
          <a href="/">← Back to app</a>
        </footer>
      </main>
    </div>
  );
}
