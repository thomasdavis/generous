/**
 * Chat API Tests
 * Run with: pnpm vitest run src/app/api/chat/route.test.ts
 */

import { describe, expect, it } from "vitest";

const API_URL = "http://localhost:5000/api/chat";

describe("Chat API", () => {
  it("should return 400 for empty messages", async () => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [] }),
    });

    expect(response.status).toBe(400);
  });

  it("should handle simple text message in UIMessage format", async () => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            parts: [{ type: "text", text: "hi" }],
          },
        ],
      }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/event-stream");

    const text = await response.text();
    expect(text).toContain('{"type":"start"}');
  });

  it("should handle weather tool request", async () => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            parts: [{ type: "text", text: "What is the weather in Tokyo?" }],
          },
        ],
      }),
    });

    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toContain('{"type":"start"}');
  });

  it("should handle stock tool request", async () => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            parts: [{ type: "text", text: "What is the AAPL stock price?" }],
          },
        ],
      }),
    });

    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toContain('{"type":"start"}');
  });
});
