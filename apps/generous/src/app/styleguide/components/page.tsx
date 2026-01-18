import Link from "next/link";
import styles from "./page.module.css";

const componentCategories = [
  {
    title: "Foundation",
    components: [
      { name: "VisuallyHidden", href: "/styleguide/components/visually-hidden" },
      { name: "Portal", href: "/styleguide/components/portal" },
      { name: "FocusTrap", href: "/styleguide/components/focus-trap" },
      { name: "Slot", href: "/styleguide/components/slot" },
      { name: "Separator", href: "/styleguide/components/separator" },
    ],
  },
  {
    title: "Primitives",
    components: [
      { name: "Button", href: "/styleguide/components/button" },
      { name: "Toggle", href: "/styleguide/components/toggle" },
      { name: "ToggleGroup", href: "/styleguide/components/toggle-group" },
      { name: "Avatar", href: "/styleguide/components/avatar" },
      { name: "Badge", href: "/styleguide/components/badge" },
      { name: "Checkbox", href: "/styleguide/components/checkbox" },
      { name: "Radio", href: "/styleguide/components/radio" },
      { name: "RadioGroup", href: "/styleguide/components/radio-group" },
      { name: "Switch", href: "/styleguide/components/switch" },
      { name: "Progress", href: "/styleguide/components/progress" },
      { name: "Slider", href: "/styleguide/components/slider" },
      { name: "Spinner", href: "/styleguide/components/spinner" },
    ],
  },
  {
    title: "Text & Input",
    components: [
      { name: "Input", href: "/styleguide/components/input" },
      { name: "Textarea", href: "/styleguide/components/textarea" },
      { name: "Label", href: "/styleguide/components/label" },
      { name: "Field", href: "/styleguide/components/field" },
      { name: "NumberField", href: "/styleguide/components/number-field" },
      { name: "SearchField", href: "/styleguide/components/search-field" },
    ],
  },
  {
    title: "Overlays",
    components: [
      { name: "Popover", href: "/styleguide/components/popover" },
      { name: "Tooltip", href: "/styleguide/components/tooltip" },
      { name: "Dialog", href: "/styleguide/components/dialog" },
      { name: "AlertDialog", href: "/styleguide/components/alert-dialog" },
      { name: "Drawer", href: "/styleguide/components/drawer" },
      { name: "Sheet", href: "/styleguide/components/sheet" },
    ],
  },
  {
    title: "Selection",
    components: [
      { name: "Select", href: "/styleguide/components/select" },
      { name: "Combobox", href: "/styleguide/components/combobox" },
      { name: "Menu", href: "/styleguide/components/menu" },
      { name: "DropdownMenu", href: "/styleguide/components/dropdown-menu" },
      { name: "ContextMenu", href: "/styleguide/components/context-menu" },
    ],
  },
  {
    title: "Navigation",
    components: [
      { name: "Tabs", href: "/styleguide/components/tabs" },
      { name: "Accordion", href: "/styleguide/components/accordion" },
      { name: "Collapsible", href: "/styleguide/components/collapsible" },
      { name: "NavigationMenu", href: "/styleguide/components/navigation-menu" },
      { name: "Breadcrumb", href: "/styleguide/components/breadcrumb" },
      { name: "Pagination", href: "/styleguide/components/pagination" },
    ],
  },
  {
    title: "Data Display",
    components: [
      { name: "Table", href: "/styleguide/components/table" },
      { name: "ScrollArea", href: "/styleguide/components/scroll-area" },
      { name: "AspectRatio", href: "/styleguide/components/aspect-ratio" },
      { name: "Skeleton", href: "/styleguide/components/skeleton" },
      { name: "Card", href: "/styleguide/components/card" },
    ],
  },
  {
    title: "Feedback",
    components: [
      { name: "Toast", href: "/styleguide/components/toast" },
      { name: "Form", href: "/styleguide/components/form" },
    ],
  },
];

function ComponentPreview({ name }: { name: string }) {
  switch (name) {
    case "Button":
      return <div className={styles.previewButton}>Button</div>;
    case "Input":
    case "Textarea":
    case "NumberField":
    case "SearchField":
      return <div className={styles.previewInput} />;
    case "Checkbox":
      return (
        <div className={styles.previewCheckbox}>
          <div className={styles.previewCheckboxBox}>
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>
      );
    case "Switch":
      return (
        <div className={styles.previewSwitch}>
          <div className={styles.previewSwitchThumb} />
        </div>
      );
    case "Badge":
      return <div className={styles.previewBadge}>Badge</div>;
    case "Avatar":
      return <div className={styles.previewAvatar}>AB</div>;
    case "Progress":
      return (
        <div className={styles.previewProgress}>
          <div className={styles.previewProgressBar} />
        </div>
      );
    case "Spinner":
      return <div className={styles.previewSpinner} />;
    case "Tabs":
      return (
        <div className={styles.previewTabs}>
          <div className={`${styles.previewTab} ${styles.previewTabActive}`}>Tab 1</div>
          <div className={styles.previewTab}>Tab 2</div>
        </div>
      );
    case "Card":
      return (
        <div className={styles.previewCard}>
          <div className={styles.previewCardLine} />
          <div className={styles.previewCardLineShort} />
        </div>
      );
    case "Dialog":
    case "AlertDialog":
    case "Drawer":
    case "Sheet":
      return (
        <div className={styles.previewDialog}>
          <div className={styles.previewCardLine} />
        </div>
      );
    case "Tooltip":
    case "Popover":
      return <div className={styles.previewTooltip}>Tooltip</div>;
    case "Select":
    case "Combobox":
    case "Menu":
    case "DropdownMenu":
    case "ContextMenu":
      return (
        <div className={styles.previewSelect}>
          <span>Select</span>
          <svg
            aria-hidden="true"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      );
    case "Table":
      return (
        <div className={styles.previewTable}>
          <div className={styles.previewTableRow}>
            <div className={styles.previewTableCell}>Col 1</div>
            <div className={styles.previewTableCell}>Col 2</div>
          </div>
          <div className={styles.previewTableRow}>
            <div className={styles.previewTableCell}>Data</div>
            <div className={styles.previewTableCell}>Data</div>
          </div>
        </div>
      );
    case "Skeleton":
      return <div className={styles.previewSkeleton} />;
    case "Slider":
      return (
        <div className={styles.previewSlider}>
          <div className={styles.previewSliderTrack} />
          <div className={styles.previewSliderThumb} />
        </div>
      );
    default:
      return (
        <div className={styles.previewCard}>
          <div className={styles.previewCardLineShort} />
        </div>
      );
  }
}

export default function ComponentsPage() {
  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>Components</h1>
        <p className={styles.description}>
          47 accessible components built with React and CSS Modules. Each component supports all
          interaction states and automatic dark mode.
        </p>
      </header>

      {/* Categories */}
      {componentCategories.map((category) => (
        <section key={category.title} className={styles.category}>
          <h2 className={styles.categoryTitle}>{category.title}</h2>
          <div className={styles.componentGrid}>
            {category.components.map((component) => (
              <Link key={component.name} href={component.href} className={styles.componentCard}>
                <div className={styles.componentPreview}>
                  <ComponentPreview name={component.name} />
                </div>
                <p className={styles.componentName}>{component.name}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
