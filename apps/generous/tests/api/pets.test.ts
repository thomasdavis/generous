/**
 * Pet Store API Tests - Pets CRUD
 * Tests the /api/pets endpoints for full CRUD operations
 */

import { describe, expect, it } from "vitest";

const API_URL = process.env.TEST_API_URL || "http://localhost:5100";

describe("Pets API", () => {
  let createdPetId: string;

  describe("GET /api/pets", () => {
    it("should return a list of pets", async () => {
      const response = await fetch(`${API_URL}/api/pets`);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty("pets");
      expect(data).toHaveProperty("total");
      expect(Array.isArray(data.pets)).toBe(true);
    });

    it("should filter pets by status", async () => {
      const response = await fetch(`${API_URL}/api/pets?status=available`);
      expect(response.status).toBe(200);

      const data = await response.json();
      // All returned pets should be available (if any match)
      if (data.pets.length > 0) {
        expect(data.pets.every((pet: { status: string }) => pet.status === "available")).toBe(true);
      }
    });

    it("should filter pets by species", async () => {
      const response = await fetch(`${API_URL}/api/pets?species=dog`);
      expect(response.status).toBe(200);

      const data = await response.json();
      // All returned pets should be dogs (if any match)
      if (data.pets.length > 0) {
        expect(data.pets.every((pet: { species: string }) => pet.species === "dog")).toBe(true);
      }
    });
  });

  describe("POST /api/pets", () => {
    it("should create a new pet", async () => {
      const newPet = {
        name: "Test Dog",
        species: "dog",
        breed: "Golden Retriever",
        age: 3,
        price: 50000,
        description: "A friendly test dog",
      };

      const response = await fetch(`${API_URL}/api/pets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPet),
      });

      expect(response.status).toBe(201);

      const pet = await response.json();
      expect(pet).toHaveProperty("id");
      expect(pet.name).toBe(newPet.name);
      expect(pet.species).toBe(newPet.species);
      expect(pet.breed).toBe(newPet.breed);
      expect(pet.status).toBe("available");

      createdPetId = pet.id;
    });

    it("should create a minimal pet with only required fields", async () => {
      const minimalPet = {
        name: "Minimal Pet",
        species: "cat",
        price: 25000,
      };

      const response = await fetch(`${API_URL}/api/pets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(minimalPet),
      });

      expect(response.status).toBe(201);

      const pet = await response.json();
      expect(pet.name).toBe(minimalPet.name);
      expect(pet.species).toBe(minimalPet.species);
      expect(pet.price).toBe(minimalPet.price);

      // Clean up
      await fetch(`${API_URL}/api/pets/${pet.id}`, { method: "DELETE" });
    });
  });

  describe("GET /api/pets/:id", () => {
    it("should return a single pet by ID", async () => {
      if (!createdPetId) {
        console.log("Skipping - no pet created");
        return;
      }

      const response = await fetch(`${API_URL}/api/pets/${createdPetId}`);
      expect(response.status).toBe(200);

      const pet = await response.json();
      expect(pet.id).toBe(createdPetId);
      expect(pet.name).toBe("Test Dog");
    });

    it("should return 404 for non-existent pet", async () => {
      const response = await fetch(`${API_URL}/api/pets/non-existent-id-12345`);
      expect(response.status).toBe(404);
    });
  });

  describe("PATCH /api/pets/:id", () => {
    it("should update a pet", async () => {
      if (!createdPetId) {
        console.log("Skipping - no pet created");
        return;
      }

      const updates = {
        name: "Updated Test Dog",
        age: 4,
        description: "Updated description",
      };

      const response = await fetch(`${API_URL}/api/pets/${createdPetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      expect(response.status).toBe(200);

      const pet = await response.json();
      expect(pet.name).toBe(updates.name);
      expect(pet.age).toBe(updates.age);
      expect(pet.description).toBe(updates.description);
    });

    it("should return 404 for updating non-existent pet", async () => {
      const response = await fetch(`${API_URL}/api/pets/non-existent-id-12345`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Test" }),
      });

      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /api/pets/:id", () => {
    it("should delete a pet", async () => {
      if (!createdPetId) {
        console.log("Skipping - no pet created");
        return;
      }

      const response = await fetch(`${API_URL}/api/pets/${createdPetId}`, {
        method: "DELETE",
      });

      expect(response.status).toBe(204);

      // Verify pet is deleted
      const getResponse = await fetch(`${API_URL}/api/pets/${createdPetId}`);
      expect(getResponse.status).toBe(404);
    });
  });

  describe("GET /api/pets/stats", () => {
    it("should return pet statistics", async () => {
      const response = await fetch(`${API_URL}/api/pets/stats`);
      expect(response.status).toBe(200);

      const stats = await response.json();
      expect(stats).toHaveProperty("total");
      expect(stats).toHaveProperty("byStatus");
      expect(stats).toHaveProperty("bySpecies");
    });
  });

  describe("GET /api/pets/search", () => {
    it("should search pets and return paginated results", async () => {
      const response = await fetch(`${API_URL}/api/pets/search?q=dog`);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty("pets");
      expect(data).toHaveProperty("total");
      expect(data).toHaveProperty("limit");
      expect(data).toHaveProperty("offset");
      expect(data).toHaveProperty("hasMore");
    });

    it("should support multiple filters", async () => {
      const response = await fetch(
        `${API_URL}/api/pets/search?species=cat&status=available&minPrice=1000&maxPrice=100000`,
      );
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(Array.isArray(data.pets)).toBe(true);
    });

    it("should respect limit and offset for pagination", async () => {
      const response = await fetch(`${API_URL}/api/pets/search?limit=5&offset=0`);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.pets.length).toBeLessThanOrEqual(5);
      expect(data.limit).toBe(5);
      expect(data.offset).toBe(0);
    });
  });
});
