"use client";

import { Badge } from "@generous/ui";
import Link from "next/link";
import styles from "./page.module.css";

// Component catalog data - loosely coupled, can be updated independently
const catalogComponents = {
  interactive: {
    title: "Interactive",
    description: "Components that respond to user interaction and trigger actions",
    components: [
      {
        name: "Button",
        description: "Clickable button that triggers an action",
        props: ["label", "action", "variant", "size"],
        variants: ["primary", "secondary", "outline", "danger"],
        actions: ["set", "toggleColor", "increment", "toggle"],
        relatedStyleguide: "/styleguide/components/button",
        relatedNote: "Different API - catalog uses label prop, styleguide uses children",
      },
      {
        name: "InteractiveCard",
        description: "Card that reads color from data path and triggers action on click",
        props: ["title", "colorPath", "action", "padding"],
        hasChildren: true,
        actions: ["toggleColor"],
        relatedStyleguide: "/styleguide/components/card",
        relatedNote: "Extended with data binding and click actions",
      },
    ],
  },
  layout: {
    title: "Layout",
    description: "Structural components for organizing content",
    components: [
      {
        name: "Card",
        description: "Container card with optional title",
        props: ["title", "variant", "padding"],
        variants: ["default", "gradient", "outline"],
        hasChildren: true,
        relatedStyleguide: "/styleguide/components/card",
      },
      {
        name: "Grid",
        description: "Grid layout with configurable columns",
        props: ["columns", "gap"],
        hasChildren: true,
        relatedStyleguide: "/styleguide/patterns/layout",
        relatedNote: "See Grid pattern section",
      },
      {
        name: "Stack",
        description: "Flex stack layout for arranging items",
        props: ["direction", "gap", "align"],
        hasChildren: true,
        relatedStyleguide: "/styleguide/patterns/layout",
        relatedNote: "See Stack pattern section",
      },
    ],
  },
  dataDisplay: {
    title: "Data Display",
    description: "Components for visualizing data and metrics",
    components: [
      {
        name: "Metric",
        description: "Display a metric with label, value, and optional trend",
        props: ["label", "value", "unit", "trend", "trendValue", "size"],
        relatedStyleguide: "/styleguide/patterns/compositions",
        relatedNote: "See Stat Cards pattern",
      },
      {
        name: "Sparkline",
        description: "Small inline chart for trends",
        props: ["data", "color", "height"],
        relatedStyleguide: null,
        relatedNote: "Custom SVG component, no direct styleguide equivalent",
      },
      {
        name: "ProgressBar",
        description: "Progress indicator bar",
        props: ["value", "max", "label", "color"],
        relatedStyleguide: "/styleguide/components/progress",
        relatedNote: "Maps to Progress component",
      },
      {
        name: "WeatherIcon",
        description: "Weather condition icon",
        props: ["condition", "size"],
        conditions: ["sunny", "cloudy", "rainy", "snowy", "partly cloudy", "stormy"],
        relatedStyleguide: null,
        relatedNote: "Domain-specific component",
      },
      {
        name: "ForecastDay",
        description: "Single day weather forecast",
        props: ["day", "high", "low", "condition"],
        relatedStyleguide: null,
        relatedNote: "Domain-specific component",
      },
      {
        name: "PriceChange",
        description: "Price change indicator with color coding",
        props: ["change", "changePercent"],
        relatedStyleguide: null,
        relatedNote: "Domain-specific component",
      },
      {
        name: "StockStat",
        description: "Stock statistic label-value pair",
        props: ["label", "value"],
        relatedStyleguide: null,
        relatedNote: "Domain-specific component",
      },
      {
        name: "SearchResult",
        description: "Search result with title, URL, and snippet",
        props: ["title", "url", "snippet"],
        relatedStyleguide: null,
        relatedNote: "Domain-specific component",
      },
    ],
  },
  typography: {
    title: "Typography",
    description: "Text and heading components",
    components: [
      {
        name: "Heading",
        description: "Section heading with configurable level",
        props: ["text", "level"],
        levels: ["h1", "h2", "h3", "h4"],
        relatedStyleguide: "/styleguide/typography",
      },
      {
        name: "Text",
        description: "Text content with variants and colors",
        props: ["content", "variant", "color"],
        variants: ["body", "caption", "label"],
        colors: ["default", "muted", "success", "warning", "danger"],
        relatedStyleguide: "/styleguide/typography",
      },
    ],
  },
  status: {
    title: "Status & Decoration",
    description: "Visual indicators and decorative elements",
    components: [
      {
        name: "Badge",
        description: "Status badge indicator",
        props: ["text", "variant"],
        variants: ["default", "success", "warning", "danger", "info"],
        relatedStyleguide: "/styleguide/components/badge",
        relatedNote: "Similar API with text prop instead of children",
      },
      {
        name: "Divider",
        description: "Visual separator with optional label",
        props: ["label"],
        relatedStyleguide: "/styleguide/components/separator",
      },
    ],
  },
  utility: {
    title: "Utility",
    description: "Specialized utility components",
    components: [
      {
        name: "Timer",
        description: "Countdown timer display",
        props: ["duration", "label", "endsAt"],
        relatedStyleguide: null,
        relatedNote: "Custom interactive component",
      },
      {
        name: "Calculation",
        description: "Math calculation display",
        props: ["expression", "result"],
        relatedStyleguide: null,
        relatedNote: "Custom display component",
      },
    ],
  },
  dynamicData: {
    title: "Dynamic Data",
    description: "Components that fetch and display live data from APIs",
    components: [
      {
        name: "DataList",
        description: "Generic data fetcher with auto-refresh",
        props: ["endpoint", "dataKey", "emptyMessage", "refreshInterval"],
        hasChildren: true,
        relatedStyleguide: null,
        relatedNote: "Data-fetching wrapper component",
      },
      {
        name: "PetCard",
        description: "Displays a single pet with details",
        props: ["name", "species", "breed", "age", "price", "status", "description"],
        relatedStyleguide: "/styleguide/components/card",
        relatedNote: "Domain-specific card variant",
      },
      {
        name: "PetList",
        description: "Fetches and displays pets from API with filtering",
        props: ["status", "species", "refreshInterval", "fields", "layout"],
        layouts: ["cards", "list", "compact"],
        relatedStyleguide: null,
        relatedNote: "Data-fetching list component with live updates",
      },
    ],
  },
};

