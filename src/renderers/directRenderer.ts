/**
 * Direct DOM Renderer Implementation
 *
 * This module contains the core logic for rendering HTML content directly into the DOM
 * with full script execution support.
 *
 * Key Features:
 * - Direct DOM rendering (no Shadow DOM isolation)
 * - Full script execution with browser-like semantics
 * - Supports async, defer, and sequential script execution
 * - Supports module scripts (type="module")
 * - Handles both inline and external scripts
 *
 * Script Execution Semantics:
 * - Sequential scripts (no async/defer): Execute in document order, each waits for previous
 * - Async scripts: Execute independently without blocking
 * - Defer scripts: Execute after DOM is ready, in document order
 * - Module scripts: Respect type="module" with async/defer attributes
 *
 * @module directRenderer
 */

import { nextTick } from 'vue'
import { findPlaceholderNode, normalizeAttr, normalizeHtml, uid } from '../extras/utils'
import type { IScriptMeta } from '../extras/types'

/**
 * Extract all <script> elements from a container and replace each with a
 * uniquely-identifiable comment placeholder.
 *
 * This is necessary because scripts inserted via innerHTML won't execute.
 * We need to recreate them as fresh <script> elements after the DOM is inserted.
 *
 * The placeholder comments allow us to re-insert scripts at their exact
 * original positions in the DOM tree.
 *
 * @param container - The container element containing the parsed HTML
 * @returns Array of script metadata objects
 *
 * @example
 * ```ts
 * const temp = document.createElement('div');
 * temp.innerHTML = htmlString;
 * const scripts = extractScriptsWithPlaceholders(temp);
 * ```
 */
export function extractScriptsWithPlaceholders(container: HTMLElement): IScriptMeta[] {
  const metas: IScriptMeta[] = []
  // Query scripts in tree order so placeholders keep the original positions
  const scripts = Array.from(container.querySelectorAll('script'))

  for (const oldScript of scripts) {
    const id = uid() // unique id used to locate placeholder later within the host

    // Copy raw attributes so we can faithfully recreate the element
    const attrs: Record<string, string> = {}
    for (const attr of Array.from(oldScript.attributes)) {
      attrs[attr.name] = attr.value
    }

    // Determine grouping semantics
    const isAsync = oldScript.hasAttribute('async')
    const isDefer = oldScript.hasAttribute('defer')
    const typeAttr = (attrs['type'] || '').trim().toLowerCase()
    const isModule = typeAttr === 'module'

    // Inline code is preserved; external scripts have code = null
    const code = oldScript.src ? null : (oldScript.textContent ?? '')

    // Replace the original <script> with a comment placeholder so that later
    // we can swap it for a freshly-created <script> that the browser will execute.
    const placeholder = document.createComment(`DYNAMIC_HTML_SCRIPT:${id}`)
    oldScript.replaceWith(placeholder)

    metas.push({
      id,
      attrs,
      code,
      hasSrc: !!oldScript.src,
      isAsync,
      isDefer,
      isModule,
    })
  }

  return metas
}

/**
 * Create a fresh executable <script> element from IScriptMeta.
 *
 * This function:
 * - Forwards non-special attributes exactly as provided
 * - Applies special flags (async/defer/type/src) explicitly for correct semantics
 * - Normalizes src attribute to handle quoting/escaping issues
 * - Sets textContent for inline scripts
 *
 * @param meta - Script metadata object
 * @returns A fresh HTMLScriptElement ready to be inserted into the DOM
 *
 * @example
 * ```ts
 * const script = createExecutableScript(scriptMeta);
 * document.body.appendChild(script);
 * ```
 */
export function createExecutableScript(meta: IScriptMeta): HTMLScriptElement {
  const s = document.createElement('script')

  // Forward non-special attributes exactly as provided
  for (const [k, v] of Object.entries(meta.attrs)) {
    if (k === 'async' || k === 'defer' || k === 'type' || k === 'src') continue
    s.setAttribute(k, v)
  }

  // Apply special flags explicitly so DOM properties/semantics are correct
  if (meta.isModule) s.type = 'module'
  if (meta.isAsync) s.async = true
  if (meta.isDefer) s.defer = true

  if (meta.hasSrc && meta.attrs['src']) {
    s.src = normalizeAttr(meta.attrs['src'])
  } else if (meta.code != null) {
    s.textContent = meta.code
  }

  return s
}

