# VueHTMLRenderer

A powerful and flexible Vue 3 library for rendering arbitrary HTML content with two distinct rendering modes: **Direct Mode** (with script execution) and **Shadow Mode** (with style isolation).

> **⚠️ SECURITY WARNING**  
> **This library does NOT sanitize or validate HTML content. If you render HTML containing malicious scripts in Direct Mode, those scripts WILL execute. Always sanitize untrusted HTML content before passing it to this component, or use Shadow Mode (which disables script execution) when rendering content from untrusted sources.**

## 📋 Table of Contents

- [Overview](#overview)
- [Why Not iFrame?](#why-not-iframe)
- [Features](#features)
- [Architecture](#architecture)
- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Rendering Modes Comparison](#rendering-modes-comparison)
- [Examples](#examples)
- [Best Practices](#best-practices)

---

## 🎯 Overview

This library provides a unified solution for rendering HTML content in Vue 3 applications with full control over rendering behavior. It addresses common challenges when working with dynamic HTML content, such as:

- **Script Execution**: Execute embedded JavaScript with proper browser-like semantics
- **Style Isolation**: Prevent CSS conflicts using Shadow DOM
- **Font Loading**: Proper @font-face handling in Shadow DOM
- **HTML Structure Preservation**: Maintain complete HTML structure including `<html>`, `<head>`, and `<body>` tags

## 🚫 Why Not iFrame?

You might wonder: "Why not just use an `<iframe>`?" Here are the key reasons:

### Problems with iFrame:

1. **Manual Size Management**
   - iFrames require explicit width and height
   - Content doesn't naturally flow with the parent layout
   - Responsive sizing requires complex JavaScript solutions

2. **Complex Security Configuration**
   - Sandbox flags must be manually configured
   - Easy to misconfigure and create security vulnerabilities
   - Different browsers have different default behaviors

3. **Communication Overhead**
   - Parent-child communication requires postMessage API
   - Complex bidirectional data flow
   - Difficult to share state or context

4. **Performance Impact**
   - Each iframe creates a complete browser context
   - Higher memory usage
   - Slower initial load times

5. **SEO and Accessibility Issues**
   - Search engines may not index iframe content properly
   - Screen readers may have difficulty navigating
   - URL management is more complex

### Advantages of This Library:

✅ **Automatic Layout Integration**: Content flows naturally with the parent document  
✅ **Smart Script Handling**: Controlled execution with proper async/defer/sequential semantics  
✅ **Efficient Style Isolation**: Shadow DOM provides isolation without the overhead  
✅ **Better Performance**: Lower memory footprint, faster rendering  
✅ **Seamless Integration**: Direct access to Vue context and reactivity  
✅ **Font Loading**: Automatic handling of @font-face declarations in Shadow DOM

---

## ✨ Features

### Direct Mode (isShadow=false)

- ✅ Full script execution support
- ✅ Async, defer, and sequential script handling
- ✅ Module script support (`type="module"`)
- ✅ Inline and external scripts
- ✅ Browser-like execution semantics
- ✅ No style isolation (uses parent styles)

### Shadow Mode (isShadow=true)

- ✅ Complete style isolation using Shadow DOM
- ✅ Preserves full HTML structure (`<html>`, `<head>`, `<body>`)
- ✅ Automatic @font-face extraction and injection
- ✅ No script execution (by design, for security)
- ✅ Perfect for rendering formatted documents
- ✅ CSS encapsulation (no style leakage)

### Common Features

- ✅ Vue 3 Composition API
- ✅ Full TypeScript support
- ✅ Comprehensive documentation
- ✅ Custom Element compatibility
- ✅ Clean lifecycle management
- ✅ Framework-agnostic utilities

---

## 🏗️ Architecture

The library is organized by responsibility for easy maintenance and potential library distribution:

```
vue-html-renderer/
├── src/
│   ├── App.vue                    # Main Vue component
│   ├── index.ts                   # Library entry point (exports)
│   ├── main.ts                    # Dev/demo entry point
│   ├── extras/
│   │   ├── types.ts               # TypeScript type definitions
│   │   └── utils.ts               # Shared utility functions
│   ├── composables/
│   │   └── useHtmlRenderer.ts     # Composable (internal use)
│   └── renderers/
│       ├── shadowRenderer.ts      # Shadow DOM rendering logic
│       └── directRenderer.ts      # Direct rendering with script execution
└── README.md                      # This file
```

### Design Principles

1. **Separation of Concerns**: Each module has a single, well-defined responsibility
2. **Type Safety**: Full TypeScript coverage with comprehensive type definitions
3. **Extensibility**: Easy to add new rendering modes or features
4. **Reusability**: Framework-agnostic utilities can be used outside Vue
5. **Documentation**: Every function and type is thoroughly documented

---

## 📦 Installation

```typescript
import HtmlRenderer from '@/components/htmlRenderer/HtmlRenderer.vue'
// or
import { useHtmlRenderer } from '@/components/htmlRenderer/composables/useHtmlRenderer'
```

### As a Standalone Library (Future)

For distribution as a standalone npm package:

```bash
npm install @your-org/html-renderer
# or
yarn add @your-org/html-renderer
```

---

## 🚀 Usage

### Basic Component Usage

#### Direct Mode (with script execution)

```vue
<template>
  <HtmlRenderer :html="htmlContent" />
</template>

<script setup lang="ts">
import HtmlRenderer from '@/components/htmlRenderer/HtmlRenderer.vue';

const htmlContent = `
  <div>
    <h1>Hello World</h1>
    <script>
      console.log('This script will execute!');
    </script>
  </div>
`;
</script>
```

#### Shadow Mode (with style isolation)

```vue
<template>
  <HtmlRenderer :html="htmlContent" :is-shadow="true" />
</template>

<script setup lang="ts">
import HtmlRenderer from '@/components/htmlRenderer/HtmlRenderer.vue'

const htmlContent = `
  <!doctype html>
  <html>
    <head>
      <style>
        body { background: #f0f0f0; font-family: Arial; }
        h1 { color: blue; }
      </style>
    </head>
    <body>
      <h1>Isolated Styles</h1>
      <p>These styles won't affect the parent document!</p>
    </body>
  </html>
`
</script>
```

### Composable Usage

```vue
<template>
  <div ref="hostRef"></div>
</template>

<script setup lang="ts">
import { useHtmlRenderer } from '@/components/htmlRenderer/composables/useHtmlRenderer'

const { hostRef, clear } = useHtmlRenderer({
  html: '<div>Content</div>',
  isShadow: false,
})

// Manually clear content if needed
// clear();
</script>
```

---

## 📚 API Reference

### Component: `HtmlRenderer`

#### Props

| Prop       | Type      | Required | Default | Description                    |
| ---------- | --------- | -------- | ------- | ------------------------------ |
| `html`     | `string`  | Yes      | -       | The HTML string to render      |
| `isShadow` | `boolean` | No       | `false` | Whether to use Shadow DOM mode |

#### Example

```vue
<HtmlRenderer :html="myHtmlString" :is-shadow="true" />
```

---

### Composable: `useHtmlRenderer`

#### Parameters

```typescript
interface IHtmlRendererOptions {
  html: string // The HTML string to render
  isShadow?: boolean // Whether to use Shadow DOM mode (default: false)
}
```

#### Returns

```typescript
interface IHtmlRendererComposable {
  hostRef: Ref<HTMLElement | undefined> // Template ref for the host element
  clear: () => void // Function to clear rendered content
  shadowRoot?: Ref<ShadowRoot | undefined> // Shadow root ref (shadow mode only)
}
```

#### Example

```typescript
const { hostRef, clear, shadowRoot } = useHtmlRenderer({
  html: '<div>Content</div>',
  isShadow: true,
})
```

---

### Utility Functions

#### From `utils.ts`

```typescript
// Generate a unique ID
function uid(): string

// Normalize HTML (handle escaping/encoding)
function normalizeHtml(raw: string): string

// Normalize attribute values
function normalizeAttr(val: string): string

// Find placeholder comment node
function findPlaceholderNode(root: ParentNode, id: string): Comment | null
```

---

### Type Definitions

See `types.ts` for complete type definitions:

- `IHtmlRendererOptions`
- `IHtmlRendererComposable`
- `IHtmlRendererProps`
- `IScriptMeta`
- `RenderMode`
- `IFontFaceExtractionOptions`

---

## ⚖️ Rendering Modes Comparison

| Feature              | Direct Mode                   | Shadow Mode                                |
| -------------------- | ----------------------------- | ------------------------------------------ |
| **Script Execution** | ✅ Yes (full support)         | ❌ No (by design)                          |
| **Style Isolation**  | ❌ No (uses parent styles)    | ✅ Yes (complete isolation)                |
| **HTML Structure**   | Partial                       | ✅ Complete (`<html>`, `<body>`, `<head>`) |
| **Font Loading**     | ✅ Automatic                  | ✅ Automatic (@font-face injection)        |
| **Performance**      | Fast                          | Very Fast                                  |
| **Security**         | Requires trust in HTML source | Higher (no scripts)                        |
| **Use Cases**        | Interactive content, widgets  | Documents, formatted content               |

### When to Use Direct Mode

- ✅ You need JavaScript to execute
- ✅ You trust the HTML source
- ✅ You want interactive content
- ✅ You need to share parent document styles
- ✅ You're rendering dynamic widgets

### When to Use Shadow Mode

- ✅ You need style isolation
- ✅ You don't need scripts
- ✅ You're rendering formatted documents (coupons, certificates, vouchers)
- ✅ You want to prevent CSS conflicts
- ✅ You need to preserve complete HTML structure
- ✅ Security is a priority (no script execution)

---

## 💡 Examples

### Example 1: Rendering a Coupon (Shadow Mode)

```vue
<template>
  <HtmlRenderer :html="couponHtml" :is-shadow="true" />
</template>

<script setup lang="ts">
import HtmlRenderer from '@/components/htmlRenderer/HtmlRenderer.vue'

const couponHtml = `
  <!doctype html>
  <html>
    <head>
      <style>
        @font-face {
          font-family: 'CustomFont';
          src: url('https://example.com/font.woff2') format('woff2');
        }
        body {
          font-family: 'CustomFont', sans-serif;
          background: white;
          width: 18cm;
          height: 26.7cm;
        }
        .coupon-title {
          font-size: 24pt;
          color: #333;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="coupon-title">$50 Gift Certificate</div>
      <p>Valid until: 2025-12-31</p>
    </body>
  </html>
`
</script>
```

### Example 2: Interactive Widget (Direct Mode)

```vue
<template>
  <HtmlRenderer :html="widgetHtml" :is-shadow="false" />
</template>

<script setup lang="ts">
import HtmlRenderer from '@/components/htmlRenderer/HtmlRenderer.vue';

const widgetHtml = `
  <div id="widget">
    <button id="clickMe">Click Me</button>
    <span id="counter">0</span>
  </div>
  <script>
    let count = 0;
    document.getElementById('clickMe').addEventListener('click', () => {
      count++;
      document.getElementById('counter').textContent = count;
    });
  </script>
`;
</script>
```

### Example 3: Loading External Scripts

```vue
<template>
  <HtmlRenderer :html="scriptHtml" :is-shadow="false" />
</template>

<script setup lang="ts">
const scriptHtml = `
  <div id="map"></div>
  <script src="https://cdn.example.com/map-library.js" defer></script>
  <script defer>
    // This runs after map-library.js loads
    initMap('map');
  </script>
`;
</script>
```

---

## 🎯 Best Practices

### Security

1. **Always sanitize untrusted HTML** before rendering in direct mode
2. **Use shadow mode** for content from untrusted sources (no script execution)
3. **Validate external script sources** when using direct mode
4. **Be cautious with inline event handlers** (`onclick`, etc.)

### Performance

1. **Avoid re-rendering** - The component renders once on mount
2. **Use keys** if you need to force re-rendering with different content
3. **Minimize HTML size** for faster parsing
4. **Consider lazy loading** for heavy content

### Styling

1. **Shadow mode**: Include all styles in the HTML string (they won't leak)
2. **Direct mode**: Be aware of style inheritance from parent document
3. **Use scoped styles** in parent components to avoid conflicts
4. **Test font loading** in shadow mode (fonts are automatically injected)

### Script Execution (Direct Mode)

1. **Understand execution order**: Sequential → Async (fire-and-forget) → Defer
2. **Use `defer`** for scripts that need DOM to be ready
3. **Use `async`** for independent scripts
4. **Module scripts** (`type="module"`) are always deferred by default

---

## 🤝 Contributing

When contributing to this library, please follow these guidelines:

1. **Maintain separation of concerns**: Keep renderers, composables, and utilities separate
2. **Document everything**: All functions, types, and modules should have JSDoc comments
3. **Write tests**: Add tests for new features or bug fixes
4. **Follow TypeScript best practices**: Use strict typing, avoid `any`
5. **Update this README**: Keep documentation in sync with code changes

---

## 📄 License

Free to use.

---

## 🙏 Acknowledgments

This library was built to solve real-world challenges in rendering dynamic HTML content in Vue 3 applications, specifically for rendering formatted documents like coupons and vouchers with proper style isolation and font loading.

---

**Built with ❤️ for Vue 3 developers who need powerful HTML rendering capabilities.**
