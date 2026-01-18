/**
 * Class name utility for merging CSS module classes with conditional classes.
 *
 * This is a minimal utility that doesn't require external dependencies.
 * For more advanced use cases, consider using clsx + tailwind-merge.
 */

type ClassValue = string | undefined | null | false | 0 | (string | undefined | null | false | 0)[];

/**
 * Combines multiple class values into a single string.
 * Filters out falsy values and flattens arrays.
 *
 * @example
 * cn('foo', 'bar') // 'foo bar'
 * cn('foo', false && 'bar', 'baz') // 'foo baz'
 * cn('foo', ['bar', 'baz']) // 'foo bar baz'
 * cn(styles.button, isActive && styles.active) // 'button_abc123 active_def456'
 */
export function cn(...inputs: ClassValue[]): string {
  const result: string[] = [];

  for (const input of inputs) {
    if (Array.isArray(input)) {
      for (const item of input) {
        if (typeof item === "string" && item.length > 0) {
          result.push(item);
        }
      }
    } else if (typeof input === "string" && input.length > 0) {
      result.push(input);
    }
  }

  return result.join(" ");
}

/**
 * Creates a variant class selector for data attributes.
 * Used with CSS modules that use [data-*] selectors.
 *
 * @example
 * dataAttr('variant', 'primary') // { 'data-variant': 'primary' }
 * <Button {...dataAttr('size', 'lg')} />
 */
export function dataAttr<T extends string>(
  name: string,
  value: T | undefined | null | false,
): Record<string, T> | Record<string, never> {
  if (!value) return {};
  return { [`data-${name}`]: value };
}

/**
 * Combines data attributes for multiple variants.
 *
 * @example
 * dataAttrs({ variant: 'primary', size: 'lg' })
 * // { 'data-variant': 'primary', 'data-size': 'lg' }
 */
export function dataAttrs(
  attrs: Record<string, string | undefined | null | false | boolean>,
): Record<string, string | "true"> {
  const result: Record<string, string | "true"> = {};

  for (const [key, value] of Object.entries(attrs)) {
    if (value === true) {
      result[`data-${key}`] = "true";
    } else if (value && typeof value === "string") {
      result[`data-${key}`] = value;
    }
  }

  return result;
}