/**
 * Insert a freshly-created <script> at its placeholder location and wait for completion.
 *
 * For external scripts (with src):
 * - Resolves on load event
 * - Resolves on error event (logs error but doesn't throw)
 *
 * For inline scripts:
 * - Browser executes synchronously when inserted
 * - We resolve on next microtask to model completion without blocking
 *
 * @param root - The root element containing the placeholder
 * @param meta - Script metadata object
 * @returns Promise that resolves when script has finished executing or loading
 *
 * @example
 * ```ts
 * await insertScriptAtPlaceholder(document.body, scriptMeta);
 * ```
 */
export function insertScriptAtPlaceholder(root: ParentNode, meta: IScriptMeta): Promise<void> {
  return new Promise<void>((resolve) => {
    const placeholder = findPlaceholderNode(root, meta.id)
    if (!placeholder) {
      // Defensive: if placeholder is missing (e.g., removed by user), treat as no-op
      resolve()
      return
    }

    const s = createExecutableScript(meta)

    if (meta.hasSrc && meta.attrs['src']) {
      // External: wire both load and error so we always resolve and never leak a pending promise
      s.addEventListener('load', () => resolve(), { once: true })
      s.addEventListener(
        'error',
        (e) => {
          console.error(`Error loading script ${meta.attrs['src']}`, e)
          resolve()
        },
        { once: true },
      )
      placeholder.replaceWith(s)
    } else {
      // Inline: replacing the node triggers synchronous execution in real browsers; we model
      // completion at microtask boundary to preserve order while allowing the DOM to update.
      placeholder.replaceWith(s)
      queueMicrotask(() => resolve())
    }
  })
}

/**
 * Render HTML content directly into a target element with full script execution.
 *
 * This function:
 * 1. Clears the target element
 * 2. Parses HTML and extracts scripts (replacing with placeholders)
 * 3. Appends all content (including placeholders) to the target
 * 4. Executes scripts in proper order:
 *    - Sequential scripts: Execute in order, each waits for previous
 *    - Async scripts: Execute independently without blocking
 *    - Defer scripts: Execute after Vue nextTick, in order
 *
 * Script execution mirrors browser behavior to ensure proper timing and ordering.
 *
 * @param target - The target element to render into
 * @param html - The HTML string to render
 * @returns Promise that resolves when all sequential and defer scripts have completed
 *
 * @example
 * ```ts
 * const container = document.getElementById('content');
 * await renderDirectly(container, htmlString);
 * ```
 */
export async function renderDirectly(target: HTMLElement, html: string): Promise<void> {
  // Clear existing content
  while (target.firstChild) {
    target.removeChild(target.firstChild)
  }

  const temp = document.createElement('div')
  temp.innerHTML = normalizeHtml(html)

  const scriptMetas = extractScriptsWithPlaceholders(temp)

  // Append all nodes (including placeholders) at once to reduce layout thrashing
  const frag = document.createDocumentFragment()
  while (temp.firstChild) {
    frag.appendChild(temp.firstChild)
  }
  target.appendChild(frag)

  // Group scripts for the correct execution order
  const sequential: IScriptMeta[] = []
  const asyncScripts: IScriptMeta[] = []
  const deferScripts: IScriptMeta[] = []

  for (const m of scriptMetas) {
    if (m.isAsync) {
      asyncScripts.push(m)
    } else if (m.isDefer) {
      deferScripts.push(m)
    } else {
      sequential.push(m)
    }
  }

  // 1) Run sequential scripts in-order; each waits for previous to finish
  for (const m of sequential) {
    await insertScriptAtPlaceholder(target, m)
  }

  // 2) Fire async scripts without awaiting their completion
  for (const m of asyncScripts) {
    void insertScriptAtPlaceholder(target, m)
  }

  // 3) After Vue DOM flush, run defer scripts in-order
  await nextTick()
  for (const m of deferScripts) {
    await insertScriptAtPlaceholder(target, m)
  }
}

/**
 * Clear all children from a target element.
 *
 * This is a utility function for cleanup operations. It uses a while loop
 * with removeChild for deterministic cleanup.
 *
 * @param target - The element to clear
 *
 * @example
 * ```ts
 * clearElement(container);
 * ```
 */
export function clearElement(target: HTMLElement): void {
  while (target.firstChild) {
    target.removeChild(target.firstChild)
  }
}
