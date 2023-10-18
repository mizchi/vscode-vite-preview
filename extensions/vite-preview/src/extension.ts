import vscode from 'vscode';
import path from "path";
// import { bundle, getContextVite } from './builder';
import { Worker } from "worker_threads";
import fs from 'fs';
import url from "url";
import { BuildRequest, BuildResponse } from './buildWorker';

// simple rpc
const wrap = (worker: Worker) => {
  return {
    call: (arg: Omit<BuildRequest, 'id'>) => {
      const id = Math.random().toString(36).slice(2);
      return new Promise<BuildResponse>((resolve, _reject) => {
        const listener = (res: BuildResponse) => {
          if (res.id === id) {
            worker.off('message', listener);
            resolve(res);
          }
        };
        worker.on('message', listener);
        worker.postMessage({
          id: id,
          ...arg,
        } as BuildRequest);
      });
    }
  }
}

const workerApi = wrap(new Worker(url.pathToFileURL(path.join(__dirname, '../worker/buildWorker.mjs'))));
// const workerApi = await import('./buildWorker');

export function activate(context: vscode.ExtensionContext) {
  // console.log("activated", Date.now());
  let panel: vscode.WebviewPanel | undefined = undefined;
  let currentPreviewPath: string | undefined = undefined;
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(async (doc) => {
      if (currentPreviewPath === doc.uri.fsPath) {
        await update(doc.uri.fsPath);
      }
    }),
    vscode.commands.registerCommand('vite-preview.previewCurrent', async () => {
      if (!vscode.window.activeTextEditor) {
        vscode.window.showErrorMessage('no active text editor');
        return;
      }
      currentPreviewPath = vscode.window.activeTextEditor.document.uri.fsPath;
      await update(currentPreviewPath);
    }),
    vscode.commands.registerCommand('vite-preview.preview', async () => {
      if (!currentPreviewPath) {
        if (!vscode.window.activeTextEditor) {
          vscode.window.showErrorMessage('no active text editor and preview');
          return;
        }
        currentPreviewPath = vscode.window.activeTextEditor?.document.uri.fsPath;
      }
      await update(currentPreviewPath);
    }),
    vscode.commands.registerCommand('vite-preview.close', async () => {
      await panel?.dispose();
      panel = undefined;
      currentPreviewPath = undefined;
    })
  );

  async function update(fsPath: string): Promise<void> {
    const panel = ensureWebviewPanel(fsPath);
    try {
      const result = await workerApi.call({
        filePath: fsPath,
        content: await fs.promises.readFile(fsPath, 'utf-8'),
      });
      if (result.success) {
        panel.webview.html = result.success ? result.html : '';
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      if (error instanceof Error) {
        panel.webview.html = error.message;
      }
    }
  }

  function ensureWebviewPanel(fsPath: string) {
    if (!panel) {
      const relativePath = vscode.workspace.asRelativePath(fsPath);
      panel = vscode.window.createWebviewPanel(
        'Preview',
        `Preview:${relativePath}`,
        vscode.ViewColumn.Beside,
        {
          enableScripts: true,
        },
      );
      panel.onDidDispose(() => {
        currentPreviewPath = undefined;
        panel = undefined;
      });
    } else {
      panel.title = `Preview:${vscode.workspace.asRelativePath(fsPath)}`;
    }
    return panel as vscode.WebviewPanel;
  }
}
