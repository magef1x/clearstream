const $ = (id) => document.getElementById(id);
let activeTab;

// Language: 'auto' follows the browser via chrome.i18n. chrome.i18n can't be switched at
// runtime, so for a manual choice we load _locales/<lang>/messages.json ourselves.
const LANGUAGES = ['en', 'tr'];
let messages = null;
let lang = chrome.i18n.getUILanguage();

function t(key, ...subs) {
  if (!messages) return chrome.i18n.getMessage(key, subs);
  const entry = messages[key];
  if (!entry) return '';
  return entry.message.replace(/\$(\w+)\$/g, (_, name) => {
    const content = entry.placeholders?.[name.toLowerCase()]?.content || '';
    return content.replace(/\$(\d)/g, (_, i) => subs[i - 1] ?? '');
  });
}

const fmt = (n) => n.toLocaleString(lang);

async function loadLanguage(choice) {
  if (!LANGUAGES.includes(choice)) {
    messages = null;
    lang = chrome.i18n.getUILanguage();
    return;
  }
  const res = await fetch(chrome.runtime.getURL(`_locales/${choice}/messages.json`));
  messages = await res.json();
  lang = choice;
}

// Fill in static text from the current language
function applyTranslations() {
  document.documentElement.lang = lang.split(/[-_]/)[0];
  document.querySelectorAll('[data-i18n]').forEach((el) => (el.textContent = t(el.dataset.i18n)));
  document.querySelectorAll('[data-i18n-title]').forEach((el) => (el.title = t(el.dataset.i18nTitle)));
  document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => el.setAttribute('aria-label', t(el.dataset.i18nAriaLabel)));
}

// If files were replaced but the extension wasn't reloaded in chrome://extensions,
// Chrome still uses the old manifest and can't find _locales, so every string is empty.
// Show a plain notice instead of a blank popup.
if (!t('protectionOn')) {
  document.body.innerHTML =
    "<p class=\"stale\">Clearstream was updated. Reload it on your browser's extensions page " +
    '(⟳).</p>';
  throw new Error('Extension needs a reload');
}

function render({ total, tab, enabled }) {
  $('total').textContent = fmt(total);
  $('tab').textContent = fmt(tab);
  $('toggle').checked = enabled;
  $('status').textContent = t(enabled ? 'protectionOn' : 'protectionOff');
  document.body.classList.toggle('off', !enabled);
}

function refresh() {
  chrome.runtime.sendMessage({ type: 'getStats', tabId: activeTab?.id }, render);
}

function showUpdate(update) {
  $('update').hidden = !update;
  if (!update) return;
  $('update-version').textContent = 'v' + update.version;
  $('update').href = update.download;
  $('update').title = `${t('whatsNew')} ${update.page}`;
}

$('toggle').addEventListener('change', async (e) => {
  const enabled = e.target.checked;
  await chrome.runtime.sendMessage({ type: 'setEnabled', enabled });
  refresh();
  // Ads already loaded on the page stay until a refresh, so offer one (but don't force it)
  $('reload-hint').hidden = !isKickTab();
});

const isKickTab = () => /^https?:\/\/([^/]+\.)?kick\.com\//.test(activeTab?.url || '');

$('reload-btn').addEventListener('click', () => {
  chrome.tabs.reload(activeTab.id);
  $('reload-hint').hidden = true;
});

$('settings-btn').addEventListener('click', () => {
  const open = $('settings-view').hidden;
  $('settings-view').hidden = !open;
  $('main-view').hidden = open;
  $('settings-btn').classList.toggle('active', open);
});

$('check-update').addEventListener('click', async () => {
  const btn = $('check-update');
  const result = $('check-result');
  btn.disabled = true;
  btn.textContent = t('checking');
  result.textContent = '';
  result.className = 'check-result';

  const res = await chrome.runtime.sendMessage({ type: 'checkUpdate' });
  btn.disabled = false;
  btn.textContent = t('checkUpdates');

  if (!res?.ok) {
    result.textContent = t('updateError');
    result.classList.add('error');
  } else if (res.update) {
    result.textContent = t('updateFound', res.update.version);
    result.classList.add('new');
    showUpdate(res.update);
  } else {
    result.textContent = t('upToDate');
    result.classList.add('ok');
  }
});

$('version').textContent = 'v' + chrome.runtime.getManifest().version;

// Chrome focuses the first button when the popup opens, which draws a focus ring on ⚙
document.activeElement?.blur();

// Brave Shields blocks ad requests before extensions see them, so on Brave the
// counter can stay at 0 even though ads are blocked. Explain that behind a "?".
navigator.brave?.isBrave().then((isBrave) => {
  if (isBrave) $('brave-help').hidden = false;
});

$('brave-help').addEventListener('click', () => {
  const open = $('brave-note').hidden;
  $('brave-note').hidden = !open;
  $('brave-help').setAttribute('aria-expanded', String(open));
});

$('language').addEventListener('change', async (e) => {
  await chrome.storage.local.set({ language: e.target.value });
  await loadLanguage(e.target.value);
  applyTranslations();
  refresh();
  $('check-result').textContent = '';
});

chrome.storage.local.get({ language: 'auto' }, async ({ language }) => {
  $('language').value = language;
  await loadLanguage(language);
  applyTranslations();

  // Show a previously found update, if any (no new request)
  chrome.runtime.sendMessage({ type: 'getUpdate' }, showUpdate);

  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    activeTab = tab;
    refresh();
    setInterval(refresh, 1000);
  });
});
