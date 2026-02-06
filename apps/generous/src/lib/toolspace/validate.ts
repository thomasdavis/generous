/**
 * Toolspace Validation
 *
 * Validates tool execution requests against toolspace permission patterns.
 * Supports glob-like patterns for flexible tool matching.
 */

interface ToolspaceConfig {
  tools: string[]; // Array of tool patterns like "@stripe/*", "weather", etc.
  permissions: {
    allowRead?: boolean;
    allowWrite?: boolean;
    allowDelete?: boolean;
    allowExternalApi?: boolean;
  };
}

/**
 * Check if a tool ID matches a pattern.
 * Supports:
 * - Exact match: "weather" matches "weather"
 * - Wildcard suffix: "@stripe/*" matches "@stripe/createPayment"
 * - Full wildcard: "*" matches everything
 */
export function matchToolPattern(toolId: string, pattern: string): boolean {
  // Full wildcard
  if (pattern === "*") {
    return true;
  }

  // Exact match
  if (pattern === toolId) {
    return true;
  }

  // Wildcard suffix: "prefix/*"
  if (pattern.endsWith("/*")) {
    const prefix = pattern.slice(0, -2);
    return toolId.startsWith(`${prefix}/`) || toolId === prefix;
  }

  // Wildcard prefix: "*/suffix"
  if (pattern.startsWith("*/")) {
    const suffix = pattern.slice(2);
    return toolId.endsWith(`/${suffix}`) || toolId === suffix;
  }

  // Contains wildcard: "prefix/*/suffix"
  if (pattern.includes("/*")) {
    const parts = pattern.split("/*");
    if (parts.length === 2) {
      const [prefix, suffix] = parts;
      return toolId.startsWith(`${prefix}/`) && toolId.endsWith(suffix);
    }
  }

  return false;
}

/**
 * Check if a tool is allowed in a toolspace.
 */
export function isToolAllowed(toolId: string, toolspace: ToolspaceConfig): boolean {
  // If no tools specified, allow all
  if (!toolspace.tools || toolspace.tools.length === 0) {
    return true;
  }

  // Check if tool matches any pattern
  return toolspace.tools.some((pattern) => matchToolPattern(toolId, pattern));
}

/**
 * Check if a specific permission is granted.
 */
export function hasPermission(
  toolspace: ToolspaceConfig,
  permission: keyof ToolspaceConfig["permissions"],
): boolean {
  if (!toolspace.permissions) {
    return true; // No restrictions
  }
  return toolspace.permissions[permission] !== false;
}

/**
 * Validate a tool execution request against toolspace.
 * Returns an error message if validation fails, null if allowed.
 */
export function validateToolExecution(
  toolId: string,
  toolspace: ToolspaceConfig,
  operationType: "read" | "write" | "delete" | "external" = "read",
): string | null {
  // Check if tool is in allowed list
  if (!isToolAllowed(toolId, toolspace)) {
    return `Tool "${toolId}" is not allowed in this toolspace`;
  }

  // Check operation permissions
  const permissionMap: Record<string, keyof ToolspaceConfig["permissions"]> = {
    read: "allowRead",
    write: "allowWrite",
    delete: "allowDelete",
    external: "allowExternalApi",
  };

  const requiredPermission = permissionMap[operationType];
  if (requiredPermission && !hasPermission(toolspace, requiredPermission)) {
    return `Operation "${operationType}" is not allowed in this toolspace`;
  }

  return null;
}

/**
 * Parse tool patterns from a string (comma or newline separated).
 */
export function parseToolPatterns(input: string): string[] {
  return input
    .split(/[,\n]/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

/**
 * Categorize a tool ID to help with organization.
 */
export function categorizeToolId(toolId: string): string {
  // Registry tools: @namespace/tool
  if (toolId.startsWith("@")) {
    const namespace = toolId.split("/")[0];
    return namespace;
  }

  // Built-in tools by common prefixes
  const builtInCategories: Record<string, string> = {
    get: "Read",
    list: "Read",
    search: "Read",
    create: "Write",
    add: "Write",
    update: "Write",
    delete: "Delete",
    remove: "Delete",
  };

  const lowerTool = toolId.toLowerCase();
  for (const [prefix, category] of Object.entries(builtInCategories)) {
    if (lowerTool.startsWith(prefix)) {
      return category;
    }
  }

  return "Other";
}
