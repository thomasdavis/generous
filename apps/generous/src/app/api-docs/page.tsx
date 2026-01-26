import Link from "next/link";
import styles from "./page.module.css";

interface Endpoint {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  description: string;
  queryParams?: { name: string; type: string; description: string }[];
  bodyParams?: { name: string; type: string; required?: boolean; description: string }[];
  response?: string;
}

interface ApiSection {
  title: string;
  description: string;
  baseUrl: string;
  endpoints: Endpoint[];
}

const apiSections: ApiSection[] = [
  {
    title: "Pets",
    description: "Manage pets available for adoption",
    baseUrl: "/api/pets",
    endpoints: [
      {
        method: "GET",
        path: "/api/pets",
        description: "List all pets with optional filtering",
        queryParams: [
          {
            name: "status",
            type: "string",
            description: "Filter by status (available, pending, adopted)",
          },
          {
            name: "species",
            type: "string",
            description: "Filter by species (dog, cat, bird, etc.)",
          },
        ],
        response: "{ pets: Pet[], total: number }",
      },
      {
        method: "POST",
        path: "/api/pets",
        description: "Create a new pet listing",
        bodyParams: [
          { name: "name", type: "string", required: true, description: "Pet name" },
          {
            name: "species",
            type: "string",
            required: true,
            description: "Species (dog, cat, bird, etc.)",
          },
          { name: "price", type: "number", required: true, description: "Price in cents" },
          { name: "breed", type: "string", description: "Breed name" },
          { name: "age", type: "number", description: "Age in years" },
          { name: "status", type: "string", description: "Status (default: available)" },
          { name: "description", type: "string", description: "Pet description" },
          { name: "imageUrl", type: "string", description: "Image URL" },
        ],
        response: "Pet",
      },
      {
        method: "GET",
        path: "/api/pets/:id",
        description: "Get a specific pet by ID",
        response: "Pet",
      },
      {
        method: "PATCH",
        path: "/api/pets/:id",
        description: "Update a pet's information",
        bodyParams: [
          { name: "name", type: "string", description: "Pet name" },
          { name: "status", type: "string", description: "Pet status" },
          { name: "price", type: "number", description: "Price in cents" },
        ],
        response: "Pet",
      },
      {
        method: "DELETE",
        path: "/api/pets/:id",
        description: "Delete a pet listing",
        response: "{ success: true }",
      },
      {
        method: "GET",
        path: "/api/pets/search",
        description: "Search pets by name or description",
        queryParams: [{ name: "q", type: "string", description: "Search query" }],
        response: "{ pets: Pet[], total: number }",
      },
      {
        method: "GET",
        path: "/api/pets/stats",
        description: "Get pet statistics",
        response: "{ total, byStatus, bySpecies, averagePrice }",
      },
    ],
  },
  {
    title: "Customers",
    description: "Manage customer records",
    baseUrl: "/api/customers",
    endpoints: [
      {
        method: "GET",
        path: "/api/customers",
        description: "List all customers with pagination",
        queryParams: [
          { name: "search", type: "string", description: "Search by email" },
          { name: "limit", type: "number", description: "Results per page (default: 50)" },
          { name: "offset", type: "number", description: "Pagination offset" },
        ],
        response: "{ customers: Customer[], total, limit, offset }",
      },
      {
        method: "POST",
        path: "/api/customers",
        description: "Create a new customer",
        bodyParams: [
          { name: "firstName", type: "string", required: true, description: "First name" },
          { name: "lastName", type: "string", required: true, description: "Last name" },
          { name: "email", type: "string", required: true, description: "Email address" },
          { name: "phone", type: "string", description: "Phone number" },
          { name: "address", type: "string", description: "Street address" },
          { name: "city", type: "string", description: "City" },
          { name: "state", type: "string", description: "State" },
          { name: "zipCode", type: "string", description: "ZIP code" },
        ],
        response: "Customer",
      },
      {
        method: "GET",
        path: "/api/customers/:id",
        description: "Get a specific customer",
        response: "Customer",
      },
      {
        method: "PUT",
        path: "/api/customers/:id",
        description: "Update customer information",
        response: "Customer",
      },
      {
        method: "DELETE",
        path: "/api/customers/:id",
        description: "Delete a customer",
        response: "{ success: true }",
      },
    ],
  },
  {
    title: "Orders",
    description: "Manage pet adoption orders",
    baseUrl: "/api/orders",
    endpoints: [
      {
        method: "GET",
        path: "/api/orders",
        description: "List all orders with filtering",
        queryParams: [
          {
            name: "status",
            type: "string",
            description: "Filter by status (placed, approved, delivered, cancelled)",
          },
          { name: "customerId", type: "string", description: "Filter by customer ID" },
          { name: "limit", type: "number", description: "Results per page" },
          { name: "offset", type: "number", description: "Pagination offset" },
        ],
        response: "{ orders: Order[], total, statusCounts, limit, offset }",
      },
      {
        method: "POST",
        path: "/api/orders",
        description: "Create a new order (marks pet as pending)",
        bodyParams: [
          { name: "customerId", type: "string", required: true, description: "Customer ID" },
          { name: "petId", type: "string", required: true, description: "Pet ID" },
          { name: "quantity", type: "number", description: "Quantity (default: 1)" },
          { name: "shipDate", type: "string", description: "Expected ship date (ISO 8601)" },
          { name: "notes", type: "string", description: "Order notes" },
        ],
        response: "Order",
      },
      {
        method: "GET",
        path: "/api/orders/:id",
        description: "Get order details with customer and pet info",
        response: "Order (with customer and pet details)",
      },
      {
        method: "PATCH",
        path: "/api/orders/:id",
        description: "Update order status",
        bodyParams: [
          { name: "status", type: "string", description: "New status" },
          { name: "shipDate", type: "string", description: "Ship date" },
          { name: "notes", type: "string", description: "Notes" },
        ],
        response: "Order",
      },
      {
        method: "DELETE",
        path: "/api/orders/:id",
        description: "Cancel/delete an order",
        response: "{ success: true }",
      },
    ],
  },
  {
    title: "Inventory",
    description: "Manage store inventory (supplies, food, accessories)",
    baseUrl: "/api/inventory",
    endpoints: [
      {
        method: "GET",
        path: "/api/inventory",
        description: "List inventory items with filtering",
        queryParams: [
          {
            name: "type",
            type: "string",
            description: "Filter by item type (food, supplies, medicine, accessories)",
          },
          { name: "species", type: "string", description: "Filter by target species" },
          { name: "lowStock", type: "boolean", description: "Show only low stock items" },
        ],
        response: "{ items: Inventory[], total, totalValue, lowStockCount, itemTypes }",
      },
      {
        method: "POST",
        path: "/api/inventory",
        description: "Add new inventory item",
        bodyParams: [
          { name: "itemName", type: "string", required: true, description: "Item name" },
          {
            name: "itemType",
            type: "string",
            required: true,
            description: "Type (food, supplies, medicine, accessories)",
          },
          {
            name: "unitPrice",
            type: "number",
            required: true,
            description: "Price per unit in cents",
          },
          { name: "species", type: "string", description: "Target species" },
          { name: "quantity", type: "number", description: "Initial quantity" },
          { name: "reorderLevel", type: "number", description: "Low stock threshold" },
          { name: "supplier", type: "string", description: "Supplier name" },
        ],
        response: "Inventory",
      },
      {
        method: "GET",
        path: "/api/inventory/:id",
        description: "Get inventory item details",
        response: "Inventory",
      },
      {
        method: "PATCH",
        path: "/api/inventory/:id",
        description: "Update inventory item (e.g., adjust quantity)",
        response: "Inventory",
      },
      {
        method: "DELETE",
        path: "/api/inventory/:id",
        description: "Remove inventory item",
        response: "{ success: true }",
      },
    ],
  },
  {
    title: "Categories",
    description: "Manage pet categories",
    baseUrl: "/api/categories",
    endpoints: [
      {
        method: "GET",
        path: "/api/categories",
        description: "List all categories",
        response: "{ categories: Category[] }",
      },
      {
        method: "POST",
        path: "/api/categories",
        description: "Create a new category",
        bodyParams: [
          { name: "name", type: "string", required: true, description: "Category name" },
          { name: "description", type: "string", description: "Category description" },
        ],
        response: "Category",
      },
    ],
  },
  {
    title: "Store",
    description: "Store information and statistics",
    baseUrl: "/api/store",
    endpoints: [
      {
        method: "GET",
        path: "/api/store",
        description: "Get store info and dashboard statistics",
        response: "{ name, address, phone, email, openingHours, isOpen, stats }",
      },
      {
        method: "PUT",
        path: "/api/store",
        description: "Update store information",
        bodyParams: [
          { name: "name", type: "string", description: "Store name" },
          { name: "address", type: "string", description: "Store address" },
          { name: "phone", type: "string", description: "Phone number" },
          { name: "email", type: "string", description: "Email address" },
          { name: "openingHours", type: "object", description: "Opening hours by day" },
          { name: "isOpen", type: "boolean", description: "Store open status" },
        ],
        response: "StoreInfo",
      },
    ],
  },
  {
    title: "Utilities",
    description: "Helper endpoints for development and testing",
    baseUrl: "/api",
    endpoints: [
      {
        method: "POST",
        path: "/api/seed",
        description: "Seed the database with sample data",
        response: "{ success: true, counts: { pets, customers, orders, inventory, categories } }",
      },
      {
        method: "POST",
        path: "/api/pets/seed",
        description: "Seed only pet data",
        response: "{ count: number }",
      },
    ],
  },
];

