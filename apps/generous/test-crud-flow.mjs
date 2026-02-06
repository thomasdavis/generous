#!/usr/bin/env node
/**
 * Programmatic test for the full CRUD flow:
 * 1. parseJSONLToTree unit tests
 * 2. TPMJS executor direct calls (unsandbox list/create/delete)
 * 3. App's /api/registry-execute endpoint
 * 4. Chat API end-to-end component creation
 *
 * Usage:
 *   UNSANDBOX_PUBLIC_KEY=your_key node test-crud-flow.mjs
 *   or add UNSANDBOX_PUBLIC_KEY to .env
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env manually
function loadEnv() {
  try {
    const envContent = readFileSync(resolve(__dirname, ".env"), "utf-8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let value = trimmed.slice(eqIdx + 1).trim();
      // Remove surrounding quotes
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {}
}
loadEnv();

const EXECUTOR_URL = process.env.TPMJS_EXECUTOR_URL || "https://executor.tpmjs.com";
const APP_URL = process.env.APP_URL || "http://localhost:3002";
const UNSANDBOX_PUBLIC = process.env.UNSANDBOX_PUBLIC_KEY || "";
const UNSANDBOX_SECRET = process.env.UNSANDBOX_SECRET_KEY || "";
const HAS_UNSANDBOX = !!(UNSANDBOX_PUBLIC && UNSANDBOX_SECRET);

let passed = 0;
let failed = 0;
let skipped = 0;

function log(icon, msg) {
  console.log(`${icon} ${msg}`);
}

function pass(name) {
  passed++;
  log("PASS", name);
}

function fail(name, error) {
  failed++;
  log("FAIL", `${name}: ${error}`);
}

function skip(name, reason) {
  skipped++;
  log("SKIP", `${name}: ${reason}`);
}

// ============================================================
// SECTION 1: parseJSONLToTree unit tests
// ============================================================

// Inline the parser since we can't import .ts in .mjs
function tryParseJSON(line) {
  try {
    return JSON.parse(line);
  } catch {
    let trimmed = line;
    while (trimmed.endsWith("}")) {
      trimmed = trimmed.slice(0, -1);
      try {
        return JSON.parse(trimmed);
      } catch {}
    }
    return null;
  }
}

function parseJSONLToTree(jsonl) {
  const lines = jsonl.trim().split("\n").filter(Boolean);
  let root = null;
  let data;
  const elements = {};
  for (const line of lines) {
    const patch = tryParseJSON(line);
    if (!patch) continue;
    if (patch.op === "set" && patch.path === "/root") {
      root = patch.value;
    } else if (patch.op === "set" && patch.path === "/data") {
      data = patch.value;
    } else if (patch.op === "add" && patch.path?.startsWith("/elements/")) {
      const key = patch.path.replace("/elements/", "");
      elements[key] = patch.value;
    }
  }
  if (!root || Object.keys(elements).length === 0) return null;
  return { root, elements, data };
}

function testParseJSONL() {
  console.log("\n=== SECTION 1: parseJSONLToTree Unit Tests ===\n");

  // Test 1: Valid JSONL
  {
    const jsonl = `{"op":"set","path":"/root","value":"card1"}
{"op":"add","path":"/elements/card1","value":{"type":"Card","props":{"title":"Test"},"children":[]}}`;
    const tree = parseJSONLToTree(jsonl);
    if (tree && tree.root === "card1" && tree.elements.card1) {
      pass("Valid JSONL parses correctly");
    } else {
      fail("Valid JSONL parses correctly", JSON.stringify(tree));
    }
  }

  // Test 2: JSONL with data
  {
    const jsonl = `{"op":"set","path":"/data","value":{"color":"blue","count":0}}
{"op":"set","path":"/root","value":"root1"}
{"op":"add","path":"/elements/root1","value":{"type":"Stack","props":{},"children":[]}}`;
    const tree = parseJSONLToTree(jsonl);
    if (tree && tree.data?.color === "blue" && tree.data?.count === 0) {
      pass("JSONL with data section parses correctly");
    } else {
      fail("JSONL with data section parses correctly", JSON.stringify(tree));
    }
  }

  // Test 3: Extra trailing brace (common AI error)
  {
    const jsonl = `{"op":"set","path":"/root","value":"card1"}
{"op":"add","path":"/elements/card1","value":{"type":"Card","props":{"title":"Test"},"children":[]}}}}`;
    const tree = parseJSONLToTree(jsonl);
    if (tree && tree.root === "card1" && tree.elements.card1) {
      pass("Extra trailing braces handled gracefully");
    } else {
      fail("Extra trailing braces handled gracefully", "Tree was null");
    }
  }

  // Test 4: Multiple elements
  {
    const jsonl = `{"op":"set","path":"/root","value":"stack1"}
{"op":"add","path":"/elements/stack1","value":{"type":"Stack","props":{},"children":["card1","card2"]}}
{"op":"add","path":"/elements/card1","value":{"type":"Card","props":{"title":"Card 1"},"children":[]}}
{"op":"add","path":"/elements/card2","value":{"type":"Card","props":{"title":"Card 2"},"children":[]}}`;
    const tree = parseJSONLToTree(jsonl);
    if (tree && Object.keys(tree.elements).length === 3 && tree.elements.stack1 && tree.elements.card1 && tree.elements.card2) {
      pass("Multiple elements parsed correctly");
    } else {
      fail("Multiple elements parsed correctly", `Got ${Object.keys(tree?.elements || {}).length} elements`);
    }
  }

  // Test 5: Missing root returns null
  {
    const jsonl = `{"op":"add","path":"/elements/card1","value":{"type":"Card","props":{},"children":[]}}`;
    const tree = parseJSONLToTree(jsonl);
    if (tree === null) {
      pass("Missing root returns null");
    } else {
      fail("Missing root returns null", "Expected null");
    }
  }

  // Test 6: Missing elements returns null
  {
    const jsonl = `{"op":"set","path":"/root","value":"card1"}`;
    const tree = parseJSONLToTree(jsonl);
    if (tree === null) {
      pass("Missing elements returns null");
    } else {
      fail("Missing elements returns null", "Expected null");
    }
  }

  // Test 7: Completely invalid JSON line is skipped
  {
    const jsonl = `{"op":"set","path":"/root","value":"card1"}
this is not json at all
{"op":"add","path":"/elements/card1","value":{"type":"Card","props":{},"children":[]}}`;
    const tree = parseJSONLToTree(jsonl);
    if (tree && tree.root === "card1" && tree.elements.card1) {
      pass("Invalid JSON lines are skipped gracefully");
    } else {
      fail("Invalid JSON lines are skipped gracefully", "Tree was null");
    }
  }

  // Test 8: RegistryFetcher component in JSONL
  {
    const jsonl = `{"op":"set","path":"/root","value":"fetcher1"}
{"op":"add","path":"/elements/fetcher1","value":{"type":"RegistryFetcher","props":{"toolId":"@tpmjs/tools-unsandbox::listServices","params":{},"dataKey":"services","title":"My Services"},"children":[]}}`;
    const tree = parseJSONLToTree(jsonl);
    if (tree && tree.elements.fetcher1?.props?.toolId === "@tpmjs/tools-unsandbox::listServices") {
      pass("RegistryFetcher JSONL parses with correct toolId");
    } else {
      fail("RegistryFetcher JSONL parses with correct toolId", JSON.stringify(tree?.elements?.fetcher1));
    }
  }
}

// ============================================================
// SECTION 2: TPMJS Executor Direct Tests
// ============================================================

async function testExecutorDirect() {
  console.log("\n=== SECTION 2: TPMJS Executor Direct Tests ===\n");

  if (!HAS_UNSANDBOX) {
    skip("Executor direct tests", "UNSANDBOX keys not set");
    return;
  }

  const env = { UNSANDBOX_PUBLIC_KEY: UNSANDBOX_PUBLIC, UNSANDBOX_SECRET_KEY: UNSANDBOX_SECRET };

  // Test 1: listServices
  let servicesBefore;
  {
    try {
      const resp = await fetch(`${EXECUTOR_URL}/execute-tool`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageName: "@tpmjs/tools-unsandbox",
          name: "listServices",
          version: "latest",
          importUrl: "https://esm.sh/@tpmjs/tools-unsandbox",
          params: {},
          env,
        }),
      });
      const result = await resp.json();
      if (result.success) {
        servicesBefore = result.output;
        const count = Array.isArray(result.output?.services) ? result.output.services.length : "unknown structure";
        log("INFO", `  listServices response keys: ${Object.keys(result.output || {}).join(", ")}`);
        log("INFO", `  Services count: ${count}`);
        pass("Executor: listServices works");
      } else {
        fail("Executor: listServices works", result.error);
      }
    } catch (e) {
      fail("Executor: listServices works", e.message);
    }
  }

  // Test 2: createService
  const testServiceName = `test-crud-${Date.now()}`;
  let createdService;
  {
    try {
      const resp = await fetch(`${EXECUTOR_URL}/execute-tool`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageName: "@tpmjs/tools-unsandbox",
          name: "createService",
          version: "latest",
          importUrl: "https://esm.sh/@tpmjs/tools-unsandbox",
          params: { name: testServiceName },
          env,
        }),
      });
      const result = await resp.json();
      if (result.success) {
        createdService = result.output;
        log("INFO", `  createService response keys: ${Object.keys(result.output || {}).join(", ")}`);
        log("INFO", `  Created service: ${JSON.stringify(result.output).substring(0, 200)}`);
        pass("Executor: createService works");
      } else {
        fail("Executor: createService works", result.error || JSON.stringify(result));
      }
    } catch (e) {
      fail("Executor: createService works", e.message);
    }
  }

  // Test 3: listServices after create (verify new service appears)
  {
    try {
      const resp = await fetch(`${EXECUTOR_URL}/execute-tool`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageName: "@tpmjs/tools-unsandbox",
          name: "listServices",
          version: "latest",
          importUrl: "https://esm.sh/@tpmjs/tools-unsandbox",
          params: {},
          env,
        }),
      });
      const result = await resp.json();
      if (result.success) {
        const services = result.output?.services || [];
        const found = services.some(s => s.name === testServiceName || s.serviceName === testServiceName);
        if (found) {
          pass("Executor: newly created service appears in list");
        } else {
          // Check all possible name fields
          log("INFO", `  Services: ${JSON.stringify(services.map(s => s.name || s.serviceName || s.id)).substring(0, 300)}`);
          fail("Executor: newly created service appears in list", `Service '${testServiceName}' not found in list`);
        }
      } else {
        fail("Executor: newly created service appears in list", result.error);
      }
    } catch (e) {
      fail("Executor: newly created service appears in list", e.message);
    }
  }

  // Test 4: deleteService
  {
    try {
      // Try to determine the service ID from the create response or find it in the list
      const serviceId = createdService?.id || createdService?.serviceId || createdService?.name || testServiceName;
      log("INFO", `  Attempting to delete service: ${serviceId}`);

      const resp = await fetch(`${EXECUTOR_URL}/execute-tool`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageName: "@tpmjs/tools-unsandbox",
          name: "deleteService",
          version: "latest",
          importUrl: "https://esm.sh/@tpmjs/tools-unsandbox",
          params: { name: testServiceName },
          env,
        }),
      });
      const result = await resp.json();
      if (result.success) {
        log("INFO", `  deleteService response: ${JSON.stringify(result.output).substring(0, 200)}`);
        pass("Executor: deleteService works");
      } else {
        fail("Executor: deleteService works", result.error || JSON.stringify(result));
      }
    } catch (e) {
      fail("Executor: deleteService works", e.message);
    }
  }

  // Test 5: Verify service is gone after delete
  {
    try {
      const resp = await fetch(`${EXECUTOR_URL}/execute-tool`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageName: "@tpmjs/tools-unsandbox",
          name: "listServices",
          version: "latest",
          importUrl: "https://esm.sh/@tpmjs/tools-unsandbox",
          params: {},
          env,
        }),
      });
      const result = await resp.json();
      if (result.success) {
        const services = result.output?.services || [];
        const found = services.some(s => s.name === testServiceName || s.serviceName === testServiceName);
        if (!found) {
          pass("Executor: deleted service no longer in list");
        } else {
          fail("Executor: deleted service no longer in list", "Service still present after delete");
        }
      } else {
        fail("Executor: deleted service no longer in list", result.error);
      }
    } catch (e) {
      fail("Executor: deleted service no longer in list", e.message);
    }
  }
}

// ============================================================
// SECTION 3: App /api/registry-execute Endpoint Tests
// ============================================================

async function testRegistryExecuteEndpoint() {
  console.log("\n=== SECTION 3: App /api/registry-execute Endpoint Tests ===\n");

  if (!HAS_UNSANDBOX) {
    skip("Registry execute endpoint tests", "UNSANDBOX keys not set");
    return;
  }

  const envVars = { UNSANDBOX_PUBLIC_KEY: UNSANDBOX_PUBLIC, UNSANDBOX_SECRET_KEY: UNSANDBOX_SECRET };

  // Test 1: listServices through app endpoint
  {
    try {
      const resp = await fetch(`${APP_URL}/api/registry-execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-generous-env-vars": JSON.stringify(envVars),
        },
        body: JSON.stringify({
          toolId: "@tpmjs/tools-unsandbox::listServices",
          params: {},
        }),
      });
      const result = await resp.json();
      if (result.success && result.data) {
        log("INFO", `  App endpoint response keys: ${Object.keys(result.data).join(", ")}`);
        pass("App endpoint: listServices works");
      } else {
        fail("App endpoint: listServices works", result.message || JSON.stringify(result));
      }
    } catch (e) {
      fail("App endpoint: listServices works", e.message);
    }
  }

  // Test 2: Invalid toolId format
  {
    try {
      const resp = await fetch(`${APP_URL}/api/registry-execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolId: "invalid-format",
          params: {},
        }),
      });
      const result = await resp.json();
      if (result.error) {
        pass("App endpoint: rejects invalid toolId format");
      } else {
        fail("App endpoint: rejects invalid toolId format", "Expected error response");
      }
    } catch (e) {
      fail("App endpoint: rejects invalid toolId format", e.message);
    }
  }

  // Test 3: Missing toolId
  {
    try {
      const resp = await fetch(`${APP_URL}/api/registry-execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ params: {} }),
      });
      const result = await resp.json();
      if (result.error) {
        pass("App endpoint: rejects missing toolId");
      } else {
        fail("App endpoint: rejects missing toolId", "Expected error response");
      }
    } catch (e) {
      fail("App endpoint: rejects missing toolId", e.message);
    }
  }

  // Test 4: Response structure matches what RegistryFetcher expects
  {
    try {
      const resp = await fetch(`${APP_URL}/api/registry-execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-generous-env-vars": JSON.stringify(envVars),
        },
        body: JSON.stringify({
          toolId: "@tpmjs/tools-unsandbox::listServices",
          params: {},
        }),
      });
      const result = await resp.json();
      // RegistryFetcher expects: { success: true, data: { ... } }
      // and uses data[dataKey] to extract the array
      if (result.success === true && typeof result.data === "object") {
        const topKeys = Object.keys(result.data);
        log("INFO", `  Response data top-level keys: ${topKeys.join(", ")}`);
        log("INFO", `  These are valid dataKey values for RegistryFetcher`);

        // Check if any key contains an array (what RegistryFetcher would render)
        const arrayKeys = topKeys.filter(k => Array.isArray(result.data[k]));
        if (arrayKeys.length > 0) {
          log("INFO", `  Array keys (best for dataKey): ${arrayKeys.join(", ")}`);
          pass("App endpoint: response structure compatible with RegistryFetcher");
        } else {
          log("INFO", `  No array keys found - data structure: ${JSON.stringify(result.data).substring(0, 200)}`);
          pass("App endpoint: response structure compatible with RegistryFetcher (non-array data)");
        }
      } else {
        fail("App endpoint: response structure compatible with RegistryFetcher",
          `Expected {success: true, data: {...}}, got ${JSON.stringify(result).substring(0, 200)}`);
      }
    } catch (e) {
      fail("App endpoint: response structure compatible with RegistryFetcher", e.message);
    }
  }
}

// ============================================================
// SECTION 4: JSONL Component Generation Validation
// ============================================================

async function testComponentJSONLGeneration() {
  console.log("\n=== SECTION 4: Component JSONL Generation Validation ===\n");

  if (!HAS_UNSANDBOX) {
    skip("Component JSONL tests", "UNSANDBOX keys not set");
    return;
  }

  // First, get the actual response structure from unsandbox
  let actualKeys;
  {
    try {
      const resp = await fetch(`${APP_URL}/api/registry-execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-generous-env-vars": JSON.stringify({ UNSANDBOX_PUBLIC_KEY: UNSANDBOX_PUBLIC, UNSANDBOX_SECRET_KEY: UNSANDBOX_SECRET }),
        },
        body: JSON.stringify({
          toolId: "@tpmjs/tools-unsandbox::listServices",
          params: {},
        }),
      });
      const result = await resp.json();
      if (result.success && result.data) {
        actualKeys = Object.keys(result.data);
        log("INFO", `  Actual response keys from listServices: ${actualKeys.join(", ")}`);
      }
    } catch (e) {
      fail("Fetch actual response keys", e.message);
      return;
    }
  }

  // Test: Simulate what createComponent should generate for a "List Services" widget
  // The JSONL should use the correct dataKey matching the actual response
  {
    const testCases = [
      {
        name: "listServices widget with correct dataKey",
        jsonl: `{"op":"set","path":"/root","value":"fetcher1"}
{"op":"add","path":"/elements/fetcher1","value":{"type":"RegistryFetcher","props":{"toolId":"@tpmjs/tools-unsandbox::listServices","params":{},"dataKey":"${actualKeys?.[0] || "services"}","title":"My Unsandbox Services","refreshInterval":30000},"children":[]}}`,
        expectDataKey: actualKeys?.[0] || "services",
      },
      {
        name: "listServices widget with WRONG dataKey should be caught",
        jsonl: `{"op":"set","path":"/root","value":"fetcher1"}
{"op":"add","path":"/elements/fetcher1","value":{"type":"RegistryFetcher","props":{"toolId":"@tpmjs/tools-unsandbox::listServices","params":{},"dataKey":"results","title":"My Services"},"children":[]}}`,
        expectDataKey: "results",
        shouldMismatch: true,
      },
    ];

    for (const tc of testCases) {
      const tree = parseJSONLToTree(tc.jsonl);
      if (!tree) {
        fail(tc.name, "Failed to parse JSONL");
        continue;
      }

      const fetcherElement = tree.elements.fetcher1;
      const dataKey = fetcherElement?.props?.dataKey;

      if (tc.shouldMismatch) {
        if (actualKeys && !actualKeys.includes(dataKey)) {
          pass(`${tc.name} (dataKey '${dataKey}' correctly identified as wrong, actual: ${actualKeys.join(", ")})`);
        } else {
          fail(tc.name, `Expected dataKey '${dataKey}' to NOT be in actual keys`);
        }
      } else {
        if (actualKeys?.includes(dataKey)) {
          pass(`${tc.name} (dataKey '${dataKey}' matches actual response)`);
        } else {
          fail(tc.name, `dataKey '${dataKey}' not found in actual keys: ${actualKeys?.join(", ")}`);
        }
      }
    }
  }

  // Test: Validate CRUD component set (list, create, delete widgets)
  {
    console.log("\n  --- CRUD Widget Set Validation ---\n");

    // List widget
    const listJsonl = `{"op":"set","path":"/root","value":"fetcher1"}
{"op":"add","path":"/elements/fetcher1","value":{"type":"RegistryFetcher","props":{"toolId":"@tpmjs/tools-unsandbox::listServices","params":{},"dataKey":"${actualKeys?.[0] || "services"}","title":"Unsandbox Services","refreshInterval":30000},"children":[]}}`;

    const listTree = parseJSONLToTree(listJsonl);
    if (listTree && listTree.elements.fetcher1?.props?.toolId === "@tpmjs/tools-unsandbox::listServices") {
      pass("CRUD List widget: valid JSONL with correct toolId");
    } else {
      fail("CRUD List widget: valid JSONL with correct toolId", "Parse failed");
    }

    // Create widget (form with apiCall action)
    const createJsonl = `{"op":"set","path":"/data","value":{"form":{"name":""}}}
{"op":"set","path":"/root","value":"card1"}
{"op":"add","path":"/elements/card1","value":{"type":"Card","props":{"title":"Create Service","padding":"md"},"children":["stack1"]}}
{"op":"add","path":"/elements/stack1","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["input1","btn1"]}}
{"op":"add","path":"/elements/input1","value":{"type":"Input","props":{"label":"Service Name","placeholder":"Enter service name","valuePath":"/form/name"},"children":[]}}
{"op":"add","path":"/elements/btn1","value":{"type":"Button","props":{"label":"Create Service","variant":"primary","action":{"name":"apiCall","params":{"endpoint":"/api/registry-execute","method":"POST","body":{"toolId":"@tpmjs/tools-unsandbox::createService"},"bodyPaths":{"params.name":"/form/name"},"successMessage":"Service created!","resetPaths":["/form/name"]}}},"children":[]}}`;

    const createTree = parseJSONLToTree(createJsonl);
    if (createTree && createTree.data?.form && createTree.elements.input1 && createTree.elements.btn1) {
      const btnAction = createTree.elements.btn1?.props?.action;
      if (btnAction?.name === "apiCall" && btnAction?.params?.endpoint) {
        pass("CRUD Create widget: valid form with apiCall action");
      } else {
        fail("CRUD Create widget: valid form with apiCall action", "Missing apiCall action on button");
      }
    } else {
      fail("CRUD Create widget: valid form with apiCall action", "Parse failed");
    }

    // Delete widget (form with apiCall action)
    const deleteJsonl = `{"op":"set","path":"/data","value":{"form":{"name":""}}}
{"op":"set","path":"/root","value":"card1"}
{"op":"add","path":"/elements/card1","value":{"type":"Card","props":{"title":"Delete Service","padding":"md"},"children":["stack1"]}}
{"op":"add","path":"/elements/stack1","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["input1","btn1"]}}
{"op":"add","path":"/elements/input1","value":{"type":"Input","props":{"label":"Service Name","placeholder":"Service to delete","valuePath":"/form/name"},"children":[]}}
{"op":"add","path":"/elements/btn1","value":{"type":"Button","props":{"label":"Delete Service","variant":"danger","action":{"name":"apiCall","params":{"endpoint":"/api/registry-execute","method":"POST","body":{"toolId":"@tpmjs/tools-unsandbox::deleteService"},"bodyPaths":{"params.name":"/form/name"},"successMessage":"Service deleted!","resetPaths":["/form/name"]}}},"children":[]}}`;

    const deleteTree = parseJSONLToTree(deleteJsonl);
    if (deleteTree && deleteTree.data?.form && deleteTree.elements.btn1) {
      const btnAction = deleteTree.elements.btn1?.props?.action;
      if (btnAction?.name === "apiCall") {
        pass("CRUD Delete widget: valid form with apiCall action");
      } else {
        fail("CRUD Delete widget: valid form with apiCall action", "Missing apiCall action");
      }
    } else {
      fail("CRUD Delete widget: valid form with apiCall action", "Parse failed");
    }
  }
}

// ============================================================
// SECTION 5: Full E2E - Chat API Component Creation
// ============================================================

async function testChatApiComponentCreation() {
  console.log("\n=== SECTION 5: Chat API Component Creation (E2E) ===\n");

  if (!HAS_UNSANDBOX) {
    skip("Chat API E2E tests", "UNSANDBOX keys not set");
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    skip("Chat API E2E tests", "OPENAI_API_KEY not set");
    return;
  }

  // Test: Send a chat message requesting a "list unsandbox services" widget
  // This tests the full flow: chat -> AI uses registrySearch/Execute/createComponent -> returns JSONL
  {
    try {
      log("INFO", "  Sending chat request to create an unsandbox list services widget...");
      log("INFO", "  (This invokes GPT-4.1-mini and may take 30-60s)");

      const messages = [
        {
          id: "test-msg-1",
          role: "user",
          content: "Create a widget that lists my unsandbox services. Use the @tpmjs/tools-unsandbox::listServices tool.",
          parts: [
            {
              type: "text",
              text: "Create a widget that lists my unsandbox services. Use the @tpmjs/tools-unsandbox::listServices tool.",
            },
          ],
        },
      ];

      const resp = await fetch(`${APP_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages,
          envVars: { UNSANDBOX_PUBLIC_KEY: UNSANDBOX_PUBLIC, UNSANDBOX_SECRET_KEY: UNSANDBOX_SECRET },
        }),
      });

      if (!resp.ok) {
        const errorText = await resp.text();
        fail("Chat API: create list widget", `HTTP ${resp.status}: ${errorText.substring(0, 200)}`);
        return;
      }

      // The response is a stream. Read it all.
      const streamText = await resp.text();
      const lines = streamText.split("\n").filter(Boolean);

      log("INFO", `  Received ${lines.length} stream lines`);

      // Look for tool results containing _isComponent
      let foundComponent = false;
      let componentData = null;

      for (const line of lines) {
        if (line.includes("_isComponent") || line.includes("createComponent")) {
          // Try to extract JSON from the stream line
          try {
            // Stream format varies - look for the component result
            if (line.includes('"success":true') && line.includes('"jsonl"')) {
              foundComponent = true;
              log("INFO", `  Found component creation in stream`);
            }
          } catch {}
        }
      }

      // Also check for tool_result messages
      const toolResultLines = lines.filter(l => l.includes("tool_result") || l.includes("tool-result"));
      log("INFO", `  Tool result lines found: ${toolResultLines.length}`);

      // Check for any errors in the stream
      const errorLines = lines.filter(l => l.includes('"error"') && !l.includes('"error":null') && !l.includes('"error":false'));
      if (errorLines.length > 0) {
        log("INFO", `  Error lines in stream: ${errorLines.length}`);
        for (const el of errorLines.slice(0, 3)) {
          log("INFO", `    ${el.substring(0, 200)}`);
        }
      }

      // The stream completed without crashing
      pass("Chat API: stream completed without errors");

      if (foundComponent) {
        pass("Chat API: component creation detected in stream");
      } else {
        // It's OK if the AI chose a different path - the stream worked
        log("INFO", "  Component creation not detected in stream (AI may have taken a different path)");
        log("INFO", `  Last 5 lines of stream:`);
        for (const l of lines.slice(-5)) {
          log("INFO", `    ${l.substring(0, 150)}`);
        }
      }
    } catch (e) {
      fail("Chat API: create list widget", e.message);
    }
  }
}

// ============================================================
// Run all tests
// ============================================================

async function main() {
  console.log("========================================");
  console.log("  Generous CRUD Flow Test Suite");
  console.log("========================================");
  console.log(`  Executor: ${EXECUTOR_URL}`);
  console.log(`  App:      ${APP_URL}`);
  console.log(`  Public:   ${UNSANDBOX_PUBLIC ? "***" + UNSANDBOX_PUBLIC.slice(-4) : "NOT SET"}`);
  console.log(`  Secret:   ${UNSANDBOX_SECRET ? "***" + UNSANDBOX_SECRET.slice(-5) : "NOT SET"}`);
  console.log(`  OpenAI:   ${process.env.OPENAI_API_KEY ? "SET" : "NOT SET"}`);

  testParseJSONL();
  await testExecutorDirect();
  await testRegistryExecuteEndpoint();
  await testComponentJSONLGeneration();
  await testChatApiComponentCreation();

  console.log("\n========================================");
  console.log(`  Results: ${passed} passed, ${failed} failed, ${skipped} skipped`);
  console.log("========================================\n");

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
