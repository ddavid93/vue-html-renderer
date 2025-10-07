/**
 * VueHTMLRenderer Library - Main Entry Point
 *
 * This library provides a Vue component for rendering HTML content with two modes:
 * - Direct Mode: with script execution
 * - Shadow Mode: with style isolation
 *
 * @example
 * ```typescript
 * // Import the component
 * import App from 'vue-html-renderer';
 * // or
 * import { App } from 'vue-html-renderer';
 *
 * // Import types for TypeScript
 * import type { IHtmlRendererProps } from 'vue-html-renderer';
 * ```
 *
 * @module VueHTMLRenderer
 */

// ============================================================================
// COMPONENT EXPORTS
// ============================================================================

/**
 * The main App component for rendering HTML content.
 *
 * This is the default export, so you can import it as:
 * ```typescript
 * import App from 'vue-html-renderer';
 * ```
 */
export { default } from './App.vue'
export { default as App } from './App.vue'

// ============================================================================
// TYPE EXPORTS
// ============================================================================

/**
 * TypeScript type definitions for the component props.
 *
 * Import these for type-safe usage:
 * ```typescript
 * import type { IHtmlRendererProps } from 'vue-html-renderer';
 * ```
 */
export type {
  IHtmlRendererProps,
} from './extras/types'
