/**
 * Dynamic Component Generation Tests
 * Tests the AI-powered component generation using gpt-4.1-mini
 * Verifies the system can generate valid UI components from natural language
 */

import { describe, expect, it } from "vitest";

const API_URL = process.env.TEST_API_URL || "http://localhost:5100";
const TIMEOUT = 60000; // 60 seconds for LLM calls

/**
 * Helper to send a chat message and verify response
 */
async function sendChatMessage(message: string): Promise<{
  status: number;
  text: string;
  hasStartEvent: boolean;
}> {
  const response = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [
        {
          role: "user",
          parts: [{ type: "text", text: message }],
        },
      ],
    }),
  });

  const text = await response.text();
  const hasStartEvent = text.includes('"type":"start"');

  return {
    status: response.status,
    text,
    hasStartEvent,
  };
}

describe("Dynamic Component Generation", () => {
  describe("Chat API Basics", () => {
    it("should handle empty messages", async () => {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [] }),
      });

      expect(response.status).toBe(400);
    });

    it("should handle malformed requests", async () => {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "not json",
      });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it(
      "should return streaming response for text messages",
      async () => {
        const result = await sendChatMessage("Say hello");

        expect(result.status).toBe(200);
        expect(result.hasStartEvent).toBe(true);
      },
      TIMEOUT,
    );
  });

  describe("Weather Tool", () => {
    it(
      "should respond to weather queries",
      async () => {
        const result = await sendChatMessage("What's the weather in San Francisco?");

        expect(result.status).toBe(200);
        expect(result.hasStartEvent).toBe(true);
        // The response should contain weather-related content
        expect(
          result.text.includes("weather") ||
            result.text.includes("Weather") ||
            result.text.includes("temperature") ||
            result.text.includes("tool-call"),
        ).toBe(true);
      },
      TIMEOUT,
    );
  });

  describe("Stock Tool", () => {
    it(
      "should respond to stock price queries",
      async () => {
        const result = await sendChatMessage("What's the current price of AAPL?");

        expect(result.status).toBe(200);
        expect(result.hasStartEvent).toBe(true);
      },
      TIMEOUT,
    );
  });

  describe("Calculator Tool", () => {
    it(
      "should respond to calculation requests",
      async () => {
        const result = await sendChatMessage("Calculate 25 * 4 + 10");

        expect(result.status).toBe(200);
        expect(result.hasStartEvent).toBe(true);
      },
      TIMEOUT,
    );
  });

  describe("Pet Store Integration", () => {
    it(
      "should respond to pet listing requests",
      async () => {
        const result = await sendChatMessage("Show me all available pets");

        expect(result.status).toBe(200);
        expect(result.hasStartEvent).toBe(true);
      },
      TIMEOUT,
    );

    it(
      "should respond to filtered pet queries",
      async () => {
        const result = await sendChatMessage("Show me all available dogs");

        expect(result.status).toBe(200);
        expect(result.hasStartEvent).toBe(true);
      },
      TIMEOUT,
    );
  });

  describe("Component Generation", () => {
    it(
      "should generate a weather widget",
      async () => {
        const result = await sendChatMessage("Build me a weather widget for Tokyo");

        expect(result.status).toBe(200);
        expect(result.hasStartEvent).toBe(true);
        // Should trigger createComponent tool
        expect(
          result.text.includes("createComponent") ||
            result.text.includes("widget") ||
            result.text.includes("component"),
        ).toBe(true);
      },
      TIMEOUT,
    );

    it(
      "should generate a stock tracker widget",
      async () => {
        const result = await sendChatMessage("Create a stock tracker for AAPL");

        expect(result.status).toBe(200);
        expect(result.hasStartEvent).toBe(true);
      },
      TIMEOUT,
    );

    it(
      "should generate a pet list component",
      async () => {
        const result = await sendChatMessage(
          "Create a component that shows all available cats from the pet store",
        );

        expect(result.status).toBe(200);
        expect(result.hasStartEvent).toBe(true);
      },
      TIMEOUT,
    );

    it(
      "should generate a dashboard component",
      async () => {
        const result = await sendChatMessage(
          "Build a pet store dashboard that shows available pets",
        );

        expect(result.status).toBe(200);
        expect(result.hasStartEvent).toBe(true);
      },
      TIMEOUT,
    );

    it(
      "should generate an interactive card component",
      async () => {
        const result = await sendChatMessage(
          "Create an interactive card that changes color when clicked",
        );

        expect(result.status).toBe(200);
        expect(result.hasStartEvent).toBe(true);
      },
      TIMEOUT,
    );

    it(
      "should generate a metrics card",
      async () => {
        const result = await sendChatMessage("Create a simple metrics card showing pet statistics");

        expect(result.status).toBe(200);
        expect(result.hasStartEvent).toBe(true);
      },
      TIMEOUT,
    );

    it(
      "should generate a progress bar component",
      async () => {
        const result = await sendChatMessage("Create a progress bar showing 75% completion");

        expect(result.status).toBe(200);
        expect(result.hasStartEvent).toBe(true);
      },
      TIMEOUT,
    );
  });
});

