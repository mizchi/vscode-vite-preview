import { parentPort } from 'worker_threads';
import { bundle, getContextVite } from './builder';

if (!parentPort) {
  throw new Error('parentPort is undefined');
}

export type BuildRequest = {
  id: string;
  filePath: string;
  content: string;
}

export type BuildResponse = {
  success: true,
  id: string;
  html: string;
} | {
  success: false,
  id: number;
  message?: string;
}

parentPort.on('message', async (msg: BuildRequest) => {
  try {
    const contextVite = await getContextVite(msg.filePath);
    const html = await bundle(contextVite, msg.content);
    parentPort?.postMessage({
      id: msg.id,
      success: true,
      html,
    });
  } catch (err) {
    parentPort?.postMessage({
      id: msg.id,
      success: false,
      message: err?.message,
    });
  }
});
