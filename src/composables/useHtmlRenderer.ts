/**
 * Unified HTML Renderer Composable
 *
 * This composable provides a unified interface for rendering HTML content with two modes:
 *
 * 1. **Direct Mode** (isShadow=false, default):
 *    - Renders HTML directly into the DOM
 *    - Full script execution support (async, defer, sequential, module)
 *    - No style isolation
 *    - Use when you need JavaScript to run
 *
 * 2. **Shadow Mode** (isShadow=true):
 *    - Renders HTML in isolated Shadow DOM
 *    - Complete style isolation
 *    - Preserves full HTML structure (html, head, body tags)
 *    - Extracts and injects @font-face rules for proper font loading
 *    - No script execution (by design)
 *    - Use when you need style isolation
 *
 * @module useHtmlRenderer
 */

import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { IHtmlRendererComposable, IHtmlRendererOptions } from '../extras/types'
import { clearShadowRoot, renderIntoShadowRoot } from '../renderers/shadowRenderer'
import { clearElement, renderDirectly } from '../renderers/directRenderer'

/**
 * useHtmlRenderer
 *
 * A Vue 3 composable that renders HTML content with configurable rendering modes.
 *
 * **How it works:**
 *
 * Direct Mode (isShadow=false):
 * 1. Attaches to the host element on mount
 * 2. Parses HTML and extracts scripts (replacing with placeholders)
 * 3. Appends content to the host
 * 4. Executes scripts in proper order (sequential, async, defer)
 *
 * Shadow Mode (isShadow=true):
 * 1. Attaches a shadow root to the host element on mount
 * 2. Parses HTML using DOMParser to preserve structure
 * 3. Extracts @font-face rules and injects into main document
 * 4. Imports and appends entire HTML structure to shadow root
 *
 * **Usage Examples:**
 *
 * ```ts
 * // Direct mode with script execution
 * const { hostRef } = useHtmlRenderer({
 *   html: '<div><script>console.log("Hello")</script></div>',
 *   isShadow: false
 * });
 *
 * // Shadow mode with style isolation
 * const { hostRef, shadowRoot } = useHtmlRenderer({
 *   html: '<html><head><style>body { color: red; }</style></head><body>Content</body></html>',
 *   isShadow: true
 * });
 * ```
 *
 * @param options - Configuration options
 * @param options.html - The HTML string to render
 * @param options.isShadow - Whether to use Shadow DOM mode (default: false)
 *
 * @returns Object containing:
 * - hostRef: Template ref to bind to a container element
 * - clear: Function to remove all rendered content
 * - shadowRoot: Ref to shadow root (only in shadow mode)
 *
 * @example
 * ```vue
 * <template>
 *   <div :ref="hostRef"></div>
 * </template>
 *
 * <script setup lang="ts">
 * import { useHtmlRenderer } from './composables/useHtmlRenderer';
 *
 * const { hostRef } = useHtmlRenderer({
 *   html: '<div>Content</div>',
 *   isShadow: false
 * });
 * </script>
 * ```
 */
export function useHtmlRenderer(options: IHtmlRendererOptions): IHtmlRendererComposable {
  const { html, isShadow = false } = options

  const hostRef = ref<HTMLElement>()
  const shadowRoot = ref<ShadowRoot>()
  // When used inside a Custom Element (ShadowRoot), render into a light-DOM sibling container
  // placed adjacent to the custom element host. Otherwise render into the internal host div.
  const targetRef = ref<HTMLElement>()

  /**
   * Get the target element for rendering.
   * Returns targetRef if set (for Custom Element scenarios), otherwise hostRef.
   */
  function getTargetEl(): HTMLElement | undefined {
    return targetRef.value ?? hostRef.value
  }

  /**
   * Clear all rendered content from the host element or shadow root.
   *
   * This function adapts its behavior based on the rendering mode:
   * - Shadow mode: Clears shadow root content
   * - Direct mode: Clears target element content
   */
  function clear(): void {
    if (isShadow && shadowRoot.value) {
      clearShadowRoot(shadowRoot.value)
    } else {
      const target = getTargetEl()
      if (target) {
        clearElement(target)
      }
    }
  }

  /**
   * Render HTML content based on the selected mode.
   *
   * This is the main rendering orchestrator that delegates to the appropriate
   * renderer based on the isShadow flag.
   */
  async function render(): Promise<void> {
    if (isShadow) {
      // Shadow DOM mode: Render with style isolation
      if (!shadowRoot.value) {
        console.error('Shadow root not available for rendering')
        return
      }
      renderIntoShadowRoot(shadowRoot.value, html)
    } else {
      // Direct mode: Render with script execution
      const target = getTargetEl()
      if (!target) {
        console.error('Target element not available for rendering')
        return
      }
      await renderDirectly(target, html)
    }
  }

  /**
   * Lifecycle: Mount
   *
   * Sets up the rendering environment and performs initial render.
   *
   * Shadow Mode:
   * - Attaches shadow root in open mode
   * - Renders HTML into shadow root
   *
   * Direct Mode:
   * - Checks if mounted inside a Custom Element
   * - Creates external container if needed (for Custom Element scenarios)
   * - Renders HTML directly
   */
  onMounted(() => {
    if (!hostRef.value) return

    if (isShadow) {
      // Shadow DOM mode: Attach shadow root
      try {
        shadowRoot.value = hostRef.value.attachShadow({ mode: 'open' })
      } catch (e) {
        console.error('Failed to attach shadow root:', e)
        return
      }
    } else {
      // Direct mode: Check if we're inside a Custom Element and need external container
      try {
        const root = hostRef.value.getRootNode?.()
        if (root && (root as any).host && typeof (root as any).host === 'object') {
          // Likely a ShadowRoot - render outside into light DOM
          const shadowRootNode = root as ShadowRoot
          const ceHost = shadowRootNode.host as HTMLElement
          const parent = ceHost.parentNode as (Node & ParentNode) | null
          if (parent && typeof (parent as any).insertBefore === 'function') {
            const external = document.createElement('div')
            external.setAttribute('data-html-render-target', '')
            // Insert right after the custom element host for visual adjacency
            parent.insertBefore(external, ceHost.nextSibling)
            targetRef.value = external
            // Mark for cleanup on unmount
            ;(targetRef.value as any).__external_owner = true
          }
        }
      } catch {
        // Fallback silently to internal host
      }
    }

    // Perform initial render
    void render()
  })

  /**
   * Lifecycle: Before Unmount
   *
   * Cleans up rendered content before the component unmounts.
   *
   * Shadow Mode:
   * - Clears shadow root content
   *
   * Direct Mode:
   * - Clears target element content
   * - Removes external container if one was created
   */
  onBeforeUnmount(() => {
    // Clear content safely
    try {
      clear()
    } catch (e) {
      if (typeof console !== 'undefined' && typeof console.debug === 'function') {
        console.debug('useHtmlRenderer: clear() failed during unmount', e)
      }
    }

    // If an external container was created by this instance, remove it from the DOM
    if (!isShadow) {
      const external = targetRef.value as any
      if (external && external.__external_owner) {
        if (external.parentNode) {
          external.parentNode.removeChild(external)
        }
        targetRef.value = undefined as any
      }
    }
  })

  // Return appropriate interface based on mode
  if (isShadow) {
    return { hostRef, clear, shadowRoot }
  } else {
    return { hostRef, clear }
  }
}
