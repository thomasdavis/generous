"use client";

import { useState } from "react";
import styles from "./page.module.css";

// Common icons from Lucide - these would typically be imported from lucide-react
const iconList = [
  { name: "ChevronDown", path: "M6 9l6 6 6-6" },
  { name: "ChevronUp", path: "M18 15l-6-6-6 6" },
  { name: "ChevronLeft", path: "M15 18l-6-6 6-6" },
  { name: "ChevronRight", path: "M9 18l6-6-6-6" },
  { name: "X", path: "M18 6 6 18M6 6l12 12" },
  { name: "Check", path: "M20 6 9 17l-5-5" },
  { name: "Plus", path: "M5 12h14M12 5v14" },
  { name: "Minus", path: "M5 12h14" },
  { name: "Search", path: "M11 3a8 8 0 100 16 8 8 0 000-16zM21 21l-4.35-4.35" },
  { name: "Menu", path: "M4 12h16M4 6h16M4 18h16" },
  { name: "MoreHorizontal", path: "M12 12h.01M19 12h.01M5 12h.01" },
  { name: "MoreVertical", path: "M12 12h.01M12 19h.01M12 5h.01" },
  {
    name: "Settings",
    path: "M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z",
  },
  { name: "User", path: "M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z" },
  { name: "Bell", path: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" },
  {
    name: "Mail",
    path: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
  },
  {
    name: "Calendar",
    path: "M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM16 2v4M8 2v4M3 10h18",
  },
  { name: "Clock", path: "M12 2a10 10 0 100 20 10 10 0 000-20zM12 6v6l4 2" },
  {
    name: "Heart",
    path: "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0016.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 002 8.5c0 2.3 1.5 4.05 3 5.5l7 7z",
  },
  {
    name: "Star",
    path: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  },
  {
    name: "Trash",
    path: "M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2",
  },
  {
    name: "Edit",
    path: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  },
  {
    name: "Copy",
    path: "M20 9h-9a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-9a2 2 0 00-2-2zM5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1",
  },
  { name: "Download", path: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" },
  { name: "Upload", path: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" },
  {
    name: "ExternalLink",
    path: "M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3",
  },
  {
    name: "Link",
    path: "M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71",
  },
  { name: "Info", path: "M12 2a10 10 0 100 20 10 10 0 000-20zM12 16v-4M12 8h.01" },
  { name: "AlertCircle", path: "M12 2a10 10 0 100 20 10 10 0 000-20zM12 8v4M12 16h.01" },
  {
    name: "AlertTriangle",
    path: "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01",
  },
  { name: "CheckCircle", path: "M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3" },
];

export default function IconsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredIcons = iconList.filter((icon) =>
    icon.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>Icons</h1>
        <p className={styles.description}>
          We use Lucide icons for a consistent, clean icon set. Icons should be used at standard
          sizes and inherit text color for flexibility.
        </p>
      </header>

      {/* Search */}
      <section className={styles.section}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search icons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </section>

      {/* Icon Grid */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Icon Library</h2>
        <p className={styles.sectionDescription}>
          Click an icon to copy its name. These are rendered as inline SVGs for maximum flexibility.
        </p>
        <div className={styles.iconGrid}>
          {filteredIcons.map((icon) => (
            <button
              type="button"
              key={icon.name}
              className={styles.iconCard}
              onClick={() => navigator.clipboard.writeText(icon.name)}
              title={`Copy "${icon.name}"`}
            >
              <svg
                className={styles.icon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d={icon.path} />
              </svg>
              <span className={styles.iconName}>{icon.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Sizes */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Icon Sizes</h2>
        <p className={styles.sectionDescription}>
          Icons should match the context. Use 16px for inline text, 20-24px for buttons, larger for
          empty states.
        </p>
        <div className={styles.sizeDemo}>
          {[12, 16, 20, 24, 32, 48].map((size) => (
            <div key={size} className={styles.sizeItem}>
              <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0016.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 002 8.5c0 2.3 1.5 4.05 3 5.5l7 7z" />
              </svg>
              <span className={styles.sizeLabel}>{size}px</span>
            </div>
          ))}
        </div>
      </section>

      {/* Guidelines */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Guidelines</h2>
        <div className={styles.guidelines}>
          <div className={styles.guideline}>
            <h3 className={styles.guidelineTitle}>Use currentColor</h3>
            <p className={styles.guidelineText}>
              Icons should inherit their color from the parent text color. Use
              stroke=&quot;currentColor&quot; for flexibility across themes.
            </p>
          </div>
          <div className={styles.guideline}>
            <h3 className={styles.guidelineTitle}>Match visual weight</h3>
            <p className={styles.guidelineText}>
              Keep stroke width consistent (usually 2px). Icons should have similar visual weight to
              avoid some appearing bolder than others.
            </p>
          </div>
          <div className={styles.guideline}>
            <h3 className={styles.guidelineTitle}>Provide labels</h3>
            <p className={styles.guidelineText}>
              For accessibility, always provide text labels or aria-label for icons. Use aria-hidden
              on decorative icons.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