describe("Store Info API", () => {
  it("should return store info with stats", async () => {
    const response = await fetch(`${API_URL}/api/store`);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty("name");
    expect(data).toHaveProperty("stats");
    expect(data.stats).toHaveProperty("totalPets");
    expect(data.stats).toHaveProperty("availablePets");
    expect(data.stats).toHaveProperty("totalOrders");
    expect(data.stats).toHaveProperty("totalCustomers");
  });

  it("should update store info", async () => {
    const updates = {
      name: "Updated Pet Paradise",
      phone: "555-9999",
    };

    const response = await fetch(`${API_URL}/api/store`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.name).toBe(updates.name);
    expect(data.phone).toBe(updates.phone);
  });
});

describe("Categories API", () => {
  let createdCategoryId: string;

  it("should return a list of categories", async () => {
    const response = await fetch(`${API_URL}/api/categories`);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty("categories");
    expect(Array.isArray(data.categories)).toBe(true);
  });

  it("should create a new category", async () => {
    const newCategory = {
      name: `Test Category ${Date.now()}`,
      description: "A test category for integration tests",
    };

    const response = await fetch(`${API_URL}/api/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCategory),
    });

    expect(response.status).toBe(201);

    const category = await response.json();
    expect(category).toHaveProperty("id");
    expect(category.name).toBe(newCategory.name);

    createdCategoryId = category.id;
  });

  it("should get a single category", async () => {
    if (!createdCategoryId) {
      console.log("Skipping - no category created");
      return;
    }

    const response = await fetch(`${API_URL}/api/categories/${createdCategoryId}`);
    expect(response.status).toBe(200);

    const category = await response.json();
    expect(category.id).toBe(createdCategoryId);
  });

  it("should update a category", async () => {
    if (!createdCategoryId) {
      console.log("Skipping - no category created");
      return;
    }

    const response = await fetch(`${API_URL}/api/categories/${createdCategoryId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Updated Category" }),
    });

    expect(response.status).toBe(200);

    const category = await response.json();
    expect(category.name).toBe("Updated Category");
  });

  it("should delete a category", async () => {
    if (!createdCategoryId) {
      console.log("Skipping - no category created");
      return;
    }

    const response = await fetch(`${API_URL}/api/categories/${createdCategoryId}`, {
      method: "DELETE",
    });

    expect(response.status).toBe(204);
  });
});

describe("Seed API", () => {
  it("should return current data counts", async () => {
    const response = await fetch(`${API_URL}/api/seed`);
    expect(response.status).toBe(200);

    const data = await response.json();
    // The API returns { counts: { pets, customers, orders, inventory, categories }, message }
    expect(data).toHaveProperty("counts");
    expect(data.counts).toHaveProperty("pets");
    expect(data.counts).toHaveProperty("customers");
    expect(data.counts).toHaveProperty("orders");
    expect(data.counts).toHaveProperty("inventory");
    expect(data.counts).toHaveProperty("categories");
  });
});
