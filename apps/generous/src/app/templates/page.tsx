"use client";

import { useCallback, useState } from "react";
import { TemplateGallery } from "@/components/templates";
import styles from "./page.module.css";

export default function TemplatesPage() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleInstall = useCallback(async (templateId: string) => {
    const response = await fetch(`/api/templates/${templateId}/install`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      const data = await response.json();
      setSuccessMessage(data.message);
      setTimeout(() => setSuccessMessage(null), 5000);
    } else if (response.status === 401) {
      // Redirect to login or show message
      setSuccessMessage("Please sign in to install templates");
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      const data = await response.json();
      throw new Error(data.error || "Failed to install template");
    }
  }, []);

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Template Marketplace</h1>
          <p className={styles.subtitle}>
            Discover and install pre-built dashboards from the community
          </p>
        </div>
      </header>

      {successMessage && <div className={styles.success}>{successMessage}</div>}

      <TemplateGallery onInstall={handleInstall} />
    </main>
  );
}
