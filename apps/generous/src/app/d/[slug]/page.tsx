"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import RGL from "react-grid-layout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { StoredComponentRenderer } from "@/components/StoredComponentRenderer";
import type { GridLayoutItem, StoredComponent } from "@/lib/db";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import styles from "./page.module.css";

// Cast to fix type issues with react-grid-layout
const GridLayout = RGL as unknown as React.ComponentType<{
  className?: string;
  layout: Array<{ i: string; x: number; y: number; w: number; h: number }>;
  cols: number;
  rowHeight: number;
  width: number;
  isDraggable?: boolean;
  isResizable?: boolean;
  children?: React.ReactNode;
}>;

interface Dashboard {
  id: string;
  slug: string;
  name: string;
  description?: string;
  isPublic: boolean;
  components: StoredComponent[];
  gridLayout: GridLayoutItem[];
}

export default function PublicDashboardPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const isEmbed = searchParams.get("embed") === "true";

  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [width, setWidth] = useState(1200);

  useEffect(() => {
    setWidth(window.innerWidth);
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const response = await fetch(`/api/dashboards/${slug}`);
        if (response.ok) {
          const data = await response.json();
          if (!data.isPublic) {
            setError("This dashboard is private");
          } else {
            setDashboard(data);
          }
        } else if (response.status === 404) {
          setError("Dashboard not found");
        } else {
          setError("Failed to load dashboard");
        }
      } catch (e) {
        setError("Failed to load dashboard");
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboard();
  }, [slug]);

  if (isLoading) {
    return (
      <main className={`${styles.container} ${isEmbed ? styles.embed : ""}`}>
        <div className={styles.loading}>Loading dashboard...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className={`${styles.container} ${isEmbed ? styles.embed : ""}`}>
        <div className={styles.error}>
          <h1>{error}</h1>
          {error === "This dashboard is private" && (
            <p>You don&apos;t have permission to view this dashboard.</p>
          )}
          {error === "Dashboard not found" && (
            <p>The dashboard you&apos;re looking for doesn&apos;t exist.</p>
          )}
        </div>
      </main>
    );
  }

  if (!dashboard) {
    return null;
  }

  // Filter out chat widget for public view
  const publicLayout = dashboard.gridLayout.filter((item) => item.i !== "chat");

  return (
    <main className={`${styles.container} ${isEmbed ? styles.embed : ""}`}>
      {!isEmbed && (
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>{dashboard.name}</h1>
            {dashboard.description && <p className={styles.description}>{dashboard.description}</p>}
          </div>
          <div className={styles.badge}>Public Dashboard</div>
        </header>
      )}

      <div className={styles.dashboardContent}>
        {publicLayout.length === 0 ? (
          <div className={styles.empty}>
            <p>This dashboard has no components yet.</p>
          </div>
        ) : (
          <GridLayout
            className="layout"
            layout={publicLayout}
            cols={12}
            rowHeight={100}
            width={width - (isEmbed ? 0 : 48)}
            isDraggable={false}
            isResizable={false}
          >
            {dashboard.components.map((component) => (
              <div key={component.id} className={styles.gridItem}>
                <ErrorBoundary>
                  <StoredComponentRenderer component={component} readOnly />
                </ErrorBoundary>
              </div>
            ))}
          </GridLayout>
        )}
      </div>

      {!isEmbed && (
        <footer className={styles.footer}>
          <a href="/" className={styles.footerLink}>
            Powered by Generous
          </a>
        </footer>
      )}
    </main>
  );
}
