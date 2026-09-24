// GENERATED from corpsc-hub/tracker v2.0.0. Do not edit this copy:
// change it in corpsc-hub/tracker and run `pnpm sync <this folder>` there.

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

const dir = dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(readFileSync(join(dir, 'MANIFEST.json'), 'utf8')) as {
  files: Record<string, string>;
};
const hashOf = (name: string) => createHash('sha256').update(readFileSync(join(dir, name), 'utf8')).digest('hex');

describe('hub tracker copy', () => {
  for (const [name, hash] of Object.entries(manifest.files)) {
    it(`${name} is exactly what corpsc-hub/tracker ships`, () => {
      assert.equal(hashOf(name), hash, `${name} was edited by hand`);
    });
  }
});
