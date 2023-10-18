import { defineConfig } from 'vite';
export default defineConfig({
  resolve: {
    alias: [
      {
        find: 'path',
        replacement: 'path-browserify'
      }
    ]
  },
  build: {
    outDir: 'out/worker',
    lib: {
      fileName: () => 'buildWorker.mjs',
      entry: 'src/buildWorker.ts',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['fs', 'worker_threads'],
    }
  }
});