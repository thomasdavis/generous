"use client";

import { Button, Dialog, Form, Input, Table } from "@generous/ui";
import { useCallback, useEffect, useState } from "react";
import styles from "./page.module.css";

interface EnvVar {
  id: string;
  key: string;
  value: string;
}

const STORAGE_KEY = "generous-env-vars";

function generateId(): string {
  return `env-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadEnvVars(): EnvVar[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveEnvVars(vars: EnvVar[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vars));
}

function parseEnvContent(content: string): Array<{ key: string; value: string }> {
  const lines = content.split("\n");
  const result: Array<{ key: string; value: string }> = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith("#")) continue;

    // Match KEY=VALUE or KEY="VALUE" or KEY='VALUE'
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (match && match[1] !== undefined) {
      const key = match[1];
      let value = match[2] ?? "";

      // Remove surrounding quotes if present
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      result.push({ key, value });
    }
  }

  return result;
}

export default function SettingsPage() {
  const [envVars, setEnvVars] = useState<EnvVar[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Form state for adding/editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formKey, setFormKey] = useState("");
  const [formValue, setFormValue] = useState("");

  // Bulk import state
  const [envContent, setEnvContent] = useState("");
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importPreview, setImportPreview] = useState<Array<{ key: string; value: string }>>([]);

  // Load from localStorage on mount
  useEffect(() => {
    setEnvVars(loadEnvVars());
    setIsLoaded(true);
  }, []);

  // Save to localStorage when envVars change
  useEffect(() => {
    if (isLoaded) {
      saveEnvVars(envVars);
    }
  }, [envVars, isLoaded]);

  const handleAdd = useCallback(() => {
    if (!formKey.trim()) return;

    const newVar: EnvVar = {
      id: generateId(),
      key: formKey.trim(),
      value: formValue,
    };

    setEnvVars((prev) => [...prev, newVar]);
    setFormKey("");
    setFormValue("");
  }, [formKey, formValue]);

  const handleEdit = useCallback((envVar: EnvVar) => {
    setEditingId(envVar.id);
    setFormKey(envVar.key);
    setFormValue(envVar.value);
  }, []);

  const handleUpdate = useCallback(() => {
    if (!editingId || !formKey.trim()) return;

    setEnvVars((prev) =>
      prev.map((v) => (v.id === editingId ? { ...v, key: formKey.trim(), value: formValue } : v)),
    );
    setEditingId(null);
    setFormKey("");
    setFormValue("");
  }, [editingId, formKey, formValue]);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setFormKey("");
    setFormValue("");
  }, []);

  const handleDelete = useCallback((id: string) => {
    setEnvVars((prev) => prev.filter((v) => v.id !== id));
  }, []);

  const handleEnvContentChange = useCallback((content: string) => {
    setEnvContent(content);
    setImportPreview(parseEnvContent(content));
  }, []);

  const handleImport = useCallback(() => {
    const parsed = parseEnvContent(envContent);
    const newVars: EnvVar[] = parsed.map(({ key, value }) => ({
      id: generateId(),
      key,
      value,
    }));

    setEnvVars((prev) => {
      // Merge: update existing keys, add new ones
      const existingKeys = new Map(prev.map((v) => [v.key, v]));
      const result = [...prev];

      for (const newVar of newVars) {
        const existing = existingKeys.get(newVar.key);
        if (existing) {
          // Update existing
          const idx = result.findIndex((v) => v.id === existing.id);
          if (idx !== -1) {
            result[idx] = { ...existing, value: newVar.value };
          }
        } else {
          // Add new
          result.push(newVar);
        }
      }

      return result;
    });

    setEnvContent("");
    setImportPreview([]);
    setShowImportDialog(false);
  }, [envContent]);

  const handleExportEnv = useCallback(() => {
    const content = envVars.map((v) => `${v.key}=${v.value}`).join("\n");
    navigator.clipboard.writeText(content);
  }, [envVars]);

  if (!isLoaded) {
    return (
      <main className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Environment Variables</h1>
          <p className={styles.description}>
            Manage environment keys stored in your browser's local storage.
          </p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="outline" size="sm" onClick={() => setShowImportDialog(true)}>
            Import .env
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportEnv}
            disabled={envVars.length === 0}
          >
            Export .env
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <a href="/">Back to Dashboard</a>
          </Button>
        </div>
      </div>

      <div className={styles.content}>
        {/* Add/Edit Form */}
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>{editingId ? "Edit Variable" : "Add Variable"}</h2>
          <Form.Root
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              editingId ? handleUpdate() : handleAdd();
            }}
          >
            <div className={styles.formFields}>
              <Form.Field name="key">
                <Form.Label>Key</Form.Label>
                <Form.Control>
                  <Input
                    value={formKey}
                    onChange={(e) => setFormKey(e.target.value)}
                    placeholder="API_KEY"
                    autoComplete="off"
                  />
                </Form.Control>
              </Form.Field>
              <Form.Field name="value">
                <Form.Label>Value</Form.Label>
                <Form.Control>
                  <Input
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    placeholder="your-api-key-here"
                    autoComplete="off"
                  />
                </Form.Control>
              </Form.Field>
            </div>
            <Form.Actions>
              {editingId && (
                <Button type="button" variant="ghost" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={!formKey.trim()}>
                {editingId ? "Update" : "Add"}
              </Button>
            </Form.Actions>
          </Form.Root>
        </div>

        {/* Table */}
        <div className={styles.tableCard}>
          <h2 className={styles.tableTitle}>
            Stored Variables
            <span className={styles.count}>{envVars.length}</span>
          </h2>

          {envVars.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No environment variables yet.</p>
              <p className={styles.emptyHint}>
                Add variables one at a time or import from a .env file.
              </p>
            </div>
          ) : (
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Key</Table.Head>
                  <Table.Head>Value</Table.Head>
                  <Table.Head style={{ width: 140, textAlign: "right" }}>Actions</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {envVars.map((envVar) => (
                  <Table.Row key={envVar.id}>
                    <Table.Cell>
                      <code className={styles.keyCell}>{envVar.key}</code>
                    </Table.Cell>
                    <Table.Cell>
                      <code className={styles.valueCell}>{envVar.value}</code>
                    </Table.Cell>
                    <Table.Cell style={{ textAlign: "right" }}>
                      <div className={styles.rowActions}>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(envVar)}>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(envVar.id)}>
                          Delete
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          )}
        </div>
      </div>

      {/* Import Dialog */}
      <Dialog.Root open={showImportDialog} onOpenChange={setShowImportDialog}>
        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Content className={styles.importDialog}>
            <Dialog.Header>
              <Dialog.Title>Import Environment Variables</Dialog.Title>
              <Dialog.Description>
                Paste your .env file content below. Existing keys will be updated.
              </Dialog.Description>
            </Dialog.Header>

            <div className={styles.importContent}>
              <textarea
                className={styles.envTextarea}
                value={envContent}
                onChange={(e) => handleEnvContentChange(e.target.value)}
                placeholder={`# Paste your .env content here\nAPI_KEY=your-key\nDATABASE_URL=postgres://...\nSECRET=mysecret`}
                rows={10}
              />

              {importPreview.length > 0 && (
                <div className={styles.preview}>
                  <h4 className={styles.previewTitle}>
                    Preview ({importPreview.length} variables)
                  </h4>
                  <div className={styles.previewList}>
                    {importPreview.map((item, idx) => (
                      <div key={idx} className={styles.previewItem}>
                        <code className={styles.previewKey}>{item.key}</code>
                        <span className={styles.previewEquals}>=</span>
                        <code className={styles.previewValue}>{item.value}</code>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Dialog.Footer>
              <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={importPreview.length === 0}>
                Import {importPreview.length > 0 && `(${importPreview.length})`}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </main>
  );
}
