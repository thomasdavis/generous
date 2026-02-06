"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { WorkflowEditor } from "@/components/workflow/WorkflowEditor";
import type { ToolNode, WorkflowDefinition, WorkflowEdge } from "@/lib/workflow/types";
import styles from "./page.module.css";

export default function WorkflowEditorPage() {
  const params = useParams();
  const id = params.id as string;

  const [workflow, setWorkflow] = useState<WorkflowDefinition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [lastResult, setLastResult] = useState<unknown>(null);

  // Fetch workflow
  useEffect(() => {
    async function fetchWorkflow() {
      try {
        const response = await fetch(`/api/workflows/${id}`);
        if (response.ok) {
          const data = await response.json();
          setWorkflow({
            id: data.id,
            name: data.name,
            description: data.description || undefined,
            nodes: (data.nodes || []) as ToolNode[],
            edges: (data.edges || []) as WorkflowEdge[],
            variables: Object.entries(data.variables || {}).map(([name, defaultValue]) => ({
              name,
              type: typeof defaultValue as "string" | "number" | "boolean" | "object" | "array",
              defaultValue,
            })),
          });
        } else if (response.status === 404) {
          setError("Workflow not found");
        } else if (response.status === 401) {
          setError("Please sign in to view this workflow");
        } else {
          setError("Failed to load workflow");
        }
      } catch (e) {
        setError("Failed to load workflow");
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }

    fetchWorkflow();
  }, [id]);

  // Save workflow
  const handleSave = useCallback(async () => {
    if (!workflow) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/workflows/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: workflow.name,
          description: workflow.description,
          nodes: workflow.nodes,
          edges: workflow.edges,
          variables: Object.fromEntries(workflow.variables.map((v) => [v.name, v.defaultValue])),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }
    } catch (e) {
      setError("Failed to save workflow");
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  }, [workflow, id]);

  // Run workflow
  const handleRun = useCallback(async () => {
    if (!workflow) return;

    setIsRunning(true);
    setLastResult(null);
    try {
      const response = await fetch(`/api/workflows/${id}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const result = await response.json();
      setLastResult(result);

      if (!response.ok) {
        setError(`Workflow failed: ${result.error}`);
      }
    } catch (e) {
      setError("Failed to run workflow");
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  }, [workflow, id]);

  // Update workflow
  const handleChange = useCallback((updated: WorkflowDefinition) => {
    setWorkflow(updated);
  }, []);

  if (isLoading) {
    return (
      <main className={styles.container}>
        <div className={styles.loading}>Loading workflow...</div>
      </main>
    );
  }

  if (error && !workflow) {
    return (
      <main className={styles.container}>
        <div className={styles.error}>
          <h1>{error}</h1>
          <a href="/workflows">Back to workflows</a>
        </div>
      </main>
    );
  }

  if (!workflow) {
    return null;
  }

  return (
    <main className={styles.container}>
      {error && (
        <div className={styles.errorBanner}>
          {error}
          <button type="button" onClick={() => setError(null)}>
            ×
          </button>
        </div>
      )}

      <WorkflowEditor
        workflow={workflow}
        onChange={handleChange}
        onSave={handleSave}
        onRun={handleRun}
        isSaving={isSaving}
        isRunning={isRunning}
      />

      {lastResult && (
        <div className={styles.resultPanel}>
          <div className={styles.resultHeader}>
            <h3>Last Execution Result</h3>
            <button type="button" onClick={() => setLastResult(null)}>
              ×
            </button>
          </div>
          <pre className={styles.resultJson}>{JSON.stringify(lastResult, null, 2)}</pre>
        </div>
      )}
    </main>
  );
}
