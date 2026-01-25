"use client";

import { Button, Checkbox, Form, Input, RadioGroup } from "@generous/ui";
import { useState } from "react";
import styles from "./page.module.css";

export default function FormPage() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo validation
    setErrors({ email: "Please enter a valid email address" });
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>Form</h1>
        <p className={styles.description}>
          Form components provide structure, validation, and accessibility for building forms. They
          manage field state, error messages, and proper labeling.
        </p>
      </header>

      {/* Interactive Demo */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Interactive Demo</h2>
        <div className={styles.showcase}>
          <Form.Root onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "400px" }}>
            <Form.Field name="name" required>
              <Form.Label>Full Name</Form.Label>
              <Form.Control>
                <Input placeholder="John Doe" />
              </Form.Control>
              <Form.Description>Enter your first and last name</Form.Description>
            </Form.Field>

            <Form.Field name="email" required hasError={!!errors.email}>
              <Form.Label>Email</Form.Label>
              <Form.Control>
                <Input type="email" placeholder="you@example.com" error={!!errors.email} />
              </Form.Control>
              <Form.Message>{errors.email}</Form.Message>
            </Form.Field>

            <Form.Field name="bio">
              <Form.Label>Bio</Form.Label>
              <Form.Control>
                <textarea
                  placeholder="Tell us about yourself"
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid var(--border-default)",
                    borderRadius: "var(--radius-md)",
                    background: "var(--surface-secondary)",
                    color: "var(--text-primary)",
                    resize: "vertical",
                  }}
                />
              </Form.Control>
            </Form.Field>

            <Form.Actions align="end">
              <Button type="button" variant="outline">
                Cancel
              </Button>
              <Button type="submit">Submit</Button>
            </Form.Actions>
          </Form.Root>
        </div>
      </section>

      {/* Field States */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Field States</h2>
        <p className={styles.sectionDescription}>
          Form fields support various states for validation and interaction feedback.
        </p>
        <div className={styles.statesGrid}>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>Default</p>
            <Form.Field>
              <Form.Label>Label</Form.Label>
              <Form.Control>
                <Input placeholder="Enter value" />
              </Form.Control>
            </Form.Field>
          </div>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>Required</p>
            <Form.Field required>
              <Form.Label>Label</Form.Label>
              <Form.Control>
                <Input placeholder="Required field" />
              </Form.Control>
            </Form.Field>
          </div>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>With Description</p>
            <Form.Field>
              <Form.Label>Label</Form.Label>
              <Form.Control>
                <Input placeholder="Enter value" />
              </Form.Control>
              <Form.Description>Helper text for the field</Form.Description>
            </Form.Field>
          </div>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>Error</p>
            <Form.Field hasError>
              <Form.Label>Label</Form.Label>
              <Form.Control>
                <Input placeholder="Invalid value" error />
              </Form.Control>
              <Form.Message variant="error">This field has an error</Form.Message>
            </Form.Field>
          </div>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>Success</p>
            <Form.Field>
              <Form.Label>Label</Form.Label>
              <Form.Control>
                <Input defaultValue="Valid input" />
              </Form.Control>
              <Form.Message variant="success">Looks good!</Form.Message>
            </Form.Field>
          </div>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>Disabled</p>
            <Form.Field disabled>
              <Form.Label>Label</Form.Label>
              <Form.Control>
                <Input placeholder="Disabled" disabled />
              </Form.Control>
            </Form.Field>
          </div>
        </div>
      </section>

      {/* Horizontal Layout */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Horizontal Layout</h2>
        <p className={styles.sectionDescription}>
          Use horizontal orientation for inline label and input alignment.
        </p>
        <div className={styles.showcase}>
          <Form.Root style={{ width: "100%", maxWidth: "500px" }}>
            <Form.Field orientation="horizontal">
              <Form.Label style={{ minWidth: "120px" }}>Username</Form.Label>
              <Form.Control>
                <Input placeholder="Enter username" />
              </Form.Control>
            </Form.Field>
            <Form.Field orientation="horizontal">
              <Form.Label style={{ minWidth: "120px" }}>Email</Form.Label>
              <Form.Control>
                <Input type="email" placeholder="Enter email" />
              </Form.Control>
            </Form.Field>
          </Form.Root>
        </div>
      </section>

      {/* Fieldset */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Fieldset &amp; Legend</h2>
        <p className={styles.sectionDescription}>
          Group related fields with Fieldset and Legend for better organization.
        </p>
        <div className={styles.showcase}>
          <Form.Root style={{ width: "100%", maxWidth: "400px" }}>
            <Form.Fieldset>
              <Form.Legend>Contact Preferences</Form.Legend>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Checkbox id="email-pref" aria-label="Email" />
                  <label htmlFor="email-pref">Email</label>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Checkbox id="phone-pref" aria-label="Phone" />
                  <label htmlFor="phone-pref">Phone</label>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Checkbox id="mail-pref" aria-label="Mail" />
                  <label htmlFor="mail-pref">Mail</label>
                </div>
              </div>
            </Form.Fieldset>
          </Form.Root>
        </div>
      </section>

      {/* Complete Example */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Complete Example</h2>
        <p className={styles.sectionDescription}>
          A comprehensive form with various field types and validation.
        </p>
        <div className={styles.showcase}>
          <Form.Root style={{ width: "100%", maxWidth: "500px" }}>
            <Form.Field name="fullName" required>
              <Form.Label>Full Name</Form.Label>
              <Form.Control>
                <Input placeholder="Enter your name" />
              </Form.Control>
            </Form.Field>

            <Form.Field name="email" required>
              <Form.Label>Email Address</Form.Label>
              <Form.Control>
                <Input type="email" placeholder="you@example.com" />
              </Form.Control>
            </Form.Field>

            <Form.Field name="role">
              <Form.Label>Role</Form.Label>
              <Form.Control>
                <select
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid var(--border-default)",
                    borderRadius: "var(--radius-md)",
                    background: "var(--surface-secondary)",
                    color: "var(--text-primary)",
                  }}
                >
                  <option value="">Select a role</option>
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
              </Form.Control>
            </Form.Field>

            <Form.Fieldset>
              <Form.Legend>Notification Preferences</Form.Legend>
              <RadioGroup.Root defaultValue="all">
                <RadioGroup.Item value="all">All notifications</RadioGroup.Item>
                <RadioGroup.Item value="important">Important only</RadioGroup.Item>
                <RadioGroup.Item value="none">None</RadioGroup.Item>
              </RadioGroup.Root>
            </Form.Fieldset>

            <Form.Field>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Checkbox id="terms" aria-label="Accept terms" />
                <label htmlFor="terms" style={{ fontSize: "var(--text-sm)" }}>
                  I agree to the terms and conditions
                </label>
              </div>
            </Form.Field>

            <Form.Divider />

            <Form.Actions align="between">
              <Button type="button" variant="ghost">
                Reset
              </Button>
              <div style={{ display: "flex", gap: "8px" }}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
                <Button type="submit">Create Account</Button>
              </div>
            </Form.Actions>
          </Form.Root>
        </div>
      </section>

      {/* Usage */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Usage</h2>
        <div className={styles.codeBlock}>
          <pre className={styles.code}>
            <span className={styles.codeKeyword}>import</span> {"{ "}
            <span className={styles.codeComponent}>Form</span>,{" "}
            <span className={styles.codeComponent}>Input</span>
            {" }"} <span className={styles.codeKeyword}>from</span>{" "}
            <span className={styles.codeString}>&quot;@generous/ui&quot;</span>;{"\n\n"}
            <span className={styles.codeKeyword}>function</span> Example() {"{\n"}
            {"  "}
            <span className={styles.codeKeyword}>return</span> ({"\n"}
            {"    "}&lt;<span className={styles.codeComponent}>Form.Root</span> onSubmit=
            {"{handleSubmit}"}&gt;{"\n"}
            {"      "}&lt;<span className={styles.codeComponent}>Form.Field</span> name=
            <span className={styles.codeString}>&quot;email&quot;</span> required&gt;{"\n"}
            {"        "}&lt;<span className={styles.codeComponent}>Form.Label</span>&gt;Email&lt;/
            <span className={styles.codeComponent}>Form.Label</span>&gt;{"\n"}
            {"        "}&lt;<span className={styles.codeComponent}>Form.Control</span>&gt;{"\n"}
            {"          "}&lt;<span className={styles.codeComponent}>Input</span> type=
            <span className={styles.codeString}>&quot;email&quot;</span> /&gt;{"\n"}
            {"        "}&lt;/<span className={styles.codeComponent}>Form.Control</span>&gt;{"\n"}
            {"        "}&lt;<span className={styles.codeComponent}>Form.Message</span>&gt;
            {"{error}"}&lt;/<span className={styles.codeComponent}>Form.Message</span>&gt;{"\n"}
            {"      "}&lt;/<span className={styles.codeComponent}>Form.Field</span>&gt;{"\n"}
            {"      "}&lt;<span className={styles.codeComponent}>Form.Actions</span>&gt;{"\n"}
            {"        "}&lt;<span className={styles.codeComponent}>Button</span> type=
            <span className={styles.codeString}>&quot;submit&quot;</span>&gt;Submit&lt;/
            <span className={styles.codeComponent}>Button</span>&gt;{"\n"}
            {"      "}&lt;/<span className={styles.codeComponent}>Form.Actions</span>&gt;{"\n"}
            {"    "}&lt;/<span className={styles.codeComponent}>Form.Root</span>&gt;{"\n"}
            {"  "});{"\n"}
            {"}"}
          </pre>
        </div>
      </section>

      {/* Subcomponents */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Subcomponents</h2>
        <table className={styles.propsTable}>
          <thead>
            <tr>
              <th>Component</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Form.Root</td>
              <td>Form wrapper with disabled/loading states</td>
            </tr>
            <tr>
              <td>Form.Field</td>
              <td>Field container with context for label, control, messages</td>
            </tr>
            <tr>
              <td>Form.Label</td>
              <td>Accessible label linked to control</td>
            </tr>
            <tr>
              <td>Form.Control</td>
              <td>Wrapper for the form control element</td>
            </tr>
            <tr>
              <td>Form.Description</td>
              <td>Helper text below the control</td>
            </tr>
            <tr>
              <td>Form.Message</td>
              <td>Validation message with error/success/warning variants</td>
            </tr>
            <tr>
              <td>Form.Fieldset</td>
              <td>Group related fields</td>
            </tr>
            <tr>
              <td>Form.Legend</td>
              <td>Title for fieldset</td>
            </tr>
            <tr>
              <td>Form.Actions</td>
              <td>Container for form buttons with alignment options</td>
            </tr>
            <tr>
              <td>Form.Divider</td>
              <td>Visual separator between sections</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Accessibility */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Accessibility</h2>
        <ul style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
          <li>Labels are automatically linked to controls via htmlFor/id</li>
          <li>Error messages use aria-describedby for screen reader announcement</li>
          <li>Required fields indicated with aria-required</li>
          <li>Error state communicated via aria-invalid</li>
          <li>Form.Message with error variant uses role=&quot;alert&quot;</li>
        </ul>
      </section>
    </div>
  );
}
