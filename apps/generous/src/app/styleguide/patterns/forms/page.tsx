"use client";

import { Button, Checkbox, Form, Input, Label, RadioGroup, Switch } from "@generous/ui";
import styles from "./page.module.css";

export default function FormPatternsPage() {
  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>Form Patterns</h1>
        <p className={styles.description}>
          Best practices and patterns for building accessible, user-friendly forms. These patterns
          ensure consistency and good UX across your application.
        </p>
      </header>

      {/* Basic Form Layout */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Basic Form Layout</h2>
        <p className={styles.sectionDescription}>
          A simple form with stacked fields and action buttons.
        </p>
        <div className={styles.showcase}>
          <Form.Root style={{ width: "100%", maxWidth: "400px" }}>
            <Form.Field name="email" required>
              <Form.Label>Email</Form.Label>
              <Form.Control>
                <Input type="email" placeholder="you@example.com" />
              </Form.Control>
            </Form.Field>
            <Form.Field name="password" required>
              <Form.Label>Password</Form.Label>
              <Form.Control>
                <Input type="password" placeholder="Enter password" />
              </Form.Control>
            </Form.Field>
            <Form.Actions>
              <Button fullWidth>Sign In</Button>
            </Form.Actions>
          </Form.Root>
        </div>
      </section>

      {/* Multi-Column Form */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Multi-Column Form</h2>
        <p className={styles.sectionDescription}>
          Use grid layouts for forms with related fields that can be grouped.
        </p>
        <div className={styles.showcase}>
          <Form.Root style={{ width: "100%", maxWidth: "600px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
              <Form.Field name="firstName" required>
                <Form.Label>First Name</Form.Label>
                <Form.Control>
                  <Input placeholder="John" />
                </Form.Control>
              </Form.Field>
              <Form.Field name="lastName" required>
                <Form.Label>Last Name</Form.Label>
                <Form.Control>
                  <Input placeholder="Doe" />
                </Form.Control>
              </Form.Field>
            </div>
            <Form.Field name="email" required>
              <Form.Label>Email</Form.Label>
              <Form.Control>
                <Input type="email" placeholder="john.doe@example.com" />
              </Form.Control>
            </Form.Field>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "var(--space-4)" }}>
              <Form.Field name="city">
                <Form.Label>City</Form.Label>
                <Form.Control>
                  <Input placeholder="New York" />
                </Form.Control>
              </Form.Field>
              <Form.Field name="zip">
                <Form.Label>ZIP Code</Form.Label>
                <Form.Control>
                  <Input placeholder="10001" />
                </Form.Control>
              </Form.Field>
            </div>
            <Form.Actions align="end">
              <Button variant="outline">Cancel</Button>
              <Button>Save</Button>
            </Form.Actions>
          </Form.Root>
        </div>
      </section>

      {/* Sectioned Form */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Sectioned Form</h2>
        <p className={styles.sectionDescription}>
          Organize complex forms into logical sections with fieldsets.
        </p>
        <div className={styles.showcase}>
          <Form.Root style={{ width: "100%", maxWidth: "500px" }}>
            <Form.Fieldset>
              <Form.Legend>Personal Information</Form.Legend>
              <Form.Field name="fullName" required>
                <Form.Label>Full Name</Form.Label>
                <Form.Control>
                  <Input placeholder="Enter your name" />
                </Form.Control>
              </Form.Field>
              <Form.Field name="email" required>
                <Form.Label>Email</Form.Label>
                <Form.Control>
                  <Input type="email" placeholder="you@example.com" />
                </Form.Control>
              </Form.Field>
            </Form.Fieldset>

            <Form.Divider />

            <Form.Fieldset>
              <Form.Legend>Preferences</Form.Legend>
              <Form.Field>
                <Form.Label>Theme</Form.Label>
                <Form.Control>
                  <RadioGroup.Root defaultValue="system" orientation="horizontal">
                    <RadioGroup.Item value="light">Light</RadioGroup.Item>
                    <RadioGroup.Item value="dark">Dark</RadioGroup.Item>
                    <RadioGroup.Item value="system">System</RadioGroup.Item>
                  </RadioGroup.Root>
                </Form.Control>
              </Form.Field>
              <Form.Field>
                <div
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                >
                  <div>
                    <Form.Label style={{ marginBottom: 0 }}>Notifications</Form.Label>
                    <Form.Description>Receive email updates</Form.Description>
                  </div>
                  <Switch aria-label="Notifications" />
                </div>
              </Form.Field>
            </Form.Fieldset>

            <Form.Actions>
              <Button fullWidth>Save Changes</Button>
            </Form.Actions>
          </Form.Root>
        </div>
      </section>

      {/* Inline Validation */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Inline Validation</h2>
        <p className={styles.sectionDescription}>
          Show validation messages inline as users complete fields.
        </p>
        <div className={styles.statesGrid}>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>Error State</p>
            <Form.Field hasError>
              <Form.Label>Email</Form.Label>
              <Form.Control>
                <Input type="email" defaultValue="invalid-email" error />
              </Form.Control>
              <Form.Message variant="error">Please enter a valid email</Form.Message>
            </Form.Field>
          </div>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>Success State</p>
            <Form.Field>
              <Form.Label>Username</Form.Label>
              <Form.Control>
                <Input defaultValue="john_doe" />
              </Form.Control>
              <Form.Message variant="success">Username is available</Form.Message>
            </Form.Field>
          </div>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>Warning State</p>
            <Form.Field>
              <Form.Label>Password</Form.Label>
              <Form.Control>
                <Input type="password" defaultValue="weak" />
              </Form.Control>
              <Form.Message variant="warning">Password is weak</Form.Message>
            </Form.Field>
          </div>
        </div>
      </section>

      {/* Settings Pattern */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Settings Pattern</h2>
        <p className={styles.sectionDescription}>
          Toggle switches with labels and descriptions for settings pages.
        </p>
        <div className={styles.showcase}>
          <div
            style={{
              width: "100%",
              maxWidth: "500px",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-1)",
            }}
          >
            {[
              {
                label: "Email notifications",
                description: "Receive updates about your account",
                defaultChecked: true,
              },
              {
                label: "Marketing emails",
                description: "Receive offers and promotions",
                defaultChecked: false,
              },
              {
                label: "Security alerts",
                description: "Important alerts about your security",
                defaultChecked: true,
              },
            ].map((setting) => (
              <div
                key={setting.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "var(--space-4)",
                  borderBottom: "1px solid var(--border-subtle)",
                }}
              >
                <div>
                  <p style={{ margin: 0, fontWeight: 500 }}>{setting.label}</p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      color: "var(--text-tertiary)",
                      fontSize: "var(--text-sm)",
                    }}
                  >
                    {setting.description}
                  </p>
                </div>
                <Switch defaultChecked={setting.defaultChecked} aria-label={setting.label} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search Form */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Search Form</h2>
        <p className={styles.sectionDescription}>Search inputs with optional filters.</p>
        <div className={styles.showcase}>
          <div style={{ display: "flex", gap: "var(--space-3)", width: "100%", maxWidth: "600px" }}>
            <Input
              startAdornment={
                <svg
                  aria-hidden="true"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              }
              placeholder="Search..."
              style={{ flex: 1 }}
            />
            <select
              style={{
                width: "150px",
                padding: "8px 12px",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-md)",
                background: "var(--surface-secondary)",
                color: "var(--text-primary)",
              }}
            >
              <option value="all">All</option>
              <option value="docs">Docs</option>
              <option value="components">Components</option>
            </select>
            <Button>Search</Button>
          </div>
        </div>
      </section>

      {/* Checkbox Groups */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Checkbox Groups</h2>
        <p className={styles.sectionDescription}>
          Use checkbox groups for multiple selections with clear labels.
        </p>
        <div className={styles.showcase}>
          <Form.Root style={{ width: "100%", maxWidth: "400px" }}>
            <Form.Fieldset>
              <Form.Legend>Select your interests</Form.Legend>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                {["Design", "Development", "Marketing", "Product Management", "Data Science"].map(
                  (interest) => (
                    <div
                      key={interest}
                      style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}
                    >
                      <Checkbox
                        id={interest.toLowerCase().replace(" ", "-")}
                        aria-label={interest}
                      />
                      <Label htmlFor={interest.toLowerCase().replace(" ", "-")}>{interest}</Label>
                    </div>
                  ),
                )}
              </div>
            </Form.Fieldset>
          </Form.Root>
        </div>
      </section>

      {/* Field Guidelines */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Field Guidelines</h2>
        <div className={styles.statesGrid}>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel} style={{ color: "var(--color-green-500)" }}>
              Do
            </p>
            <ul
              style={{
                color: "var(--text-secondary)",
                fontSize: "var(--text-sm)",
                margin: 0,
                paddingLeft: "var(--space-4)",
              }}
            >
              <li>Use clear, concise labels</li>
              <li>Mark required fields explicitly</li>
              <li>Provide helpful placeholder text</li>
              <li>Show validation inline</li>
              <li>Group related fields together</li>
            </ul>
          </div>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel} style={{ color: "var(--color-red-500)" }}>
              Don&apos;t
            </p>
            <ul
              style={{
                color: "var(--text-secondary)",
                fontSize: "var(--text-sm)",
                margin: 0,
                paddingLeft: "var(--space-4)",
              }}
            >
              <li>Use placeholder as the only label</li>
              <li>Ask for unnecessary information</li>
              <li>Use unclear error messages</li>
              <li>Validate too aggressively</li>
              <li>Disable submit without explanation</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Accessibility */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Accessibility Checklist</h2>
        <ul style={{ color: "var(--text-secondary)", lineHeight: 2 }}>
          <li>Every input has an associated label (even if visually hidden)</li>
          <li>Required fields are marked with aria-required</li>
          <li>Error messages are linked with aria-describedby</li>
          <li>Focus order follows visual layout</li>
          <li>Validation doesn&apos;t rely on color alone</li>
          <li>Form can be submitted with keyboard</li>
          <li>Error summary is announced on submit</li>
        </ul>
      </section>
    </div>
  );
}
