import path from 'path';
import fs from 'fs';
import { viteSingleFile } from "./singlefile";
import type { RollupOutput } from 'rollup';
import type { PluginOption } from 'vite';

const PREVIEW_TSX = "/__PREVIEW__.tsx";

const template = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>__Preview__</title>
  <style>
    body.vscode-light, body.vscode-dark {
      color: black;
      background-color: white;
    }
  </style>  
</head>
<body>
  <div id="preview-root"></div>
  <script type="module" src="${PREVIEW_TSX}"></script>
</body>
</html>
`;

const reactEntryTsx = (target: string, exportedName?: string) => `// entry
import { ${exportedName ? `${exportedName} as ` : ''}__PREVIEW__ } from '${target}';
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
const root = createRoot(document.getElementById("preview-root")!).render(
  <StrictMode>
    <__PREVIEW__ />
  </StrictMode>
);
`;

const svelteEntryTsx = (target: string, hasPreviewProps: boolean) => `
import App${hasPreviewProps ? ', { __PREVIEW_PROPS__ }' : ''} from '${target}';
console.log('App', __PREVIEW_PROPS__);
new App({
  target: document.getElementById("preview-root"),
  props: ${hasPreviewProps ? '__PREVIEW_PROPS__' : '{}'}
});
`;

export type ContextVite = {
  vite: typeof import('vite');
  configPath: string;
  root: string;
  target: string;
};

export async function getContextVite(fsPath: string): Promise<ContextVite> {
  const configPath = await findClosestViteConfigPath(fsPath);
  if (!configPath) throw new Error('vite not installed');
  const root = path.dirname(configPath);
  const viteModulePath = path.join(root, 'node_modules/vite/dist/node/index.js');
  const viteModule = await import(viteModulePath);
  return {
    vite: viteModule,
    configPath,
    root,
    target: `/${path.relative(root, fsPath)}`,
  };
}

const SVELTE_PREVIEW_PROPS = /export\s+(const|let)\s+__PREVIEW_PROPS__/m;
export async function bundle(contextVite: ContextVite, content: string): Promise<string> {
  if (contextVite.target.endsWith('.html')) {
    console.log('[html]', content);
    return bundleToHtml(contextVite, {
      entry: `throw new Error('unreachable');`,
    }, true);
  }

  if (contextVite.target.endsWith('.svelte')) {
    const hasProps = SVELTE_PREVIEW_PROPS.test(content);
    return bundleToHtml(contextVite, {
      entry: svelteEntryTsx(contextVite.target, hasProps)
    });
  }
  if (contextVite.target.endsWith('.tsx')) {
    if (isNoPropsDefaultNamedComponent(content)) {
      return bundleToHtml(contextVite, {
        entry: reactEntryTsx(contextVite.target, 'default')
      });
    }
    const componentName = findNoPropsFileNameComponent(content, contextVite.target);
    if (componentName) {
      return bundleToHtml(contextVite, {
        entry: reactEntryTsx(contextVite.target, componentName)
      });
    }
    if (isReactPreviewContent(content)) {
      return bundleToHtml(contextVite, {
        entry: reactEntryTsx(contextVite.target, '__PREVIEW__')
      });
    }
  }

  const files = {
    entry: `import '${contextVite.target}';`
  }
  return bundleToHtml(contextVite, files);
}

type PreviewFiles = {
  entry: string;
};

export async function bundleToHtml(contextVite: ContextVite, files: PreviewFiles, overrideHtml = false): Promise<string> {
  // const input = `preview.html`;
  const hasPreviewHtml = await exists(path.join(contextVite.root, 'preview.html'));
  const input = overrideHtml
    ? `${contextVite.root}/${contextVite.target}`
    : hasPreviewHtml
      ? path.join(contextVite.root, 'preview.html')
      : path.join(contextVite.root, 'index.html');
  const output = await contextVite.vite.build({
    root: contextVite.root,
    configFile: contextVite.configPath,
    mode: 'preview',
    define: {
      "process.env.NODE_ENV": '"development"'
    },
    build: {
      assetsInlineLimit: Infinity,
      cssCodeSplit: false,
      modulePreload: {
        polyfill: false
      },
      target: 'esnext',
      lib: undefined,
      minify: false,
      cssMinify: false,
      write: false,
      rollupOptions: {
        input: input,
      }
    },
    plugins: [
      virtualFiles({
        input,
        entry: files.entry,
        root: contextVite.root,
        overrideIndexHtml: hasPreviewHtml ? undefined : template,
      }),
      viteSingleFile({
        useRecommendedBuildConfig: false,
        removeViteModuleLoader: true,
      })
    ]
  });
  for (const out of (output as RollupOutput).output) {
    const basename = path.basename(input);
    if (out.type === 'asset' && out.fileName.endsWith(basename)) {
      return out.source as string;
    }
  }
  throw new Error('no html output');
}

// virtual html entry
function virtualFiles(opts: {
  root: string;
  input: string;
  overrideIndexHtml?: string;
  entry: string;
}): PluginOption {
  return {
    name: 'vite-preview:virtual-html',
    enforce: 'pre',
    resolveId(id: string, importer: string) {
      if (id.endsWith(PREVIEW_TSX)) {
        return path.join(path.dirname(importer), id);
      }
      return undefined
    },
    async load(id: string) {
      if (id.endsWith(PREVIEW_TSX)) {
        return opts.entry;
      }
      if (id === path.join(opts.root, 'index.html') && opts.overrideIndexHtml) {
        return opts.overrideIndexHtml;
      }
    },
    transformIndexHtml(html: string) {
      return {
        html,
        tags: [

        ]
      }
    },
  } as PluginOption;
}

function isReactPreviewContent(code: string): boolean {
  return code.includes('export const __PREVIEW__') || code.includes('export function __PREVIEW__');
}

const NO_PROPS_DEFAULT_NAMED_COMPONENT = /export\s+default\s+function\s+([A-Z_$][a-zA-Z_$\d]*)\(\s*\)/m;
function isNoPropsDefaultNamedComponent(code: string): boolean {
  return NO_PROPS_DEFAULT_NAMED_COMPONENT.test(code);
}

const NO_PROPS_NAMED_COMPONENT = /export\s+function\s+([A-Z_$][a-zA-Z_$\d]*)\(\s*\)/m;
function findNoPropsFileNameComponent(code: string, fileName: string): string | undefined {
  const ext = path.extname(fileName);
  const basename = path.basename(fileName).replace(ext, '').replace(/\-/g, '');
  const matched = NO_PROPS_NAMED_COMPONENT.exec(code);
  if (matched) {
    const [_, componentName] = matched;
    if (componentName.toLowerCase() === basename.toLowerCase()) {
      return componentName;
    };
  }
  return undefined;
}

async function exists(filePath: string) {
  try {
    await fs.promises.stat(filePath);
    return true;
  } catch (error) {
    return false;
  }
}

const VITE_CONFIG_NAMES = ['vite.config.js', 'vite.config.ts', 'vite.config.mjs', 'vite.config.mts'];
async function findClosestViteConfigPath(filePath: string) {
  let currentPath = path.dirname(filePath);
  while (currentPath !== '/') {
    for (const configName of VITE_CONFIG_NAMES) {
      const viteConfigPath = path.join(currentPath, configName);
      if (await exists(viteConfigPath)) {
        return viteConfigPath;
      }
    }
    currentPath = path.join(currentPath, '..');
  }
  return undefined;
}
