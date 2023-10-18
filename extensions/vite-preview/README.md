# Vite Preview

## What's this

![](https://i.gyazo.com/d631ac2e9a022d94d2fb3a50ce79c79f.gif)

- Preview components in vscode webview

## Install

Not published to vscode marketplace yet.

```bash
$ wget wget https://github.com/mizchi/vscode-vite-preview/raw/main/extensions/vite-preview/releases/vite-preview-0.0.1.vsix
$ code --install-extension vite-preview-0.0.1.vsix
```

## How to use

- Install vscode extension
- Requirements:
  - `vite` installed in node_modules
  - `vite.config.{js,mjs,ts,mts}` exists
- Open file you want to preview and `ctrl+alt+r` to run
  - or run vscode command `VitePreview: Preview Current` from Command Pallet
- Update preview on save

## Customize

### preview.html

Put preview.html to override preview template.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta charset="UTF-8">
  <title>Preview</title>
  <style>
    /* for vscode reset */
    body.vscode-light,
    body.vscode-dark {
      color: black;
      background-color: white;
    }
  </style>
  <!-- DO-NOT-DELETE: __PREVIEW__.tsx is generated entrypoint -->
  <script type="module" src="/__PREVIEW__.tsx"></script>
</head>
<body>
  <div id="preview-root"></div>
</body>
</html>
```

### tailwind

Specify as absolute paths for preview.

```js
const path = require('path')
module.exports = {
  plugins: {
    tailwindcss: {
      config: path.join(__dirname, './tailwind.config.js'),
    },
    autoprefixer: {},
  },
}
```

```js
const path = require('path');
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    path.join(__dirname, 'src/**/*.{js,ts,jsx,tsx,svelte,vue,html}'),
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## Preview Detection Rules

### import.meta.env.MODE === "preview"

```ts
import { createRoot } from "react-dom/client";
if (import.meta.env.MODE === 'preview') {
  const root = createRoot(document.getElementById("preview-root")!);
  root.render(<div className="text-3xl">xxx</div>);
}
```

### React Detection

```tsx
// detect __PREVIEW__ component
export function __PREVIEW__() {
  return <></>
}
export const __PREVIEW__ = () => {
  return <></>
}

// default component without props
export default function App() {
  return <></>
}

// foo/Foo in foo.tsx
export function Foo() {
  return <></>
}
```

### Svelte Detection

Need `vite.config.mjs` or `vite.config.mjs` to esm only plugin.

```ts
// vite.config.mts
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
export default defineConfig({
  plugins: [
    svelte(),
  ]
});
```

with `__PREVIEW_PROPS__`

```svelte
<script context="module" lang="ts">
  export const __PREVIEW_PROPS__ = {
    x: 5,
  };
</script>

<script>
  export let x = 1;
</script>

<div class="text-2xl">Hello Svelte, {x}</div>
```

### HTML Detection

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Preview</title>
  <style>
    body.vscode-light, body.vscode-dark {
      color: black;
      background-color: white;
    }
  </style>
</head>

<body>
  <h1 class="text-3xl">html preview</h1>
</body>
</html>
```

## TODO

- [ ] mdx
- [ ] HMR
- [ ] Dynamic Import

## Contributing

```
```

## LICENSE

MIT
