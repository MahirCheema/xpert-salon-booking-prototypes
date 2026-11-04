import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const clientsDir = path.join(rootDir, 'clients');
const targetFile = path.join(rootDir, 'src', 'client-configs.js');

if (!fs.existsSync(path.join(rootDir, 'src'))) {
  fs.mkdirSync(path.join(rootDir, 'src'), { recursive: true });
}

const clientSlugs = fs.readdirSync(clientsDir).filter(f => {
  return fs.statSync(path.join(clientsDir, f)).isDirectory();
});

const configs = {};

clientSlugs.forEach(slug => {
  const cfgPath = path.join(clientsDir, slug, 'config.json');
  if (fs.existsSync(cfgPath)) {
    const raw = fs.readFileSync(cfgPath, 'utf8');
    const parsed = JSON.parse(raw);
    configs[slug] = parsed;
  }
});

const content = `// Generated automatically from clients/*/config.json by scripts/sync-configs.js
// Do not edit manually; update clients/<slug>/config.json and run 'npm run sync' or 'node scripts/sync-configs.js'

/*
 * Theme status note for all prototypes:
 * Fallback palettes based on homepage text and vibe.
 * Before presenting to a client as 'matched to your site',
 * perform a visual/CSS check of the live site and replace theme hex colors.
 */

export const CLIENT_CONFIGS = ${JSON.stringify(configs, null, 2)};

export const CLIENT_SLUGS = ${JSON.stringify(Object.keys(configs), null, 2)};

export function getClientConfig(slug) {
  return CLIENT_CONFIGS[slug] || CLIENT_CONFIGS['kapsalon-issa'];
}
`;

fs.writeFileSync(targetFile, content, 'utf8');
console.log(`Successfully synced ${Object.keys(configs).length} client configs to ${targetFile}`);

// Also generate standalone HTML entry points for each client
clientSlugs.forEach(slug => {
  const clientDir = path.join(clientsDir, slug);
  const clientHtmlPath = path.join(clientDir, 'index.html');
  const clientHtml = `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${configs[slug]?.client || slug} - Boekingsprototype | Xpert Solutions</title>
  <meta http-equiv="refresh" content="0; url=../../index.html?client=${slug}">
  <style>
    body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc; color: #1e293b; text-align: center; }
    .card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); max-width: 480px; }
    a { color: #0284c7; text-decoration: none; font-weight: bold; }
  </style>
</head>
<body>
  <div class="card">
    <h2>${configs[slug]?.client || slug}</h2>
    <p>U wordt doorgestuurd naar het interactieve boekingsprototype...</p>
    <p><a href="../../index.html?client=${slug}">Klik hier als u niet automatisch wordt doorgestuurd</a></p>
  </div>
  <script>
    window.location.href = '../../index.html?client=${slug}';
  </script>
</body>
</html>
`;
  fs.writeFileSync(clientHtmlPath, clientHtml, 'utf8');
});
console.log(`Created index.html redirects for all ${clientSlugs.length} clients.`);
