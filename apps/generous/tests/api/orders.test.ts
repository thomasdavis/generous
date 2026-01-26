/**
 * Pet Store API Tests - Orders CRUD
 * Tests the /api/orders endpoints for full CRUD operations
 */

import { beforeAll, describe, expect, it } from "vitest";

const API_URL = process.env.TEST_API_URL || "http://localhost:5100";

describe("Orders API", () => {
  let createdOrderId: string;
  let testCustomerId: string;
  let testPetId: string;

  // Create test data before running order tests
  beforeAll(async () => {
    // Create a test customer
    const customerResponse = await fetch(`${API_URL}/api/customers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: "Order",
        lastName: "Tester",
        email: `order-test-${Date.now()}@example.com`,
      }),
    });

    if (customerResponse.status === 201) {
      const customer = await customerResponse.json();
      testCustomerId = customer.id;
    }

    // Create a test pet
    const petResponse = await fetch(`${API_URL}/api/pets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Order Test Pet",
        species: "cat",
        price: 30000,
      }),
    });

    if (petResponse.status === 201) {
      const pet = await petResponse.json();
      testPetId = pet.id;
    }
  });

  describe("GET /api/orders", () => {
    it("should return a list of orders", async () => {
      const response = await fetch(`${API_URL}/api/orders`);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty("orders");
      expect(data).toHaveProperty("total");
      expect(data).toHaveProperty("statusCounts");
      expect(Array.isArray(data.orders)).toBe(true);
    });

    it("should filter orders by status", async () => {
      const response = await fetch(`${API_URL}/api/orders?status=placed`);
      expect(response.status).toBe(200);

      const data = await response.json();
      if (data.orders.length > 0) {
        expect(data.orders.every((order: { status: string }) => order.status === "placed")).toBe(
          true,
        );
      }
    });
  });

  describe("POST /api/orders", () => {
    it("should create a new order", async () => {
      if (!testCustomerId || !testPetId) {
        console.log("Skipping - test data not created");
        return;
      }

      const newOrder = {
        customerId: testCustomerId,
        petId: testPetId,
        quantity: 1,
        notes: "Test order",
      };

      const response = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder),
      });

      expect(response.status).toBe(201);

      const order = await response.json();
      expect(order).toHaveProperty("id");
      expect(order.customerId).toBe(newOrder.customerId);
      expect(order.petId).toBe(newOrder.petId);
      expect(order.status).toBe("placed");
      expect(order.totalPrice).toBe(30000); // Pet price * quantity

      createdOrderId = order.id;
    });

    it("should reject order for non-existent customer", async () => {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: "non-existent-customer-12345",
          petId: testPetId || "test-pet",
        }),
      });

      expect(response.status).toBe(404);
    });

    it("should reject order for non-existent pet", async () => {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: testCustomerId || "test-customer",
          petId: "non-existent-pet-12345",
        }),
      });

      expect(response.status).toBe(404);
    });
  });

  describe("GET /api/orders/:id", () => {
    it("should return a single order with customer and pet details", async () => {
      if (!createdOrderId) {
        console.log("Skipping - no order created");
        return;
      }

      const response = await fetch(`${API_URL}/api/orders/${createdOrderId}`);
      expect(response.status).toBe(200);

      const order = await response.json();
      expect(order.id).toBe(createdOrderId);
      expect(order).toHaveProperty("customer");
      expect(order).toHaveProperty("pet");
    });

    it("should return 404 for non-existent order", async () => {
      const response = await fetch(`${API_URL}/api/orders/non-existent-id-12345`);
      expect(response.status).toBe(404);
    });
  });

  describe("PATCH /api/orders/:id", () => {
    it("should update order status", async () => {
      if (!createdOrderId) {
        console.log("Skipping - no order created");
        return;
      }

      const response = await fetch(`${API_URL}/api/orders/${createdOrderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });

      expect(response.status).toBe(200);

      const order = await response.json();
      expect(order.status).toBe("approved");
    });

    it("should reject invalid status", async () => {
      if (!createdOrderId) {
        console.log("Skipping - no order created");
        return;
      }

      const response = await fetch(`${API_URL}/api/orders/${createdOrderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "invalid-status" }),
      });

      expect(response.status).toBe(400);
    });

    it("should return 404 for updating non-existent order", async () => {
      const response = await fetch(`${API_URL}/api/orders/non-existent-id-12345`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });

      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /api/orders/:id", () => {
    it("should delete an order", async () => {
      if (!createdOrderId) {
        console.log("Skipping - no order created");
        return;
      }

      const response = await fetch(`${API_URL}/api/orders/${createdOrderId}`, {
        method: "DELETE",
      });

      expect(response.status).toBe(204);

      // Verify order is deleted
      const getResponse = await fetch(`${API_URL}/api/orders/${createdOrderId}`);
      expect(getResponse.status).toBe(404);
    });
  });
});
