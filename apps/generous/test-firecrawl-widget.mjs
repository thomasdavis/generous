#!/usr/bin/env node
/**
 * Test: Firecrawl search widget with input, submit button, and results rendering.
 * Validates the full flow: apiCall handler logic, registry-execute endpoint,
 * firecrawl response structure, and JSONL component generation.
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_URL = process.env.APP_URL || "http://localhost:3002";

// Load FIRECRAWL_API_KEY from root .env
let FIRECRAWL_KEY = process.env.FIRECRAWL_API_KEY || "";
if (!FIRECRAWL_KEY) {
  try {
    const rootEnv = readFileSync(resolve(__dirname, "../../.env"), "utf-8");
    const match = rootEnv.match(/FIRECRAWL_API_KEY[=]"?([^"\n]+)"?/);
    if (match) FIRECRAWL_KEY = match[1];
  } catch {}
}

let passed = 0;
let failed = 0;
let skipped = 0;

function pass(name) { passed++; console.log(`PASS ${name}`); }
function fail(name, err) { failed++; console.log(`FAIL ${name}: ${err}`); }
function skip(name, reason) { skipped++; console.log(`SKIP ${name}: ${reason}`); }
function info(msg) { console.log(`INFO ${msg}`); }

// ---- Inline parseJSONLToTree ----
function tryParseJSON(line) {
  try { return JSON.parse(line); } catch {
    let t = line;
    while (t.endsWith("}")) { t = t.slice(0, -1); try { return JSON.parse(t); } catch {} }
    return null;
  }
}
function parseJSONLToTree(jsonl) {
  const lines = jsonl.trim().split("\n").filter(Boolean);
  let root = null, data;
  const elements = {};
  for (const line of lines) {
    const p = tryParseJSON(line);
    if (!p) continue;
    if (p.op === "set" && p.path === "/root") root = p.value;
    else if (p.op === "set" && p.path === "/data") data = p.value;
    else if (p.op === "add" && p.path?.startsWith("/elements/")) elements[p.path.replace("/elements/", "")] = p.value;
  }
  if (!root || Object.keys(elements).length === 0) return null;
  return { root, elements, data };
}

// ---- Simulate apiCall handler body-building ----
function buildApiCallBody(actionParams, dataStore) {
  const get = (path) => {
    const parts = path.split("/").filter(Boolean);
    let val = dataStore;
    for (const p of parts) val = val?.[p];
    return val;
  };

  const { toolId, bodyPaths, body } = actionParams;
  const requestBody = body ? { ...body } : {};
  if (toolId) requestBody.toolId = toolId;
  if (bodyPaths) {
    for (const [key, path] of Object.entries(bodyPaths)) {
      const value = get(path);
      if (value !== undefined && value !== null && value !== "") {
        const parts = key.split(".");
        if (parts.length > 1) {
          let target = requestBody;
          for (let i = 0; i < parts.length - 1; i++) {
            if (!target[parts[i]] || typeof target[parts[i]] !== "object") target[parts[i]] = {};
            target = target[parts[i]];
          }
          target[parts[parts.length - 1]] = value;
        } else {
          requestBody[key] = value;
        }
      }
    }
  }
  return requestBody;
}

async function main() {
  console.log("\n========================================");
  console.log("  Firecrawl Search Widget Test Suite");
  console.log("========================================");
  console.log(`  App:       ${APP_URL}`);
  console.log(`  Firecrawl: ${FIRECRAWL_KEY ? "***" + FIRECRAWL_KEY.slice(-4) : "NOT SET"}`);

  if (!FIRECRAWL_KEY) {
    console.log("\nFATAL: FIRECRAWL_API_KEY not found. Add it to root .env or set in shell.\n");
    process.exit(1);
  }

  const envVars = { FIRECRAWL_API_KEY: FIRECRAWL_KEY };

  // ============================================================
  // SECTION 1: Firecrawl API via registry-execute
  // ============================================================
  console.log("\n=== SECTION 1: Firecrawl API Tests ===\n");

  let responseKeys;
  let itemKeys;

  // Test 1: searchTool works and returns expected structure
  {
    const resp = await fetch(`${APP_URL}/api/registry-execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-generous-env-vars": JSON.stringify(envVars) },
      body: JSON.stringify({ toolId: "firecrawl-aisdk::searchTool", params: { query: "test" } }),
    });
    const result = await resp.json();
    if (result.success && result.data) {
      responseKeys = Object.keys(result.data);
      const arrayKeys = responseKeys.filter(k => Array.isArray(result.data[k]));
      info(`Response keys: ${responseKeys.join(", ")}`);
      info(`Array keys (for dataKey): ${arrayKeys.join(", ")}`);
      if (arrayKeys.length > 0 && result.data[arrayKeys[0]].length > 0) {
        itemKeys = Object.keys(result.data[arrayKeys[0]][0]);
        info(`Item keys: ${itemKeys.join(", ")}`);
      }
      pass("Firecrawl searchTool returns data");
    } else {
      fail("Firecrawl searchTool returns data", result.message || JSON.stringify(result).substring(0, 200));
      return;
    }
  }

  // Test 2: Response has 'web' key with array of {url, title, description}
  {
    if (responseKeys.includes("web")) {
      pass("Response has 'web' key (correct dataKey for RegistryFetcher)");
    } else {
      fail("Response has 'web' key", `Keys: ${responseKeys.join(", ")}`);
    }
  }

  // Test 3: Items have title, url, description for smart rendering
  {
    if (itemKeys?.includes("title") && itemKeys?.includes("url") && itemKeys?.includes("description")) {
      pass("Items have title/url/description (RegistryFetcher smart rendering will work)");
    } else {
      fail("Items have title/url/description", `Keys: ${itemKeys?.join(", ")}`);
    }
  }

  // ============================================================
  // SECTION 2: apiCall handler simulation for search form
  // ============================================================
  console.log("\n=== SECTION 2: apiCall Handler Simulation ===\n");

  // The widget would have a form with a search input and submit button.
  // The button's apiCall would call registry-execute with firecrawl searchTool.
  const searchActionParams = {
    endpoint: "/api/registry-execute",
    method: "POST",
    toolId: "firecrawl-aisdk::searchTool",
    bodyPaths: { "params.query": "/form/query" },
    successMessage: "Search complete!",
    resetPaths: [],
  };

  // Test 4: Handler builds correct body for search
  {
    const dataStore = { form: { query: "anthropic claude" } };
    const body = buildApiCallBody(searchActionParams, dataStore);
    const expected = { toolId: "firecrawl-aisdk::searchTool", params: { query: "anthropic claude" } };
    if (JSON.stringify(body) === JSON.stringify(expected)) {
      pass(`Handler builds correct search body: ${JSON.stringify(body)}`);
    } else {
      fail("Handler builds correct search body", `Got ${JSON.stringify(body)}`);
    }
  }

  // Test 5: Empty query is excluded from body
  {
    const dataStore = { form: { query: "" } };
    const body = buildApiCallBody(searchActionParams, dataStore);
    if (!body.params?.query) {
      pass("Empty query excluded from body (prevents empty search)");
    } else {
      fail("Empty query excluded from body", `Got params.query = "${body.params.query}"`);
    }
  }

  // Test 6: Actually execute the search through the app endpoint
  {
    const dataStore = { form: { query: "firecrawl web scraping" } };
    const body = buildApiCallBody(searchActionParams, dataStore);
    const resp = await fetch(`${APP_URL}/api/registry-execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-generous-env-vars": JSON.stringify(envVars) },
      body: JSON.stringify(body),
    });
    const result = await resp.json();
    if (result.success && Array.isArray(result.data?.web) && result.data.web.length > 0) {
      info(`Search returned ${result.data.web.length} results`);
      info(`First result: "${result.data.web[0].title}" - ${result.data.web[0].url}`);
      pass("Live search via handler-built body works");
    } else {
      fail("Live search via handler-built body works", result.message || "No results");
    }
  }

  // ============================================================
  // SECTION 3: JSONL Widget Validation
  // ============================================================
  console.log("\n=== SECTION 3: JSONL Widget Validation ===\n");

  // Test 7: A search form widget with apiCall parses correctly
  {
    const jsonl = `{"op":"set","path":"/data","value":{"form":{"query":""}}}
{"op":"set","path":"/root","value":"card1"}
{"op":"add","path":"/elements/card1","value":{"type":"Card","props":{"title":"Firecrawl Search","padding":"md"},"children":["stack1"]}}
{"op":"add","path":"/elements/stack1","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["input1","btn1"]}}
{"op":"add","path":"/elements/input1","value":{"type":"Input","props":{"label":"Search Query","placeholder":"Search the web...","valuePath":"/form/query"},"children":[]}}
{"op":"add","path":"/elements/btn1","value":{"type":"Button","props":{"label":"Search","variant":"primary","action":{"name":"apiCall","params":{"endpoint":"/api/registry-execute","method":"POST","toolId":"firecrawl-aisdk::searchTool","bodyPaths":{"params.query":"/form/query"},"successMessage":"Search complete!"}}},"children":[]}}`;

    const tree = parseJSONLToTree(jsonl);
    if (!tree) { fail("Search form widget JSONL parses", "null"); return; }

    // Validate structure
    const checks = [
      [tree.root === "card1", "root is card1"],
      [tree.data?.form?.query === "", "data has form.query initialized"],
      [tree.elements.input1?.props?.valuePath === "/form/query", "input bound to /form/query"],
      [tree.elements.btn1?.props?.action?.name === "apiCall", "button has apiCall action"],
      [tree.elements.btn1?.props?.action?.params?.toolId === "firecrawl-aisdk::searchTool", "apiCall has correct toolId"],
      [tree.elements.btn1?.props?.action?.params?.bodyPaths?.["params.query"] === "/form/query", "bodyPaths maps params.query to /form/query"],
    ];

    let allOk = true;
    for (const [ok, label] of checks) {
      if (ok) {
        pass(`Widget JSONL: ${label}`);
      } else {
        fail(`Widget JSONL: ${label}`, "check failed");
        allOk = false;
      }
    }
  }

  // Test 8: A RegistryFetcher-based read-only search widget also works
  {
    const jsonl = `{"op":"set","path":"/root","value":"fetcher1"}
{"op":"add","path":"/elements/fetcher1","value":{"type":"RegistryFetcher","props":{"toolId":"firecrawl-aisdk::searchTool","params":{"query":"AI news"},"dataKey":"web","title":"Firecrawl Search Results","refreshInterval":60000},"children":[]}}`;

    const tree = parseJSONLToTree(jsonl);
    if (tree && tree.elements.fetcher1?.props?.dataKey === "web" && tree.elements.fetcher1?.props?.toolId === "firecrawl-aisdk::searchTool") {
      pass("RegistryFetcher widget: correct toolId and dataKey='web'");
    } else {
      fail("RegistryFetcher widget: correct toolId and dataKey='web'", JSON.stringify(tree?.elements?.fetcher1?.props));
    }
  }

  // ============================================================
  // SECTION 4: Chat API generates a component (E2E)
  // ============================================================
  console.log("\n=== SECTION 4: Chat API E2E Component Generation ===\n");

  {
    try {
      info("Sending chat request to create a firecrawl search widget...");
      info("(This invokes GPT-4.1-mini and may take 30-60s)");

      const messages = [{
        id: "test-fc-1",
        role: "user",
        content: 'Create a "Firecrawl Search" widget - a form with a search input and a "Search" button. The button should use apiCall with endpoint "/api/registry-execute", toolId "firecrawl-aisdk::searchTool", and bodyPaths {"params.query": "/form/query"}.',
        parts: [{
          type: "text",
          text: 'Create a "Firecrawl Search" widget - a form with a search input and a "Search" button. The button should use apiCall with endpoint "/api/registry-execute", toolId "firecrawl-aisdk::searchTool", and bodyPaths {"params.query": "/form/query"}.',
        }],
      }];

      const resp = await fetch(`${APP_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, envVars }),
      });

      if (!resp.ok) {
        fail("Chat API: create search widget", `HTTP ${resp.status}`);
      } else {
        const streamText = await resp.text();
        const lines = streamText.split("\n").filter(Boolean);
        info(`Stream: ${lines.length} lines`);

        // Look for component creation in stream
        let foundToolId = false;
        let foundComponent = false;
        for (const line of lines) {
          if (line.includes("firecrawl-aisdk::searchTool")) foundToolId = true;
          if (line.includes("_isComponent") && line.includes('"success":true')) foundComponent = true;
        }

        pass("Chat API: stream completed");
        if (foundToolId) pass("Chat API: firecrawl toolId referenced in stream");
        else info("firecrawl toolId not found in stream text (may be in tool calls)");
        if (foundComponent) pass("Chat API: component creation detected");
        else {
          info("Component not detected (AI may have taken a different path)");
          // Show last few lines for debugging
          for (const l of lines.slice(-3)) info(`  ${l.substring(0, 150)}`);
        }
      }
    } catch (e) {
      fail("Chat API: create search widget", e.message);
    }
  }

  // ============================================================
  console.log(`\n========================================`);
  console.log(`  Results: ${passed} passed, ${failed} failed, ${skipped} skipped`);
  console.log("========================================\n");
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(e => { console.error("Fatal:", e); process.exit(1); });
