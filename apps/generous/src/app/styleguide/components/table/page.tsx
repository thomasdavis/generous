"use client";

import { Badge, Table } from "@generous/ui";
import styles from "./page.module.css";

const invoices = [
  { id: "INV001", status: "Paid", method: "Credit Card", amount: "$250.00" },
  { id: "INV002", status: "Pending", method: "PayPal", amount: "$150.00" },
  { id: "INV003", status: "Unpaid", method: "Bank Transfer", amount: "$350.00" },
  { id: "INV004", status: "Paid", method: "Credit Card", amount: "$450.00" },
  { id: "INV005", status: "Paid", method: "PayPal", amount: "$550.00" },
];

const users = [
  { name: "Alex Johnson", email: "alex@example.com", role: "Admin" },
  { name: "Sarah Smith", email: "sarah@example.com", role: "Editor" },
  { name: "Mike Brown", email: "mike@example.com", role: "Viewer" },
];

export default function TablePage() {
  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>Table</h1>
        <p className={styles.description}>
          Tables display sets of data organized in rows and columns. They make it easy to scan,
          compare, and analyze information.
        </p>
      </header>

      {/* Interactive Demo */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Interactive Demo</h2>
        <div className={styles.showcase}>
          <div style={{ width: "100%" }}>
            <Table.Root>
              <Table.Caption>A list of your recent invoices.</Table.Caption>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Invoice</Table.Head>
                  <Table.Head>Status</Table.Head>
                  <Table.Head>Method</Table.Head>
                  <Table.Head style={{ textAlign: "right" }}>Amount</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {invoices.map((invoice) => (
                  <Table.Row key={invoice.id}>
                    <Table.Cell style={{ fontWeight: 500 }}>{invoice.id}</Table.Cell>
                    <Table.Cell>
                      <Badge
                        variant={
                          invoice.status === "Paid"
                            ? "success"
                            : invoice.status === "Pending"
                              ? "warning"
                              : "error"
                        }
                      >
                        {invoice.status}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>{invoice.method}</Table.Cell>
                    <Table.Cell style={{ textAlign: "right" }}>{invoice.amount}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
              <Table.Footer>
                <Table.Row>
                  <Table.Cell colSpan={3}>Total</Table.Cell>
                  <Table.Cell style={{ textAlign: "right", fontWeight: 600 }}>$1,750.00</Table.Cell>
                </Table.Row>
              </Table.Footer>
            </Table.Root>
          </div>
        </div>
      </section>

      {/* Basic Table */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Basic Table</h2>
        <p className={styles.sectionDescription}>A simple table with header and body sections.</p>
        <div className={styles.showcase}>
          <div style={{ width: "100%" }}>
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Name</Table.Head>
                  <Table.Head>Email</Table.Head>
                  <Table.Head>Role</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {users.map((user) => (
                  <Table.Row key={user.email}>
                    <Table.Cell>{user.name}</Table.Cell>
                    <Table.Cell>{user.email}</Table.Cell>
                    <Table.Cell>{user.role}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </div>
        </div>
      </section>

      {/* Table Composition */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Composition</h2>
        <p className={styles.sectionDescription}>
          Tables are composed of semantic subcomponents for accessibility.
        </p>
        <div className={styles.statesGrid}>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>Table.Root</p>
            <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>
              Wrapper with horizontal scroll support
            </p>
          </div>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>Table.Header</p>
            <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>
              Contains column headers (thead)
            </p>
          </div>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>Table.Body</p>
            <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>
              Contains data rows (tbody)
            </p>
          </div>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>Table.Footer</p>
            <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>
              Contains summary rows (tfoot)
            </p>
          </div>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>Table.Row</p>
            <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>
              Table row container (tr)
            </p>
          </div>
          <div className={styles.stateCard}>
            <p className={styles.stateLabel}>Table.Head / Table.Cell</p>
            <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>
              Header cell (th) / Data cell (td)
            </p>
          </div>
        </div>
      </section>

      {/* Usage */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Usage</h2>
        <div className={styles.codeBlock}>
          <pre className={styles.code}>
            <span className={styles.codeKeyword}>import</span> {"{ "}
            <span className={styles.codeComponent}>Table</span>
            {" }"} <span className={styles.codeKeyword}>from</span>{" "}
            <span className={styles.codeString}>&quot;@generous/ui&quot;</span>;{"\n\n"}
            <span className={styles.codeKeyword}>function</span> Example() {"{\n"}
            {"  "}
            <span className={styles.codeKeyword}>return</span> ({"\n"}
            {"    "}&lt;<span className={styles.codeComponent}>Table.Root</span>&gt;{"\n"}
            {"      "}&lt;<span className={styles.codeComponent}>Table.Header</span>&gt;{"\n"}
            {"        "}&lt;<span className={styles.codeComponent}>Table.Row</span>&gt;{"\n"}
            {"          "}&lt;<span className={styles.codeComponent}>Table.Head</span>&gt;Name&lt;/
            <span className={styles.codeComponent}>Table.Head</span>&gt;{"\n"}
            {"          "}&lt;<span className={styles.codeComponent}>Table.Head</span>&gt;Email&lt;/
            <span className={styles.codeComponent}>Table.Head</span>&gt;{"\n"}
            {"        "}&lt;/<span className={styles.codeComponent}>Table.Row</span>&gt;{"\n"}
            {"      "}&lt;/<span className={styles.codeComponent}>Table.Header</span>&gt;{"\n"}
            {"      "}&lt;<span className={styles.codeComponent}>Table.Body</span>&gt;{"\n"}
            {"        "}&lt;<span className={styles.codeComponent}>Table.Row</span>&gt;{"\n"}
            {"          "}&lt;<span className={styles.codeComponent}>Table.Cell</span>&gt;John&lt;/
            <span className={styles.codeComponent}>Table.Cell</span>&gt;{"\n"}
            {"          "}&lt;<span className={styles.codeComponent}>Table.Cell</span>
            &gt;john@email.com&lt;/<span className={styles.codeComponent}>Table.Cell</span>&gt;
            {"\n"}
            {"        "}&lt;/<span className={styles.codeComponent}>Table.Row</span>&gt;{"\n"}
            {"      "}&lt;/<span className={styles.codeComponent}>Table.Body</span>&gt;{"\n"}
            {"    "}&lt;/<span className={styles.codeComponent}>Table.Root</span>&gt;{"\n"}
            {"  "});{"\n"}
            {"}"}
          </pre>
        </div>
      </section>

      {/* Props */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Subcomponents</h2>
        <table className={styles.propsTable}>
          <thead>
            <tr>
              <th>Component</th>
              <th>Element</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Table.Root</td>
              <td className={styles.propType}>table</td>
              <td>Main table wrapper with scroll container</td>
            </tr>
            <tr>
              <td>Table.Header</td>
              <td className={styles.propType}>thead</td>
              <td>Table header section</td>
            </tr>
            <tr>
              <td>Table.Body</td>
              <td className={styles.propType}>tbody</td>
              <td>Table body section</td>
            </tr>
            <tr>
              <td>Table.Footer</td>
              <td className={styles.propType}>tfoot</td>
              <td>Table footer section</td>
            </tr>
            <tr>
              <td>Table.Row</td>
              <td className={styles.propType}>tr</td>
              <td>Table row</td>
            </tr>
            <tr>
              <td>Table.Head</td>
              <td className={styles.propType}>th</td>
              <td>Header cell</td>
            </tr>
            <tr>
              <td>Table.Cell</td>
              <td className={styles.propType}>td</td>
              <td>Data cell</td>
            </tr>
            <tr>
              <td>Table.Caption</td>
              <td className={styles.propType}>caption</td>
              <td>Table caption for accessibility</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Accessibility */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Accessibility</h2>
        <ul style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
          <li>Uses semantic table elements (table, thead, tbody, th, td)</li>
          <li>Caption provides context for screen readers</li>
          <li>Header cells are properly associated with data cells</li>
          <li>Supports keyboard navigation between cells</li>
          <li>Horizontal scroll container maintains accessibility</li>
        </ul>
      </section>

      {/* Best Practices */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Best Practices</h2>
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
              <li>Use tables for tabular data</li>
              <li>Include a caption for context</li>
              <li>Align numbers to the right</li>
              <li>Keep columns focused on single data types</li>
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
              <li>Use tables for layout purposes</li>
              <li>Hide important columns on mobile</li>
              <li>Include too many columns</li>
              <li>Use inconsistent row heights</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
