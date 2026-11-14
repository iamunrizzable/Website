// Copies wllama's WebAssembly file next to the site so the CPU Hallie model can load it
// from the same origin (the page's security policy blocks outside CDNs).
import { copyFileSync, mkdirSync, existsSync } from 'node:fs';

const from = 'node_modules/@wllama/wllama/esm/wasm/wllama.wasm';
if (!existsSync(from)) {
  console.warn('[copy-wllama] wllama.wasm not found; the CPU Hallie model will be unavailable.');
} else {
  mkdirSync('public/wllama', { recursive: true });
  copyFileSync(from, 'public/wllama/wllama.wasm');
  console.log('[copy-wllama] copied wllama.wasm');
}
