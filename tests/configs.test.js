import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientsDir = path.join(__dirname, '..', 'clients');

const expectedSlugs = [
  'kapsalon-issa',
  'violettas-dog-grooming',
  'trimsalon-limbo',
  'hondentrimsalon-finn',
  'kapsalon-faya',
  'trimsalon-het-hofje',
  'salonyourbeauty',
  'kapsalon-van-haaren',
  'polat-beauty',
  'de-kleinste-kapsalon',
  'feel-smooth',
  'kapsalon-headline'
];

test('All 12 expected client folders exist and have config.json and README.md', () => {
  expectedSlugs.forEach(slug => {
    const dir = path.join(clientsDir, slug);
    assert.ok(fs.existsSync(dir), `Folder clients/${slug} must exist`);
    assert.ok(fs.existsSync(path.join(dir, 'config.json')), `clients/${slug}/config.json must exist`);
    assert.ok(fs.existsSync(path.join(dir, 'README.md')), `clients/${slug}/README.md must exist`);
  });
});

test('All 12 configs strictly follow the database contract and theme specs', () => {
  expectedSlugs.forEach(slug => {
    const raw = fs.readFileSync(path.join(clientsDir, slug, 'config.json'), 'utf8');
    const cfg = JSON.parse(raw);

    assert.equal(cfg.slug, slug, `Slug in config must match directory name`);
    assert.ok(cfg.client && cfg.client.length > 0, `Client name required for ${slug}`);
    assert.ok(cfg.type && cfg.type.length > 0, `Type required for ${slug}`);
    assert.ok(cfg.city && cfg.city.length > 0, `City required for ${slug}`);

    // Theme checks
    assert.ok(cfg.theme, `Theme required for ${slug}`);
    assert.ok(cfg.theme.primary && cfg.theme.primary.startsWith('#'), `Primary color must be hex in ${slug}`);
    assert.ok(cfg.theme.accent && cfg.theme.accent.startsWith('#'), `Accent color must be hex in ${slug}`);
    assert.ok(cfg.theme.background && cfg.theme.background.startsWith('#'), `Background color must be hex in ${slug}`);
    assert.ok(cfg.theme.surface && cfg.theme.surface.startsWith('#'), `Surface color must be hex in ${slug}`);
    assert.ok(cfg.theme.text && cfg.theme.text.startsWith('#'), `Text color must be hex in ${slug}`);

    // Services checks
    assert.ok(Array.isArray(cfg.services) && cfg.services.length > 0, `Services array required for ${slug}`);
    cfg.services.forEach(s => {
      assert.ok(s.name, `Service name required in ${slug}`);
      assert.ok(typeof s.duration_min === 'number' && s.duration_min > 0, `Valid duration required for ${s.name} in ${slug}`);
    });

    // Sample appointments
    assert.ok(Array.isArray(cfg.sample_appointments), `sample_appointments array required in ${slug}`);
    cfg.sample_appointments.forEach(apt => {
      assert.ok(apt.id, `id required in sample appointment`);
      assert.ok(apt.date, `date required in sample appointment`);
      assert.ok(apt.time, `time required in sample appointment`);
      assert.ok(apt.service, `service required in sample appointment`);
    });

    // Toast spec
    assert.ok(cfg.toast_spec, `toast_spec required in ${slug}`);
    assert.equal(cfg.toast_spec.position, 'bottom-right');
    assert.equal(cfg.toast_spec.auto_dismiss_ms, 4000);

    // Confirm dialog spec
    assert.ok(cfg.confirm_dialog_spec, `confirm_dialog_spec required in ${slug}`);
  });
});

