import test from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('All JavaScript files pass syntax check', () => {
  const files = [
    'src/app.js',
    'src/data-store.js',
    'src/slot-engine.js',
    'src/client-configs.js',
    'server.js',
    'scripts/sync-configs.js'
  ];

  files.forEach(file => {
    const filePath = path.join(rootDir, file);
    assert.doesNotThrow(() => {
      execSync(`node --check "${filePath}"`, { stdio: 'pipe' });
    }, `Syntax check failed for ${file}`);
  });
});

