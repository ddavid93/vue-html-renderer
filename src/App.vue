<template>
  <!--
    Host element for the renderer.
    The composable will either:
    - Attach a shadow root to this element (shadow mode)
    - Render content directly into this element (direct mode)
  -->
  <div ref="hostRef"></div>
</template>

<!--
  HtmlRenderer Component

  A unified Vue 3 component for rendering arbitrary HTML content with two rendering modes:

  1. Direct Mode (default, isShadow=false):
     - Renders HTML directly into the DOM
     - Full script execution support (async, defer, sequential, module)
     - No style isolation
     - Use when you need JavaScript to run

  2. Shadow Mode (isShadow=true):
     - Renders HTML in isolated Shadow DOM
     - Complete style isolation
     - Preserves full HTML structure (html, head, body tags)
     - Extracts and injects @font-face rules for proper font loading
     - No script execution (by design)
     - Use when you need style isolation

  Usage Examples:

  Direct mode (with script execution):
  ```vue
  <HtmlRenderer :html="myHtmlString" />
  ```

  Shadow mode (with style isolation):
  ```vue
  <HtmlRenderer :html="myHtmlString" :is-shadow="true" />
  ```

  Props:
  - html (String, required): The HTML string to render
  - isShadow (Boolean, optional, default: false): Whether to use Shadow DOM mode

  Features:
  - Automatically handles script execution in direct mode
  - Automatically handles style isolation in shadow mode
  - Preserves complete HTML structure in shadow mode
  - Font-face extraction and injection in shadow mode
  - No reactive updates (renders once on mount)
  - Clean unmount with proper cleanup
-->
<script setup lang="ts">
import { defineProps } from 'vue'
import { useHtmlRenderer } from './composables/useHtmlRenderer'
import type { IHtmlRendererProps } from '@/extras/types.ts'

/**
 * Component props definition
 */
const props = withDefaults(defineProps<IHtmlRendererProps>(), {
  isShadow: false,
})

/**
 * Use the unified composable with the provided props
 */
const { hostRef } = useHtmlRenderer({
  html: props.html,
  isShadow: props.isShadow,
})
</script>
