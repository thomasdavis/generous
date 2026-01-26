/**
 * Pet Store API Tests - Customers CRUD
 * Tests the /api/customers endpoints for full CRUD operations
 */

import { describe, expect, it } from "vitest";

const API_URL = process.env.TEST_API_URL || "http://localhost:5100";

describe("Customers API", () => {
  let createdCustomerId: string;

  describe("GET /api/customers", () => {
    it("should return a list of customers", async () => {
      const response = await fetch(`${API_URL}/api/customers`);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty("customers");
      expect(data).toHaveProperty("total");
      expect(Array.isArray(data.customers)).toBe(true);
    });

    it("should search customers by query", async () => {
      const response = await fetch(`${API_URL}/api/customers?search=test`);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(Array.isArray(data.customers)).toBe(true);
    });
  });

  describe("POST /api/customers", () => {
    it("should create a new customer", async () => {
      const newCustomer = {
        firstName: "Test",
        lastName: "Customer",
        email: `test-${Date.now()}@example.com`,
        phone: "555-1234",
        address: "123 Test St",
        city: "Test City",
        state: "TS",
        zipCode: "12345",
      };

      const response = await fetch(`${API_URL}/api/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCustomer),
      });

      expect(response.status).toBe(201);

      const customer = await response.json();
      expect(customer).toHaveProperty("id");
      expect(customer.firstName).toBe(newCustomer.firstName);
      expect(customer.lastName).toBe(newCustomer.lastName);
      expect(customer.email).toBe(newCustomer.email);

      createdCustomerId = customer.id;
    });
  });

  describe("GET /api/customers/:id", () => {
    it("should return a single customer by ID", async () => {
      if (!createdCustomerId) {
        console.log("Skipping - no customer created");
        return;
      }

      const response = await fetch(`${API_URL}/api/customers/${createdCustomerId}`);
      expect(response.status).toBe(200);

      const customer = await response.json();
      expect(customer.id).toBe(createdCustomerId);
      expect(customer.firstName).toBe("Test");
    });

    it("should return 404 for non-existent customer", async () => {
      const response = await fetch(`${API_URL}/api/customers/non-existent-id-12345`);
      expect(response.status).toBe(404);
    });
  });

  describe("PUT /api/customers/:id", () => {
    it("should update a customer", async () => {
      if (!createdCustomerId) {
        console.log("Skipping - no customer created");
        return;
      }

      const updates = {
        firstName: "Updated",
        phone: "555-9999",
        city: "New City",
      };

      const response = await fetch(`${API_URL}/api/customers/${createdCustomerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      expect(response.status).toBe(200);

      const customer = await response.json();
      expect(customer.firstName).toBe(updates.firstName);
      expect(customer.phone).toBe(updates.phone);
      expect(customer.city).toBe(updates.city);
    });

    it("should return 404 for updating non-existent customer", async () => {
      const response = await fetch(`${API_URL}/api/customers/non-existent-id-12345`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: "Test" }),
      });

      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /api/customers/:id", () => {
    it("should delete a customer", async () => {
      if (!createdCustomerId) {
        console.log("Skipping - no customer created");
        return;
      }

      const response = await fetch(`${API_URL}/api/customers/${createdCustomerId}`, {
        method: "DELETE",
      });

      expect(response.status).toBe(204);

      // Verify customer is deleted
      const getResponse = await fetch(`${API_URL}/api/customers/${createdCustomerId}`);
      expect(getResponse.status).toBe(404);
    });
  });
});
