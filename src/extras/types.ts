/**
 * TypeScript Type Definitions for HTML Renderer Library
 *
 * This file contains all type definitions used across the HTML rendering system.
 * It serves as the single source of truth for type contracts between components,
 * composables, and utilities.
 */

import type { Ref } from 'vue'

/**
 * Configuration options for the HTML renderer composable
 */
export interface IHtmlRendererOptions {
  /**
   * The raw HTML string to be rendered.
   * Can be a complete HTML document or a fragment.
   */
  html: string

  /**
   * Whether to render in Shadow DOM mode.
   *
   * - `false` (default): Renders HTML directly with script execution support.
   *   Use this when you need JavaScript to run (e.g., interactive content).
   *
   * - `true`: Renders HTML in an isolated Shadow DOM with style scoping.
   *   Use this when you need style isolation and don't need script execution.
   *
   * @default false
   */
  isShadow?: boolean
}

/**
 * Return type for the useHtmlRenderer composable
 */
export interface IHtmlRendererComposable {
  /**
   * Template ref to bind to the host container element.
   * The renderer will attach content to this element.
   *
   * @example
   * ```vue
   * <template>
   *   <div :ref="hostRef"></div>
   * </template>
   * ```
   */
  hostRef: Ref<HTMLElement | undefined>

  /**
   * Function to clear all rendered content from the host element.
   * Useful for manual cleanup or re-rendering scenarios.
   */
  clear: () => void

  /**
   * Reference to the Shadow Root (only available when isShadow=true).
   * Will be undefined in non-shadow mode.
   */
  shadowRoot?: Ref<ShadowRoot | undefined>
}

/**
 * Props for the HtmlRenderer Vue component
 */
export interface IHtmlRendererProps {
  /**
   * The raw HTML string to be rendered.
   * Required prop that contains the content to display.
   */
  html: string

  /**
   * Whether to render in Shadow DOM mode.
   *
   * - `false` (default): Direct rendering with script execution
   * - `true`: Shadow DOM rendering with style isolation
   *
   * @default false
   */
  isShadow?: boolean
}

/**
 * Metadata for a <script> tag extracted from HTML.
 * Used internally by the non-shadow renderer for script execution.
 */
export interface IScriptMeta {
  /**
   * Unique identifier for this script instance.
   * Used to create and locate placeholder comments in the DOM.
   */
  id: string

  /**
   * Raw attributes copied from the original script tag.
   * Preserved exactly as they appeared in the source HTML.
   */
  attrs: Record<string, string>

  /**
   * Inline script code content.
   * Null if the script uses an external source (src attribute).
   */
  code: string | null

  /**
   * Whether the script has a src attribute (external script).
   */
  hasSrc: boolean

  /**
   * Whether the script has the async attribute.
   * Async scripts execute independently without blocking.
   */
  isAsync: boolean

  /**
   * Whether the script has the defer attribute.
   * Defer scripts execute after DOM parsing in document order.
   */
  isDefer: boolean

  /**
   * Whether the script is a module (type="module").
   * Module scripts have special loading and execution semantics.
   */
  isModule: boolean
}

/**
 * Rendering mode enum for better type safety
 */
export enum RenderMode {
  /**
   * Direct rendering with script execution support.
   * Scripts are executed respecting async/defer/sequential semantics.
   */
  Direct = 'direct',

  /**
   * Shadow DOM rendering with style isolation.
   * Scripts are NOT executed; styles are scoped to shadow tree.
   */
  Shadow = 'shadow',
}

/**
 * Configuration for font-face extraction (Shadow DOM mode only)
 */
export interface IFontFaceExtractionOptions {
  /**
   * ID for the style element that will be created in the main document.
   * This allows multiple shadow instances to share the same font declarations.
   *
   * @default "shadow-dom-fonts"
   */
  styleElementId?: string

  /**
   * Whether to avoid duplicate font-face rules.
   * When true, only unique rules are injected.
   *
   * @default true
   */
  preventDuplicates?: boolean
}