interface CatalogComponent {
  name: string;
  description: string;
  props: string[];
  variants?: string[];
  actions?: string[];
  conditions?: string[];
  levels?: string[];
  colors?: string[];
  layouts?: string[];
  hasChildren?: boolean;
  relatedStyleguide: string | null;
  relatedNote?: string;
}

function ComponentCard({ component }: { component: CatalogComponent }) {
  return (
    <div className={styles.componentCard}>
      <div className={styles.componentHeader}>
        <h3 className={styles.componentName}>{component.name}</h3>
        {component.hasChildren && (
          <Badge variant="outline" style={{ fontSize: "10px" }}>
            children
          </Badge>
        )}
      </div>
      <p className={styles.componentDescription}>{component.description}</p>

      <div className={styles.componentProps}>
        <span className={styles.propLabel}>Props:</span>
        <div className={styles.propList}>
          {component.props.map((prop) => (
            <code key={prop} className={styles.propName}>
              {prop}
            </code>
          ))}
        </div>
      </div>

      {component.variants && (
        <div className={styles.componentMeta}>
          <span className={styles.metaLabel}>Variants:</span>
          <span className={styles.metaValue}>{component.variants.join(" | ")}</span>
        </div>
      )}

      {component.actions && (
        <div className={styles.componentMeta}>
          <span className={styles.metaLabel}>Actions:</span>
          <span className={styles.metaValue}>{component.actions.join(" | ")}</span>
        </div>
      )}

      {component.conditions && (
        <div className={styles.componentMeta}>
          <span className={styles.metaLabel}>Conditions:</span>
          <span className={styles.metaValue}>{component.conditions.join(" | ")}</span>
        </div>
      )}

      {component.levels && (
        <div className={styles.componentMeta}>
          <span className={styles.metaLabel}>Levels:</span>
          <span className={styles.metaValue}>{component.levels.join(" | ")}</span>
        </div>
      )}

      {component.colors && (
        <div className={styles.componentMeta}>
          <span className={styles.metaLabel}>Colors:</span>
          <span className={styles.metaValue}>{component.colors.join(" | ")}</span>
        </div>
      )}

      {component.layouts && (
        <div className={styles.componentMeta}>
          <span className={styles.metaLabel}>Layouts:</span>
          <span className={styles.metaValue}>{component.layouts.join(" | ")}</span>
        </div>
      )}

      <div className={styles.relatedSection}>
        {component.relatedStyleguide ? (
          <Link href={component.relatedStyleguide} className={styles.relatedLink}>
            View in Styleguide
          </Link>
        ) : (
          <span className={styles.noRelated}>No styleguide equivalent</span>
        )}
        {component.relatedNote && <p className={styles.relatedNote}>{component.relatedNote}</p>}
      </div>
    </div>
  );
}

