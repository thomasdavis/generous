"use client";

import { Button, Input } from "@generous/ui";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import styles from "./page.module.css";

interface Workflow {
  id: string;
  name: string;
  description?: string;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const fetchWorkflows = useCallback(async () => {
    try {
      const response = await fetch("/api/workflows");
      if (response.ok) {
        const data = await response.json();
        setWorkflows(data.workflows);
      } else if (response.status === 401) {
        setError("Please sign in to view workflows");
      } else {
        setError("Failed to load workflows");
      }
    } catch (e) {
      setError("Failed to load workflows");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const handleCreate = async () => {
    if (!newName.trim()) return;

    try {
      const response = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });

      if (response.ok) {
        const workflow = await response.json();
        setWorkflows((prev) => [...prev, workflow]);
        setNewName("");
        setIsCreating(false);
        // Navigate to the new workflow
        window.location.href = `/workflows/${workflow.id}`;
      } else {
        setError("Failed to create workflow");
      }
    } catch (e) {
      setError("Failed to create workflow");
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this workflow?")) return;

    try {
      const response = await fetch(`/api/workflows/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setWorkflows((prev) => prev.filter((w) => w.id !== id));
      } else {
        setError("Failed to delete workflow");
      }
    } catch (e) {
      setError("Failed to delete workflow");
      console.error(e);
    }
  };

  if (isLoading) {
    return (
      <main className={styles.container}>
        <div className={styles.loading}>Loading workflows...</div>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Workflows</h1>
          <p className={styles.subtitle}>Automate tasks with visual dataflow workflows</p>
        </div>
        {!isCreating ? (
          <Button onClick={() => setIsCreating(true)}>New Workflow</Button>
        ) : (
          <div className={styles.createForm}>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Workflow name"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
                if (e.key === "Escape") setIsCreating(false);
              }}
            />
            <Button onClick={handleCreate}>Create</Button>
            <Button variant="ghost" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
          </div>
        )}
      </header>

      {error && <div className={styles.error}>{error}</div>}

      {workflows.length === 0 ? (
        <div className={styles.empty}>
          <h2>No workflows yet</h2>
          <p>Create your first workflow to automate tasks.</p>
          <Button onClick={() => setIsCreating(true)}>Create Workflow</Button>
        </div>
      ) : (
        <div className={styles.grid}>
          {workflows.map((workflow) => (
            <div key={workflow.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <Link href={`/workflows/${workflow.id}`} className={styles.cardTitle}>
                  {workflow.name}
                </Link>
                <span
                  className={`${styles.status} ${workflow.isEnabled ? styles.statusEnabled : styles.statusDisabled}`}
                >
                  {workflow.isEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
              {workflow.description && (
                <p className={styles.cardDescription}>{workflow.description}</p>
              )}
              <div className={styles.cardFooter}>
                <span className={styles.cardMeta}>
                  Updated {new Date(workflow.updatedAt).toLocaleDateString()}
                </span>
                <div className={styles.cardActions}>
                  <Link href={`/workflows/${workflow.id}`}>
                    <Button size="sm" variant="ghost">
                      Edit
                    </Button>
                  </Link>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(workflow.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
