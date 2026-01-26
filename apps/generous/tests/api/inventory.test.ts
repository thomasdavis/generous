/**
 * Pet Store API Tests - Inventory CRUD
 * Tests the /api/inventory endpoints for full CRUD operations
 */

import { describe, expect, it } from "vitest";

const API_URL = process.env.TEST_API_URL || "http://localhost:5100";

describe("Inventory API", () => {
  let createdItemId: string;

  describe("GET /api/inventory", () => {
    it("should return a list of inventory items", async () => {
      const response = await fetch(`${API_URL}/api/inventory`);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty("items");
      expect(data).toHaveProperty("total");
      expect(Array.isArray(data.items)).toBe(true);
    });

    it("should filter by item type", async () => {
      const response = await fetch(`${API_URL}/api/inventory?itemType=food`);
      expect(response.status).toBe(200);

      const data = await response.json();
      if (data.items.length > 0) {
        expect(data.items.every((item: { itemType: string }) => item.itemType === "food")).toBe(
          true,
        );
      }
    });

    it("should filter low stock items", async () => {
      const response = await fetch(`${API_URL}/api/inventory?lowStock=true`);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(Array.isArray(data.items)).toBe(true);
    });
  });

  describe("POST /api/inventory", () => {
    it("should create a new inventory item", async () => {
      const newItem = {
        itemName: "Test Dog Food",
        itemType: "food",
        species: "dog",
        quantity: 100,
        unitPrice: 2500, // $25.00
        reorderLevel: 20,
        supplier: "Test Supplier Inc.",
      };

      const response = await fetch(`${API_URL}/api/inventory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });

      expect(response.status).toBe(201);

      const item = await response.json();
      expect(item).toHaveProperty("id");
      expect(item.itemName).toBe(newItem.itemName);
      expect(item.itemType).toBe(newItem.itemType);
      expect(item.quantity).toBe(newItem.quantity);
      expect(item.unitPrice).toBe(newItem.unitPrice);

      createdItemId = item.id;
    });
  });

  describe("GET /api/inventory/:id", () => {
    it("should return a single inventory item by ID", async () => {
      if (!createdItemId) {
        console.log("Skipping - no item created");
        return;
      }

      const response = await fetch(`${API_URL}/api/inventory/${createdItemId}`);
      expect(response.status).toBe(200);

      const item = await response.json();
      expect(item.id).toBe(createdItemId);
      expect(item.itemName).toBe("Test Dog Food");
    });

    it("should return 404 for non-existent item", async () => {
      const response = await fetch(`${API_URL}/api/inventory/non-existent-id-12345`);
      expect(response.status).toBe(404);
    });
  });

  describe("PUT /api/inventory/:id", () => {
    it("should update an inventory item", async () => {
      if (!createdItemId) {
        console.log("Skipping - no item created");
        return;
      }

      const updates = {
        itemName: "Updated Dog Food",
        quantity: 150,
        unitPrice: 2800,
      };

      const response = await fetch(`${API_URL}/api/inventory/${createdItemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      expect(response.status).toBe(200);

      const item = await response.json();
      expect(item.itemName).toBe(updates.itemName);
      expect(item.quantity).toBe(updates.quantity);
      expect(item.unitPrice).toBe(updates.unitPrice);
    });

    it("should return 404 for updating non-existent item", async () => {
      const response = await fetch(`${API_URL}/api/inventory/non-existent-id-12345`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemName: "Test" }),
      });

      expect(response.status).toBe(404);
    });
  });

  describe("PATCH /api/inventory/:id", () => {
    it("should adjust quantity by delta", async () => {
      if (!createdItemId) {
        console.log("Skipping - no item created");
        return;
      }

      // First get current quantity
      const getResponse = await fetch(`${API_URL}/api/inventory/${createdItemId}`);
      const currentItem = await getResponse.json();
      const originalQuantity = currentItem.quantity;

      // Adjust by -10
      const response = await fetch(`${API_URL}/api/inventory/${createdItemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adjustQuantity: -10 }),
      });

      expect(response.status).toBe(200);

      const item = await response.json();
      expect(item.quantity).toBe(originalQuantity - 10);
    });

    it("should reject negative resulting quantity", async () => {
      if (!createdItemId) {
        console.log("Skipping - no item created");
        return;
      }

      const response = await fetch(`${API_URL}/api/inventory/${createdItemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adjustQuantity: -99999 }),
      });

      expect(response.status).toBe(400);
    });

    it("should return 404 for adjusting non-existent item", async () => {
      const response = await fetch(`${API_URL}/api/inventory/non-existent-id-12345`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adjustQuantity: 10 }),
      });

      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /api/inventory/:id", () => {
    it("should delete an inventory item", async () => {
      if (!createdItemId) {
        console.log("Skipping - no item created");
        return;
      }

      const response = await fetch(`${API_URL}/api/inventory/${createdItemId}`, {
        method: "DELETE",
      });

      expect(response.status).toBe(204);

      // Verify item is deleted
      const getResponse = await fetch(`${API_URL}/api/inventory/${createdItemId}`);
      expect(getResponse.status).toBe(404);
    });
  });
});