export default function CatalogPage() {
  const totalComponents = Object.values(catalogComponents).reduce(
    (sum, category) => sum + category.components.length,
    0,
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Component Catalog</h1>
        <p className={styles.description}>
          Reference for all {totalComponents} components available in the JSON-Render system. These
          components define what the AI can use to render tool results. The rendering implementation
          is decoupled and can be swapped independently.
        </p>
      </header>

      <section className={styles.overview}>
        <h2 className={styles.overviewTitle}>Architecture</h2>
        <div className={styles.architectureGrid}>
          <div className={styles.architectureCard}>
            <h3>Catalog (Schema)</h3>
            <p>
              Defines component names, props, and validation using Zod schemas. Acts as a contract
              between AI and renderer.
            </p>
            <code className={styles.filePath}>src/lib/tool-catalog.ts</code>
          </div>
          <div className={styles.architectureCard}>
            <h3>Registry (Implementation)</h3>
            <p>
              React components that implement the catalog schema. Can be swapped for different
              rendering systems.
            </p>
            <code className={styles.filePath}>src/components/tool-registry.tsx</code>
          </div>
          <div className={styles.architectureCard}>
            <h3>Styleguide (Design System)</h3>
            <p>
              @generous/ui components with full accessibility and theming. Registry components may
              use these internally.
            </p>
            <code className={styles.filePath}>packages/ui/</code>
          </div>
        </div>
      </section>

      {Object.entries(catalogComponents).map(([key, category]) => (
        <section key={key} className={styles.section}>
          <h2 className={styles.sectionTitle}>
            {category.title}
            <Badge variant="secondary" style={{ marginLeft: 8, fontSize: "11px" }}>
              {category.components.length}
            </Badge>
          </h2>
          <p className={styles.sectionDescription}>{category.description}</p>
          <div className={styles.componentGrid}>
            {category.components.map((component) => (
              <ComponentCard key={component.name} component={component} />
            ))}
          </div>
        </section>
      ))}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Usage Notes</h2>
        <div className={styles.usageNotes}>
          <div className={styles.usageCard}>
            <h3>Data Binding</h3>
            <p>
              Interactive components can read from and write to a shared data context. Use{" "}
              <code>colorPath</code> to bind to data, and <code>action</code> with params to modify
              it.
            </p>
            <pre className={styles.codeExample}>
              {`// Initial data in tree
{"op":"set","path":"/data","value":{"cardColor":"blue"}}

// Component reads from path
{"type":"InteractiveCard","props":{"colorPath":"/cardColor"}}`}
            </pre>
          </div>
          <div className={styles.usageCard}>
            <h3>Actions</h3>
            <p>Available actions for interactive components:</p>
            <ul>
              <li>
                <code>set</code> - Set a value at a path
              </li>
              <li>
                <code>toggle</code> - Toggle a boolean value
              </li>
              <li>
                <code>toggleColor</code> - Cycle through color palette
              </li>
              <li>
                <code>increment</code> - Increment a number
              </li>
            </ul>
          </div>
          <div className={styles.usageCard}>
            <h3>Live Data</h3>
            <p>
              <code>PetList</code> and <code>DataList</code> fetch data from APIs and auto-refresh.
              Use <code>fields</code> to control what data is displayed.
            </p>
            <pre className={styles.codeExample}>
              {`{"type":"PetList","props":{
  "status":"available",
  "fields":["name","price"],
  "layout":"compact"
}}`}
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
}