function MethodBadge({ method }: { method: string }) {
  return <span className={`${styles.method} ${styles[method.toLowerCase()]}`}>{method}</span>;
}

function EndpointCard({ endpoint }: { endpoint: Endpoint }) {
  return (
    <div className={styles.endpoint}>
      <div className={styles.endpointHeader}>
        <MethodBadge method={endpoint.method} />
        <code className={styles.path}>{endpoint.path}</code>
      </div>
      <p className={styles.endpointDesc}>{endpoint.description}</p>

      {endpoint.queryParams && endpoint.queryParams.length > 0 && (
        <div className={styles.params}>
          <h5>Query Parameters</h5>
          <table className={styles.paramTable}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {endpoint.queryParams.map((param) => (
                <tr key={param.name}>
                  <td>
                    <code>{param.name}</code>
                  </td>
                  <td>{param.type}</td>
                  <td>{param.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {endpoint.bodyParams && endpoint.bodyParams.length > 0 && (
        <div className={styles.params}>
          <h5>Request Body</h5>
          <table className={styles.paramTable}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {endpoint.bodyParams.map((param) => (
                <tr key={param.name}>
                  <td>
                    <code>{param.name}</code>
                  </td>
                  <td>{param.type}</td>
                  <td>{param.required ? "Yes" : "No"}</td>
                  <td>{param.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {endpoint.response && (
        <div className={styles.response}>
          <h5>Response</h5>
          <code>{endpoint.response}</code>
        </div>
      )}
    </div>
  );
}

export default function ApiDocsPage() {
  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/" className={styles.backLink}>
            ← Back to App
          </Link>
          <h1>Pet Store API Documentation</h1>
          <p className={styles.subtitle}>
            A complete REST API for managing a pet store, including pets, customers, orders, and
            inventory.
          </p>
        </div>
      </header>

      <div className={styles.content}>
        <nav className={styles.nav}>
          <h3>Sections</h3>
          <ul>
            {apiSections.map((section) => (
              <li key={section.title}>
                <a href={`#${section.title.toLowerCase()}`}>{section.title}</a>
              </li>
            ))}
          </ul>

          <h3>Quick Start</h3>
          <div className={styles.quickStart}>
            <p>Base URL:</p>
            <code>/api</code>
            <p>Seed data:</p>
            <code>POST /api/seed</code>
          </div>
        </nav>

        <div className={styles.sections}>
          {apiSections.map((section) => (
            <section
              key={section.title}
              id={section.title.toLowerCase()}
              className={styles.section}
            >
              <h2>{section.title}</h2>
              <p className={styles.sectionDesc}>{section.description}</p>
              <div className={styles.endpoints}>
                {section.endpoints.map((endpoint, i) => (
                  <EndpointCard
                    key={`${endpoint.method}-${endpoint.path}-${i}`}
                    endpoint={endpoint}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
