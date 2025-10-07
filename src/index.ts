/**
 * HTML Renderer Library - Main Entry Point
 *
 * This file provides a clean barrel export pattern for the entire library.
 * Import everything you need from this single entry point.
 *
 * @example
 * ```typescript
 * // Import the component
 * import HtmlRenderer from '@/components/htmlRenderer';
 *
 * // Import the composable
 * import { useHtmlRenderer } from '@/components/htmlRenderer';
 *
 * // Import types
 * import type { IHtmlRendererOptions, IHtmlRendererProps } from '@/components/htmlRenderer';
 *
 * // Import utilities
 * import { normalizeHtml, uid } from '@/components/htmlRenderer';
 * ```
 *
 * @module htmlRenderer
 */

// ============================================================================
// COMPONENT EXPORTS
// ============================================================================

/**
 * The main unified HtmlRenderer component.
 *
 * This is the default export, so you can import it as:
 * ```typescript
 * import HtmlRenderer from '@/components/htmlRenderer';
 * ```
 */
export { default } from './HtmlRenderer.vue'
export { default as HtmlRenderer } from './HtmlRenderer.vue'

// ============================================================================
// COMPOSABLE EXPORTS
// ============================================================================

/**
 * The unified HTML renderer composable.
 *
 * Provides programmatic access to rendering functionality.
 * Use this when you need more control than the component provides.
 */
export { useHtmlRenderer } from './composables/useHtmlRenderer'

// ============================================================================
// TYPE EXPORTS
// ============================================================================

/**
 * All TypeScript type definitions for the library.
 *
 * Import these for type-safe usage:
 * ```typescript
 * import type {
 *   IHtmlRendererOptions,
 *   IHtmlRendererProps,
 *   IHtmlRendererComposable,
 *   IScriptMeta,
 *   RenderMode
 * } from '@/components/htmlRenderer';
 * ```
 */
export type {
  IHtmlRendererOptions,
  IHtmlRendererProps,
  IHtmlRendererComposable,
  IScriptMeta,
  IFontFaceExtractionOptions,
} from './types'

export { RenderMode } from './types'

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

/**
 * Utility functions that can be used independently.
 *
 * These are framework-agnostic and can be used outside of Vue.
 */
export { uid, normalizeHtml, normalizeAttr, findPlaceholderNode } from './utils'

// ============================================================================
// RENDERER EXPORTS (Advanced Usage)
// ============================================================================

/**
 * Low-level renderer functions.
 *
 * These are exported for advanced use cases where you need direct access
 * to the rendering logic without the Vue wrapper.
 *
 * Most users should use the component or composable instead.
 */
export {
  renderIntoShadowRoot,
  clearShadowRoot,
  extractAndInjectFontFaces,
} from './renderers/shadowRenderer'

export {
  renderDirectly,
  clearElement,
  extractScriptsWithPlaceholders,
  createExecutableScript,
  insertScriptAtPlaceholder,
} from './renderers/directRenderer'
