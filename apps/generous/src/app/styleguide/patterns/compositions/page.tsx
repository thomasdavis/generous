"use client";

import { Avatar, Badge, Button, Card, Checkbox, Input } from "@generous/ui";
import styles from "./page.module.css";

export default function CompositionPatternsPage() {
  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>Composition Patterns</h1>
        <p className={styles.description}>
          Common UI compositions combining multiple components. These patterns demonstrate how to
          build complex interfaces from atomic components.
        </p>
      </header>

      {/* Header Bar */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Header Bar</h2>
        <p className={styles.sectionDescription}>
          Application header with logo, navigation, and user controls.
        </p>
        <div className={styles.showcase}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "var(--space-4)",
              background: "var(--surface-primary)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-6)" }}>
              <div style={{ fontWeight: 700, fontSize: "var(--text-lg)" }}>Logo</div>
              <nav style={{ display: "flex", gap: "var(--space-4)" }}>
                <span style={{ color: "var(--text-primary)", cursor: "pointer", fontWeight: 500 }}>
                  Dashboard
                </span>
                <span style={{ color: "var(--text-secondary)", cursor: "pointer" }}>Projects</span>
                <span style={{ color: "var(--text-secondary)", cursor: "pointer" }}>Settings</span>
              </nav>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
              <Button variant="ghost" size="sm" aria-label="Notifications">
                <svg
                  aria-hidden="true"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </Button>
              <Avatar.Root>
                <Avatar.Fallback>JD</Avatar.Fallback>
              </Avatar.Root>
            </div>
          </div>
        </div>
      </section>

      {/* User Card */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>User Card</h2>
        <p className={styles.sectionDescription}>Profile card with avatar, details, and actions.</p>
        <div className={styles.showcase}>
          <Card.Root style={{ width: "100%", maxWidth: "350px" }}>
            <Card.Header>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                <Avatar.Root size="lg">
                  <Avatar.Fallback>SJ</Avatar.Fallback>
                </Avatar.Root>
                <div>
                  <Card.Title style={{ marginBottom: "2px" }}>Sarah Johnson</Card.Title>
                  <p
                    style={{ margin: 0, color: "var(--text-tertiary)", fontSize: "var(--text-sm)" }}
                  >
                    sarah@company.com
                  </p>
                </div>
              </div>
            </Card.Header>
            <Card.Content>
              <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                <Badge variant="success">Active</Badge>
                <Badge>Admin</Badge>
                <Badge variant="accent">Premium</Badge>
              </div>
            </Card.Content>
            <Card.Footer>
              <Button variant="outline" size="sm">
                View Profile
              </Button>
              <Button size="sm">Message</Button>
            </Card.Footer>
          </Card.Root>
        </div>
      </section>

      {/* Stat Cards */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Stat Cards</h2>
        <p className={styles.sectionDescription}>Dashboard statistics with metrics and trends.</p>
        <div className={styles.showcase}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "var(--space-4)",
              width: "100%",
            }}
          >
            {[
              { label: "Total Revenue", value: "$45,231", change: "+20.1%", trend: "up" },
              { label: "Active Users", value: "2,345", change: "+10.5%", trend: "up" },
              { label: "Conversion", value: "3.2%", change: "-2.4%", trend: "down" },
              { label: "Avg. Session", value: "4m 32s", change: "+12%", trend: "up" },
            ].map((stat) => (
              <Card.Root key={stat.label}>
                <Card.Content>
                  <p
                    style={{
                      margin: "0 0 var(--space-1)",
                      fontSize: "var(--text-sm)",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    {stat.label}
                  </p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-2)" }}>
                    <span style={{ fontSize: "var(--text-2xl)", fontWeight: 600 }}>
                      {stat.value}
                    </span>
                    <span
                      style={{
                        fontSize: "var(--text-sm)",
                        color:
                          stat.trend === "up" ? "var(--color-green-500)" : "var(--color-red-500)",
                      }}
                    >
                      {stat.change}
                    </span>
                  </div>
                </Card.Content>
              </Card.Root>
            ))}
          </div>
        </div>
      </section>

      {/* List Item */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>List Items</h2>
        <p className={styles.sectionDescription}>Selectable list items with icons and actions.</p>
        <div className={styles.showcase}>
          <div
            style={{
              width: "100%",
              maxWidth: "500px",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
            }}
          >
            {[
              { title: "Design System", description: "Update color tokens", status: "In Progress" },
              {
                title: "API Integration",
                description: "Connect payment gateway",
                status: "Review",
              },
              { title: "Documentation", description: "Write component guides", status: "Complete" },
            ].map((item, i) => (
              <div
                key={item.title}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "var(--space-4)",
                  borderBottom: i < 2 ? "1px solid var(--border-subtle)" : "none",
                  background: "var(--surface-primary)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                  <Checkbox aria-label={`Select ${item.title}`} />
                  <div>
                    <p style={{ margin: 0, fontWeight: 500 }}>{item.title}</p>
                    <p
                      style={{
                        margin: "2px 0 0",
                        fontSize: "var(--text-sm)",
                        color: "var(--text-tertiary)",
                      }}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    item.status === "Complete"
                      ? "success"
                      : item.status === "Review"
                        ? "warning"
                        : "default"
                  }
                >
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Empty State */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Empty State</h2>
        <p className={styles.sectionDescription}>Placeholder for empty data sets with guidance.</p>
        <div className={styles.showcase}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "var(--space-12)",
              border: "2px dashed var(--border-default)",
              borderRadius: "var(--radius-lg)",
              width: "100%",
              maxWidth: "500px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "var(--radius-full)",
                background: "var(--surface-secondary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "var(--space-4)",
              }}
            >
              <svg
                aria-hidden="true"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--text-tertiary)"
                strokeWidth="2"
              >
                <path d="M3 3h18v18H3zM12 8v8M8 12h8" />
              </svg>
            </div>
            <h3 style={{ margin: "0 0 var(--space-2)", fontWeight: 600 }}>No projects yet</h3>
            <p
              style={{
                margin: "0 0 var(--space-4)",
                color: "var(--text-tertiary)",
                maxWidth: "300px",
              }}
            >
              Get started by creating your first project. It only takes a minute.
            </p>
            <Button>Create Project</Button>
          </div>
        </div>
      </section>

      {/* Comment Thread */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Comment Thread</h2>
        <p className={styles.sectionDescription}>Discussion thread with nested comments.</p>
        <div className={styles.showcase}>
          <div
            style={{
              width: "100%",
              maxWidth: "500px",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-4)",
            }}
          >
            {[
              {
                name: "Alex Chen",
                time: "2 hours ago",
                content: "Great work on the new design! The color choices are perfect.",
              },
              {
                name: "Sarah Kim",
                time: "1 hour ago",
                content: "Thanks! I spent a lot of time on the accessibility contrast ratios.",
              },
            ].map((comment, i) => (
              <div key={i} style={{ display: "flex", gap: "var(--space-3)" }}>
                <Avatar.Root size="sm">
                  <Avatar.Fallback>
                    {comment.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </Avatar.Fallback>
                </Avatar.Root>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-2)" }}>
                    <span style={{ fontWeight: 500 }}>{comment.name}</span>
                    <span style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)" }}>
                      {comment.time}
                    </span>
                  </div>
                  <p style={{ margin: "var(--space-1) 0 0", color: "var(--text-secondary)" }}>
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
            <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
              <Avatar.Root size="sm">
                <Avatar.Fallback>ME</Avatar.Fallback>
              </Avatar.Root>
              <div style={{ flex: 1, display: "flex", gap: "var(--space-2)" }}>
                <Input placeholder="Add a comment..." style={{ flex: 1 }} />
                <Button size="sm">Post</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Card */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Pricing Card</h2>
        <p className={styles.sectionDescription}>Subscription tier with features and CTA.</p>
        <div className={styles.showcase}>
          <Card.Root style={{ width: "100%", maxWidth: "320px" }} variant="outline">
            <Card.Header>
              <Badge variant="accent" style={{ marginBottom: "var(--space-2)" }}>
                Most Popular
              </Badge>
              <Card.Title>Pro Plan</Card.Title>
              <Card.Description>Perfect for growing teams</Card.Description>
            </Card.Header>
            <Card.Content>
              <div style={{ marginBottom: "var(--space-4)" }}>
                <span style={{ fontSize: "var(--text-3xl)", fontWeight: 700 }}>$29</span>
                <span style={{ color: "var(--text-tertiary)" }}>/month</span>
              </div>
              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-2)",
                }}
              >
                {[
                  "Unlimited projects",
                  "Advanced analytics",
                  "Priority support",
                  "Custom integrations",
                  "Team collaboration",
                ].map((feature) => (
                  <li
                    key={feature}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-2)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <svg
                      aria-hidden="true"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--color-green-500)"
                      strokeWidth="2"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </Card.Content>
            <Card.Footer>
              <Button fullWidth>Get Started</Button>
            </Card.Footer>
          </Card.Root>
        </div>
      </section>

      {/* Notification */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Notification Item</h2>
        <p className={styles.sectionDescription}>Notification list item with read/unread states.</p>
        <div className={styles.showcase}>
          <div
            style={{ width: "100%", maxWidth: "400px", display: "flex", flexDirection: "column" }}
          >
            {[
              {
                title: "New comment",
                desc: "Sarah mentioned you in a comment",
                time: "5m ago",
                unread: true,
              },
              {
                title: "Task assigned",
                desc: 'You were assigned to "Update docs"',
                time: "1h ago",
                unread: true,
              },
              {
                title: "Welcome!",
                desc: "Get started with our quick guide",
                time: "2d ago",
                unread: false,
              },
            ].map((notif, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "var(--space-3)",
                  padding: "var(--space-3)",
                  background: notif.unread ? "var(--surface-secondary)" : "transparent",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "var(--radius-full)",
                    background: notif.unread ? "var(--accent-primary)" : "transparent",
                    marginTop: "6px",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>{notif.title}</span>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
                      {notif.time}
                    </span>
                  </div>
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: "var(--text-sm)",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    {notif.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Composition Guidelines</h2>
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
              <li>Compose from atomic components</li>
              <li>Maintain consistent spacing</li>
              <li>Use semantic color tokens</li>
              <li>Consider mobile layouts</li>
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
              <li>Create one-off component styles</li>
              <li>Mix different visual systems</li>
              <li>Ignore accessibility in layouts</li>
              <li>Overcrowd with information</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
