import fs from "fs";
import path from "path";
import { viteSingleFile } from "./src/singlefile";
function virtualEntry(target: string) {
  return {
    name: 'virtual-html',
    load(id: string) {
      if (id.endsWith('index.html')) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Virtual Preview</title>
</head>
<body>
<div id="root"></div>
<script type="module" src="${target}"></script>
</body>
`
      }
    }
  }
}

// const target = path.join(__dirname, "test/ws1/src/sub.tsx");
import { build } from "vite";

async function main() {
  const target = '/src/suspense.tsx';
  // TODO: validate postcss.config.js that tailwind.config is absolute path
  const output = await build({
    configFile: path.join(__dirname, "test/ws1/vite.config.mts"),
    root: path.join(__dirname, "test/ws1"),
    mode: "development",
    build: {
      assetsInlineLimit: Infinity,
      modulePreload: {
        polyfill: false,
      },
      cssCodeSplit: false,
      target: 'esnext',
      minify: false,
      cssMinify: false,
      write: false,
    },
    plugins: [
      virtualEntry(target),
      viteSingleFile({
        useRecommendedBuildConfig: false,
        removeViteModuleLoader: true,
      })
    ]
    // build: {
    //   lib: {
    //     entry: "index.tsx",
    //     name: "react-preview",
    //     fileName: (format) => `out.js`
    //   }
    // }
  });
  // @ts-ignore
  const html = output.output.find(x => x.fileName.endsWith(".html"))?.source;
  fs.writeFileSync("out.html", html);
}

main().catch(console.error);

// console.log(output);