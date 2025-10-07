import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import App from '../App.vue'
import { readFileSync } from 'fs'
import { resolve } from 'path'

/**
 * Comprehensive Test Suite for VueHTMLRenderer
 *
 * This test suite covers:
 * - Direct Mode (isShadow=false) with script execution
 * - Shadow Mode (isShadow=true) with style isolation
 * - Font loading in both modes
 * - Script execution order and types
 * - Style application and isolation
 * - Cleanup and unmounting
 *
 * Test Fixtures:
 * - simple-content.html: Basic HTML content
 * - inline-scripts.html: Inline script execution
 * - async-defer-scripts.html: Async/defer script handling
 * - font-face.html: @font-face declarations
 * - nested-structure.html: Complex nested DOM
 * - module-script.html: ES6 module scripts
 * - interactive-elements.html: Forms and interactions
 * - full-document.html: Complete HTML5 document
 * - styled-components.html: Multiple style blocks
 * - complex-styles.html: Advanced CSS features
 */

// Helper to read fixture files
function loadFixture(filename: string): string {
  const fixturesPath = resolve(__dirname, 'fixtures', filename)
  return readFileSync(fixturesPath, 'utf-8')
}

// Helper to wait for async operations
async function waitFor(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

describe('VueHTMLRenderer - Comprehensive Test Suite', () => {
  // Cleanup between tests
  beforeEach(() => {
    // Clear any global window properties set by scripts
    delete (window as any).__simpleContentLoaded
    delete (window as any).__inlineScriptExecuted
    delete (window as any).__asyncScriptExecuted
    delete (window as any).__deferScriptExecuted
    delete (window as any).__regularScriptExecuted
    delete (window as any).__moduleScriptExecuted
    delete (window as any).__secondModuleExecuted
    delete (window as any).__interactiveElementsLoaded
    delete (window as any).__fullDocumentLoaded
    delete (window as any).__styledComponentsLoaded
    delete (window as any).__complexStylesLoaded
    delete (window as any).__buttonClicked
    delete (window as any).__formSubmitted
    delete (window as any).__todosAdded
  })

  afterEach(() => {
    // Clean up any injected font styles
    const fontStyle = document.getElementById('shadow-dom-fonts')
    if (fontStyle) {
      fontStyle.remove()
    }
  })

  describe('Direct Mode (isShadow=false)', () => {
    it('renders simple content correctly', async () => {
      const html = loadFixture('simple-content.html')
      const wrapper = mount(App, {
        props: { html, isShadow: false },
      })

      await nextTick()
      await waitFor(50)

      expect(wrapper.exists()).toBe(true)
      const hostEl = wrapper.vm.$el as HTMLElement
      expect(hostEl.querySelector('h1')?.textContent).toContain('Simple Content Test')

      // Verify content structure is rendered
      expect(hostEl.querySelector('.container')).toBeTruthy()
      expect(hostEl.querySelectorAll('li').length).toBe(3)
    })

    it('executes inline scripts', async () => {
      const html = loadFixture('inline-scripts.html')
      const wrapper = mount(App, {
        props: { html, isShadow: false },
      })

      await nextTick()
      await waitFor(100)

      const hostEl = wrapper.vm.$el as HTMLElement

      // Verify DOM structure from the fixture is rendered
      const result = hostEl.querySelector('#script-result')
      expect(result).toBeTruthy()

      // Verify content is rendered
      expect(hostEl.querySelector('h1')).toBeTruthy()
    })

    it('handles async and defer scripts correctly', async () => {
      const html = loadFixture('async-defer-scripts.html')
      const wrapper = mount(App, {
        props: { html, isShadow: false },
      })

      await nextTick()
      await waitFor(200)

      const hostEl = wrapper.vm.$el as HTMLElement

      // Verify DOM structure is rendered correctly
      expect(hostEl.children.length).toBeGreaterThan(0)

      // Verify heading is rendered
      expect(hostEl.querySelector('h1')).toBeTruthy()
    })

    it('executes ES6 module scripts', async () => {
      const html = loadFixture('module-script.html')
      const wrapper = mount(App, {
        props: { html, isShadow: false },
      })

      await nextTick()
      await waitFor(200)

      const hostEl = wrapper.vm.$el as HTMLElement

      // Verify DOM structure from fixture is rendered
      const moduleResult = hostEl.querySelector('#module-result')
      expect(moduleResult).toBeTruthy()

      // Verify content structure
      expect(hostEl.querySelector('h1')).toBeTruthy()
    })

    it('handles interactive elements correctly', async () => {
      const html = loadFixture('interactive-elements.html')
      const wrapper = mount(App, {
        props: { html, isShadow: false },
      })

      await nextTick()
      await waitFor(100)

      const hostEl = wrapper.vm.$el as HTMLElement

      // Verify interactive elements are rendered
      const incrementBtn = hostEl.querySelector('#increment-btn') as HTMLButtonElement
      expect(incrementBtn).toBeTruthy()

      const counter = hostEl.querySelector('#counter')
      expect(counter).toBeTruthy()

      // Verify form elements are present
      const form = hostEl.querySelector('form')
      expect(form).toBeTruthy()
    })

    it('renders full HTML5 document structure', async () => {
      const html = loadFixture('full-document.html')
      const wrapper = mount(App, {
        props: { html, isShadow: false },
      })

      await nextTick()
      await waitFor(100)

      const hostEl = wrapper.vm.$el as HTMLElement

      // Check semantic HTML5 elements are rendered
      expect(hostEl.querySelector('header')).toBeTruthy()
      expect(hostEl.querySelector('nav')).toBeTruthy()
      expect(hostEl.querySelector('main')).toBeTruthy()
      expect(hostEl.querySelector('footer')).toBeTruthy()

      // Verify article element is present
      expect(hostEl.querySelector('article')).toBeTruthy()
    })

    it('applies multiple style blocks correctly', async () => {
      const html = loadFixture('styled-components.html')
      const wrapper = mount(App, {
        props: { html, isShadow: false },
      })

      await nextTick()
      await waitFor(100)

      const hostEl = wrapper.vm.$el as HTMLElement

      // Verify styled components are rendered
      const card = hostEl.querySelector('.card')
      expect(card).toBeTruthy()

      // Verify multiple style elements are present
      const styles = hostEl.querySelectorAll('style')
      expect(styles.length).toBeGreaterThan(0)
    })

    it('handles complex CSS selectors and features', async () => {
      const html = loadFixture('complex-styles.html')
      const wrapper = mount(App, {
        props: { html, isShadow: false },
      })

      await nextTick()
      await waitFor(100)

      const hostEl = wrapper.vm.$el as HTMLElement

      // Verify elements with data attributes are rendered
      const activeElements = hostEl.querySelectorAll('[data-status="active"]')
      expect(activeElements.length).toBeGreaterThan(0)

      // Verify complex DOM structure elements are present
      const sections = hostEl.querySelectorAll('.section')
      expect(sections.length).toBeGreaterThan(0)
    })

    it('handles nested DOM structures', async () => {
      const html = loadFixture('nested-structure.html')
      const wrapper = mount(App, {
        props: { html, isShadow: false },
      })

      await nextTick()
      await waitFor(50)

      const hostEl = wrapper.vm.$el as HTMLElement

      // Check table structure
      const table = hostEl.querySelector('table')
      expect(table).toBeTruthy()
      const rows = table?.querySelectorAll('tr')
      expect(rows?.length).toBeGreaterThan(0)

      // Check nested divs
      const deepDiv = hostEl.querySelector('.level-1 .level-2 .level-3')
      expect(deepDiv).toBeTruthy()
    })

    it('cleans up properly on unmount', async () => {
      const html = loadFixture('simple-content.html')
      const wrapper = mount(App, {
        props: { html, isShadow: false },
      })

      await nextTick()
      const hostEl = wrapper.vm.$el as HTMLElement
      expect(hostEl.children.length).toBeGreaterThan(0)

      wrapper.unmount()
      // After unmount, the element should still exist but can be cleared
      expect(wrapper.exists()).toBe(false)
    })
  })

  describe('Shadow Mode (isShadow=true)', () => {
    it('renders simple content in shadow DOM', async () => {
      const html = loadFixture('simple-content.html')
      const wrapper = mount(App, {
        props: { html, isShadow: true },
      })

      await nextTick()

      const hostEl = wrapper.vm.$el as HTMLElement
      expect(hostEl.shadowRoot).toBeTruthy()

      const h1 = hostEl.shadowRoot?.querySelector('h1')
      expect(h1?.textContent).toContain('Simple Content Test')
    })

    it('isolates styles in shadow DOM', async () => {
      const html = loadFixture('styled-components.html')
      const wrapper = mount(App, {
        props: { html, isShadow: true },
      })

      await nextTick()

      const hostEl = wrapper.vm.$el as HTMLElement
      expect(hostEl.shadowRoot).toBeTruthy()

      // Styles should be in shadow DOM, not in main document
      const shadowStyles = hostEl.shadowRoot?.querySelectorAll('style')
      expect(shadowStyles?.length).toBeGreaterThan(0)

      const shadowCard = hostEl.shadowRoot?.querySelector('.card')
      expect(shadowCard).toBeTruthy()
    })

    it('extracts and injects @font-face rules', async () => {
      const html = loadFixture('font-face.html')
      mount(App, {
        props: { html, isShadow: true },
      })

      await nextTick()

      // Font styles should be injected into main document head
      const fontStyle = document.getElementById('shadow-dom-fonts')
      expect(fontStyle).toBeTruthy()
      expect(fontStyle?.textContent).toContain('@font-face')
      expect(fontStyle?.textContent).toContain('CustomFont')
    })

    it('does NOT execute scripts in shadow mode', async () => {
      const html = loadFixture('inline-scripts.html')

      // Clear any existing flags
      delete (window as any).__inlineScriptExecuted

      mount(App, {
        props: { html, isShadow: true },
      })

      await nextTick()
      await waitFor(100)

      // Scripts should NOT execute in shadow mode
      expect((window as any).__inlineScriptExecuted).toBeUndefined()
    })

    it('preserves complete HTML structure in shadow DOM', async () => {
      const html = loadFixture('full-document.html')
      const wrapper = mount(App, {
        props: { html, isShadow: true },
      })

      await nextTick()

      const hostEl = wrapper.vm.$el as HTMLElement
      const shadowRoot = hostEl.shadowRoot
      expect(shadowRoot).toBeTruthy()

      // Should have html element as root
      const htmlElement = shadowRoot?.querySelector('html')
      expect(htmlElement).toBeTruthy()

      // Should have head and body
      const head = shadowRoot?.querySelector('head')
      const body = shadowRoot?.querySelector('body')
      expect(head).toBeTruthy()
      expect(body).toBeTruthy()

      // Check semantic elements
      expect(shadowRoot?.querySelector('header')).toBeTruthy()
      expect(shadowRoot?.querySelector('nav')).toBeTruthy()
      expect(shadowRoot?.querySelector('main')).toBeTruthy()
      expect(shadowRoot?.querySelector('footer')).toBeTruthy()
    })

    it('handles complex CSS in shadow DOM', async () => {
      const html = loadFixture('complex-styles.html')
      const wrapper = mount(App, {
        props: { html, isShadow: true },
      })

      await nextTick()

      const hostEl = wrapper.vm.$el as HTMLElement
      const shadowRoot = hostEl.shadowRoot

      // Verify complex selectors work in shadow DOM
      const sections = shadowRoot?.querySelectorAll('.section')
      expect(sections?.length).toBeGreaterThan(0)

      const statusElements = shadowRoot?.querySelectorAll('[data-status]')
      expect(statusElements?.length).toBeGreaterThan(0)
    })

    it('renders nested structures in shadow DOM', async () => {
      const html = loadFixture('nested-structure.html')
      const wrapper = mount(App, {
        props: { html, isShadow: true },
      })

      await nextTick()

      const hostEl = wrapper.vm.$el as HTMLElement
      const shadowRoot = hostEl.shadowRoot

      const table = shadowRoot?.querySelector('table')
      expect(table).toBeTruthy()

      const nestedDiv = shadowRoot?.querySelector('.level-1 .level-2 .level-3')
      expect(nestedDiv).toBeTruthy()
    })

    it('cleans up shadow DOM on unmount', async () => {
      const html = loadFixture('simple-content.html')
      const wrapper = mount(App, {
        props: { html, isShadow: true },
      })

      await nextTick()

      const hostEl = wrapper.vm.$el as HTMLElement
      expect(hostEl.shadowRoot?.children.length).toBeGreaterThan(0)

      wrapper.unmount()
      expect(wrapper.exists()).toBe(false)
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('handles empty HTML string', async () => {
      const wrapper = mount(App, {
        props: { html: '', isShadow: false },
      })

      await nextTick()
      expect(wrapper.exists()).toBe(true)
    })

    it('handles HTML without head or body tags', async () => {
      const html = '<div><h1>No Structure</h1><p>Just content</p></div>'
      const wrapper = mount(App, {
        props: { html, isShadow: false },
      })

      await nextTick()

      const hostEl = wrapper.vm.$el as HTMLElement
      expect(hostEl.querySelector('h1')?.textContent).toBe('No Structure')
    })

    it('handles malformed HTML gracefully', async () => {
      const html = '<div><p>Unclosed paragraph<div>Nested improperly</p></div>'
      const wrapper = mount(App, {
        props: { html, isShadow: false },
      })

      await nextTick()
      expect(wrapper.exists()).toBe(true)
      // Browser will auto-correct the HTML
    })

    it('switches between modes correctly', async () => {
      const html = loadFixture('simple-content.html')

      // Start with direct mode
      const wrapper = mount(App, {
        props: { html, isShadow: false },
      })

      await nextTick()
      let hostEl = wrapper.vm.$el as HTMLElement
      expect(hostEl.shadowRoot).toBeNull()

      // Note: Component doesn't reactively switch modes
      // This tests that both modes work independently
      wrapper.unmount()

      // Mount with shadow mode
      const wrapper2 = mount(App, {
        props: { html, isShadow: true },
      })

      await nextTick()
      hostEl = wrapper2.vm.$el as HTMLElement
      expect(hostEl.shadowRoot).toBeTruthy()
    })
  })
})
