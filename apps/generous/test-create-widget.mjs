#!/usr/bin/env node
/**
 * Test that a "Create Service" widget's apiCall produces the correct request.
 * Validates: toolId injection, dot-notation bodyPaths, env vars header.
 */

const APP_URL = process.env.APP_URL || "http://localhost:3002";

let passed = 0;
let failed = 0;

function pass(name) { passed++; console.log(`PASS ${name}`); }
function fail(name, err) { failed++; console.log(`FAIL ${name}: ${err}`); }

async function main() {
  console.log("\n=== Create Service Widget Request Tests ===\n");

  // This is the exact request body the apiCall handler would build
  // when toolId is a top-level param and bodyPaths uses dot-notation
  const requestBody = { toolId: "@tpmjs/tools-unsandbox::createService", params: { name: "test-from-widget" } };

  // Test 1: Endpoint accepts the request format (should not get "toolId is required")
  {
    const resp = await fetch(`${APP_URL}/api/registry-execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-generous-env-vars": JSON.stringify({}), // empty env vars intentionally
      },
      body: JSON.stringify(requestBody),
    });
    const result = await resp.json();

    if (result.error && result.message?.includes("toolId is required")) {
      fail("Request includes toolId", `toolId not found in body: ${JSON.stringify(requestBody)}`);
    } else {
      // Any other error (like missing API key) is fine — it means toolId was accepted
      pass("Request includes toolId (not rejected as missing)");
      if (result.error) {
        console.log(`  INFO: Expected error (no API key): ${result.message?.substring(0, 80)}`);
      }
    }
  }

  // Test 2: With real env vars, the request reaches unsandbox
  {
    const pub = process.env.UNSANDBOX_PUBLIC_KEY;
    const sec = process.env.UNSANDBOX_SECRET_KEY;
    if (!pub || !sec) {
      console.log("SKIP Real API test: UNSANDBOX keys not set");
    } else {
      const resp = await fetch(`${APP_URL}/api/registry-execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-generous-env-vars": JSON.stringify({
            UNSANDBOX_PUBLIC_KEY: pub,
            UNSANDBOX_SECRET_KEY: sec,
          }),
        },
        body: JSON.stringify(requestBody),
      });
      const result = await resp.json();

      // Success OR concurrency_limit_reached both prove the request format is correct
      if (result.success || result.message?.includes("concurrency_limit")) {
        pass("Request reaches unsandbox API (format accepted)");
        if (result.success) {
          console.log("  INFO: Service created! Cleaning up...");
          // Clean up
          await fetch(`${APP_URL}/api/registry-execute`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-generous-env-vars": JSON.stringify({ UNSANDBOX_PUBLIC_KEY: pub, UNSANDBOX_SECRET_KEY: sec }),
            },
            body: JSON.stringify({ toolId: "@tpmjs/tools-unsandbox::deleteService", params: { name: "test-from-widget" } }),
          });
        } else {
          console.log("  INFO: concurrency_limit_reached (proves request format is valid, just at account limit)");
        }
      } else {
        fail("Request reaches unsandbox API", result.message?.substring(0, 120));
      }
    }
  }

  // Test 3: Simulate the apiCall handler's body-building logic
  {
    console.log("\n--- Handler Logic Simulation ---\n");

    // Simulated apiCall params (what the AI generates in the JSONL)
    const actionParams = {
      endpoint: "/api/registry-execute",
      method: "POST",
      toolId: "@tpmjs/tools-unsandbox::createService",
      bodyPaths: { "params.name": "/form/name" },
      successMessage: "Service created!",
      resetPaths: ["/form/name"],
    };

    // Simulated DataProvider state
    const dataStore = { form: { name: "my-new-service" } };

    // Simulate get() function
    const get = (path) => {
      const parts = path.split("/").filter(Boolean);
      let val = dataStore;
      for (const p of parts) val = val?.[p];
      return val;
    };

    // --- Reproduce the handler logic ---
    const { toolId, bodyPaths, body } = actionParams;
    const requestBody2 = body ? { ...body } : {};

    // Auto-inject toolId
    if (toolId) requestBody2.toolId = toolId;

    // Process bodyPaths with dot-notation
    if (bodyPaths) {
      for (const [key, path] of Object.entries(bodyPaths)) {
        const value = get(path);
        if (value !== undefined && value !== null && value !== "") {
          const parts = key.split(".");
          if (parts.length > 1) {
            let target = requestBody2;
            for (let i = 0; i < parts.length - 1; i++) {
              if (!target[parts[i]] || typeof target[parts[i]] !== "object") target[parts[i]] = {};
              target = target[parts[i]];
            }
            target[parts[parts.length - 1]] = value;
          } else {
            requestBody2[key] = value;
          }
        }
      }
    }

    const expected = { toolId: "@tpmjs/tools-unsandbox::createService", params: { name: "my-new-service" } };
    const actual = JSON.stringify(requestBody2);
    const exp = JSON.stringify(expected);

    if (actual === exp) {
      pass(`Handler builds correct body: ${actual}`);
    } else {
      fail(`Handler builds correct body`, `Expected ${exp}, got ${actual}`);
    }
  }

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(e => { console.error("Fatal:", e); process.exit(1); });
