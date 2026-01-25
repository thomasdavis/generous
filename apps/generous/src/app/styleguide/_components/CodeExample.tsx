"use client";

import { type ReactNode, useState } from "react";
import styles from "./CodeExample.module.css";

export interface CodeExampleProps {
  /**
   * The code to display
   */
  code: string;
  /**
   * Programming language for syntax highlighting
   * @default "tsx"
   */
  language?: "tsx" | "jsx" | "typescript" | "javascript" | "css" | "html" | "bash";
  /**
   * Optional title for the code block
   */
  title?: string;
  /**
   * Optional live preview of the component
   */
  preview?: ReactNode;
  /**
   * Whether the code is collapsed by default
   */
  collapsed?: boolean;
}

export function CodeExample({
  code,
  language = "tsx",
  title,
  preview,
  collapsed = false,
}: CodeExampleProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!collapsed);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className={styles.container}>
      {preview && <div className={styles.preview}>{preview}</div>}
      <div className={styles.codeWrapper}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            {title && <span className={styles.title}>{title}</span>}
            <span className={styles.language}>{language}</span>
          </div>
          <div className={styles.headerRight}>
            {collapsed && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className={styles.toggleButton}
              >
                {isExpanded ? "Collapse" : "Expand"}
              </button>
            )}
            <button
              type="button"
              onClick={handleCopy}
              className={styles.copyButton}
              aria-label={copied ? "Copied!" : "Copy code"}
            >
              {copied ? (
                <svg className={styles.icon} viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M3.5 8.5l3 3 6-7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg className={styles.icon} viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M5.5 3.5h-2a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1v-2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6.5 2.5h6a1 1 0 011 1v6a1 1 0 01-1 1h-6a1 1 0 01-1-1v-6a1 1 0 011-1z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              <span className={styles.copyText}>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>
        {isExpanded && (
          <pre className={styles.pre}>
            <code className={styles.code}>{code.trim()}</code>
          </pre>
        )}
      </div>
    </div>
  );
}

/* ============================================
 * INLINE CODE
 * ============================================ */

export interface InlineCodeProps {
  children: string;
}

export function InlineCode({ children }: InlineCodeProps) {
  return <code className={styles.inlineCode}>{children}</code>;
}
