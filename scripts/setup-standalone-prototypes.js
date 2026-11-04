import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const clientsDir = path.join(rootDir, 'clients');

const clientSlugs = fs.readdirSync(clientsDir).filter(f => {
  return fs.statSync(path.join(clientsDir, f)).isDirectory();
});

clientSlugs.forEach(slug => {
  const cfgPath = path.join(clientsDir, slug, 'config.json');
  if (!fs.existsSync(cfgPath)) return;

  const raw = fs.readFileSync(cfgPath, 'utf8');
  const cfg = JSON.parse(raw);
  const clientName = cfg.client || slug;

  // 1. Create index.html
  const htmlContent = `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>${clientName} - Standalone Boekingsprototype | Xpert Solutions</title>
  <meta name="description" content="Standalone booking prototype for ${clientName} (${cfg.city}) in React 19 + Tailwind v4." />
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220%22%3E<text y=%22.9em%22 font-size=%2290%22>✂️</text></svg>">
</head>
<body class="bg-slate-50 antialiased">
  <div id="root">
    <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; color: #64748B;">
      <p>${clientName} prototype laden...</p>
    </div>
  </div>
  <script type="module" src="./main.tsx"></script>
</body>
</html>
`;

  // 2. Create main.tsx
  const tsxContent = `import React from 'react';
import { createRoot } from 'react-dom/client';
import '../../src/styles/index.css';
import { App } from '../../src/app/App';

const container = document.getElementById('root');
if (container) {
  createRoot(container).render(
    <React.StrictMode>
      <App initialSlug="${slug}" isStandalone={true} />
    </React.StrictMode>
  );
}
`;

  fs.writeFileSync(path.join(clientsDir, slug, 'index.html'), htmlContent, 'utf8');
  fs.writeFileSync(path.join(clientsDir, slug, 'main.tsx'), tsxContent, 'utf8');
  console.log(`Generated standalone files for ${slug}`);
});

console.log('Finished setting up all standalone prototype folders.');

