/**
 * Utility Functions for HTML Renderer Library
 *
 * This module contains framework-agnostic utility functions used across
 * the HTML rendering system. These functions can be used independently
 * outside of Vue context.
 *
 * @module utils
 */

/**
 * Generate a unique identifier string.
 *
 * Creates a pseudo-random unique ID using timestamp and random values.
 * Useful for creating unique placeholder IDs for script tags.
 *
 * @returns A unique identifier string
 *
 * @example
 * ```ts
 * const id = uid(); // e.g., "uid-1234567890123-abc"
 * ```
 */
export function uid(): string {
  return `uid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Normalize HTML content for safe parsing.
 *
 * Handles various HTML encoding issues and ensures the HTML string
 * is in a format suitable for DOMParser or innerHTML assignment.
 *
 * This function:
 * - Trims whitespace
 * - Handles common HTML entity issues
 * - Ensures proper string format
 *
 * @param raw - The raw HTML string to normalize
 * @returns The normalized HTML string
 *
 * @example
 * ```ts
 * const normalized = normalizeHtml('  <div>Hello</div>  ');
 * // Returns: '<div>Hello</div>'
 * ```
 */
export function normalizeHtml(raw: string): string {
  if (!raw || typeof raw !== 'string') {
    return ''
  }

  // Trim whitespace and return
  return raw.trim()
}

/**
 * Normalize an attribute value for safe use.
 *
 * Cleans and normalizes attribute values extracted from HTML elements.
 * Handles edge cases like null, undefined, or malformed attribute values.
 *
 * @param val - The attribute value to normalize
 * @returns The normalized attribute value
 *
 * @example
 * ```ts
 * const normalized = normalizeAttr('  some-value  ');
 * // Returns: 'some-value'
 * ```
 */
export function normalizeAttr(val: string): string {
  if (!val || typeof val !== 'string') {
    return ''
  }

  // Trim whitespace and return
  return val.trim()
}

/**
 * Find a placeholder comment node by ID.
 *
 * Searches through a DOM tree to find a comment node with a specific ID.
 * Used by the direct renderer to locate where scripts should be inserted.
 *
 * The placeholder comments have the format: `<!-- SCRIPT_PLACEHOLDER:id -->`
 *
 * @param root - The root element to search within
 * @param id - The unique ID to search for
 * @returns The comment node if found, null otherwise
 *
 * @example
 * ```ts
 * const placeholder = findPlaceholderNode(document.body, 'script-123');
 * if (placeholder) {
 *   // Insert script at this location
 * }
 * ```
 */
export function findPlaceholderNode(root: ParentNode, id: string): Comment | null {
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_COMMENT,
    null
  )

  let node: Node | null
  while ((node = walker.nextNode())) {
    const comment = node as Comment
    // Check if comment matches the placeholder format
    if (comment.nodeValue?.includes(`SCRIPT_PLACEHOLDER:${id}`)) {
      return comment
    }
  }

  return null
}
