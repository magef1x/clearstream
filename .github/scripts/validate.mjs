// Sanity checks run on every push: catches a broken manifest, missing files
// or untranslated strings before they end up in a release.
import { readFileSync, existsSync, readdirSync } from 'node:fs';

const errors = [];
const readJson = (path) => {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (e) {
    errors.push(`${path}: ${e.message}`);
    return null;
  }
};

const manifest = readJson('manifest.json');
const rules = readJson('rules.json');

// Every file the manifest points to must exist
if (manifest) {
  const files = [
    manifest.background?.service_worker,
    manifest.action?.default_popup,
    ...manifest.declarative_net_request.rule_resources.map((r) => r.path),
    ...manifest.content_scripts.flatMap((c) => [...(c.js || []), ...(c.css || [])]),
  ];
  for (const f of files) if (!existsSync(f)) errors.push(`manifest.json references missing file: ${f}`);
  // Scripts registered at runtime (e.g. the Twitch script) are listed in background.js
  const bg = readFileSync(manifest.background.service_worker, 'utf8');
  for (const m of bg.matchAll(/js:\s*\[([^\]]*)\]/g)) {
    for (const f of m[1].match(/'[^']+'/g) || []) {
      if (!existsSync(f.slice(1, -1))) errors.push(`background.js registers missing file: ${f}`);
    }
  }
  if (!/^\d+\.\d+\.\d+$/.test(manifest.version)) errors.push(`manifest.json: bad version "${manifest.version}"`);
}

// Rule ids must be unique
if (rules) {
  const ids = rules.map((r) => r.id);
  if (new Set(ids).size !== ids.length) errors.push('rules.json: duplicate rule ids');
}

// All locales must have the same keys, and every key used in the UI must exist
const locales = readdirSync('_locales');
const keys = Object.fromEntries(locales.map((l) => [l, Object.keys(readJson(`_locales/${l}/messages.json`) || {})]));
const base = keys[manifest?.default_locale || 'en'] || [];
for (const [locale, list] of Object.entries(keys)) {
  for (const k of base) if (!list.includes(k)) errors.push(`_locales/${locale}: missing "${k}"`);
  for (const k of list) if (!base.includes(k)) errors.push(`_locales/${locale}: extra "${k}"`);
}

const used = new Set();
for (const m of readFileSync('popup.html', 'utf8').matchAll(/data-i18n(?:-[a-z-]+)?="(\w+)"/g)) used.add(m[1]);
for (const m of readFileSync('popup.js', 'utf8').matchAll(/\bt\('(\w+)'/g)) used.add(m[1]);
for (const m of JSON.stringify(manifest).matchAll(/__MSG_(\w+)__/g)) used.add(m[1]);
for (const k of used) if (!base.includes(k)) errors.push(`"${k}" is used but not defined in _locales`);

if (errors.length) {
  console.error(errors.map((e) => `✗ ${e}`).join('\n'));
  process.exit(1);
}
console.log(`✓ Clearstream ${manifest.version}: manifest, rules and ${locales.length} locales look good`);
