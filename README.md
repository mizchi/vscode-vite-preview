# vite-preview: extension

## How to use

Setup vite project.

Set `import.meta.env.PREVIEW` to production build.

```js
import { defineConfig } from 'vite';
export default defineConfig({
  define: {
    'import.meta.env.PREVIEW': "undefined",
  }
});
```

## with postcss and tailwind

you should set `plugin.tailwindcss.config` as absolute path in `postcss.config.js`

```js
// postcss.config.js
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

## TODO

- [ ] preview helper
- [ ] dynamic import
- [ ] research debugger integration

---

https://github.com/tjx666/awesome-vscode-extension-boilerplate

