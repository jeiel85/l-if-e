// SPDX-License-Identifier: MIT
import { cp, mkdir, readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const source = new URL('../game/dist/', import.meta.url);
const output = new URL('../dist/', import.meta.url);
const files = await readdir(source);
await mkdir(output, { recursive: true });
for (const file of files) await cp(new URL(file, source), new URL(file, output));
for (const file of files) {
  const original = await readFile(new URL(file, source));
  const copied = await readFile(new URL(file, output));
  if (!original.equals(copied)) throw new Error(`Build copy mismatch: ${file}`);
}
console.log(`Copied and verified ${files.length} static files to ${fileURLToPath(output)}`);
