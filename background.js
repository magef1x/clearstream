// Counts blocked requests, applies the on/off state (Kick rules + Twitch script)
// and checks for updates on request.
// onRuleMatchedDebug only fires for unpacked (developer mode) extensions.

// Chrome stops this worker after ~30s idle and everything in memory is lost,
// so per-tab counts live in storage.session (until the browser closes) and the total in storage.local.
let tabCounts = {};
let pendingTotal = 0;
let flushTimer = null;
const ready = chrome.storage.session.get({ tabCounts: {} }).then((r) => {
  tabCounts = r.tabCounts;
});

function scheduleFlush() {
  if (!flushTimer) flushTimer = setTimeout(flush, 500);
}

async function flush() {
  flushTimer = null;
  const add = pendingTotal;
  pendingTotal = 0;
  await chrome.storage.session.set({ tabCounts });
  if (add) {
    const { total } = await chrome.storage.local.get({ total: 0 });
    await chrome.storage.local.set({ total: total + add });
  }
}

function updateBadge(tabId) {
  const n = tabCounts[tabId] || 0;
  chrome.action.setBadgeText({ tabId, text: n ? String(n) : '' }).catch(() => {});
}

chrome.declarativeNetRequest.onRuleMatchedDebug?.addListener(async ({ request }) => {
  await ready;
  const tabId = request.tabId;
  if (tabId >= 0) {
    tabCounts[tabId] = (tabCounts[tabId] || 0) + 1;
    updateBadge(tabId);
  }
  pendingTotal++;
  scheduleFlush();
});

// Reset the tab count on reload / navigation
chrome.tabs.onUpdated.addListener(async (tabId, info) => {
  if (info.status === 'loading' && info.url) {
    await ready;
    delete tabCounts[tabId];
    updateBadge(tabId);
    scheduleFlush();
  }
});
chrome.tabs.onRemoved.addListener(async (tabId) => {
  await ready;
  delete tabCounts[tabId];
  scheduleFlush();
});

async function applyEnabled(enabled) {
  await chrome.declarativeNetRequest.updateEnabledRulesets(
    enabled ? { enableRulesetIds: ['ads'] } : { disableRulesetIds: ['ads'] }
  );
  chrome.action.setBadgeBackgroundColor({ color: enabled ? '#53fc18' : '#666' });
}

// --- Twitch: Twitch stitches ads into the stream itself, so blocking requests doesn't help.
// vaft (vendor/vaft.js, from TwitchAdSolutions) runs in the page and swaps to an ad-free
// stream while an ad plays. It's registered dynamically so it can be switched off.

const TWITCH_SCRIPT = {
  id: 'twitch-vaft',
  matches: ['*://*.twitch.tv/*'],
  js: ['twitch-check.js', 'vendor/vaft.js'],
  runAt: 'document_start',
  world: 'MAIN',
  persistAcrossSessions: true,
};

// Serialized so overlapping calls (startup + a popup click) can't register the script twice
let twitchQueue = Promise.resolve();
function applyTwitch() {
  twitchQueue = twitchQueue.then(async () => {
    const { enabled, twitch } = await chrome.storage.local.get({ enabled: true, twitch: true });
    const want = enabled && twitch;
    const registered = (await chrome.scripting.getRegisteredContentScripts({ ids: [TWITCH_SCRIPT.id] })).length > 0;
    if (want && !registered) await chrome.scripting.registerContentScripts([TWITCH_SCRIPT]);
    if (!want && registered) await chrome.scripting.unregisterContentScripts({ ids: [TWITCH_SCRIPT.id] });
  }).catch((e) => console.warn('Twitch script:', e));
  return twitchQueue;
}

async function applyAll() {
  const { enabled } = await chrome.storage.local.get({ enabled: true });
  await Promise.all([applyEnabled(enabled), applyTwitch()]);
}

chrome.runtime.onInstalled.addListener(applyAll);
chrome.runtime.onStartup.addListener(applyAll);

// --- Update check: only runs when the user clicks the button in settings ---

const RELEASE_API = 'https://api.github.com/repos/magef1x/clearstream/releases/latest';
const CURRENT_VERSION = chrome.runtime.getManifest().version;

// Compares versions part by part, so "1.10.0" > "1.9.2"
function isNewer(latest, current) {
  const a = latest.split('.').map(Number);
  const b = current.split('.').map(Number);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if ((a[i] || 0) !== (b[i] || 0)) return (a[i] || 0) > (b[i] || 0);
  }
  return false;
}

async function checkForUpdate() {
  const res = await fetch(RELEASE_API, { headers: { Accept: 'application/vnd.github+json' } });
  if (!res.ok) throw new Error(`GitHub ${res.status}`);
  const release = await res.json();
  const zip = release.assets?.find((a) => a.name.endsWith('.zip'));
  // Saved so the popup can show the banner without making a new request
  await chrome.storage.local.set({
    update: {
      version: release.tag_name.replace(/^v/, ''),
      page: release.html_url,
      download: zip ? zip.browser_download_url : release.html_url,
    },
  });
}

async function getSavedUpdate() {
  const { update } = await chrome.storage.local.get({ update: null });
  return update && isNewer(update.version, CURRENT_VERSION) ? update : null;
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'getStats') {
    Promise.all([ready, chrome.storage.local.get({ total: 0, enabled: true, twitch: true })]).then(([, s]) => {
      sendResponse({ total: s.total + pendingTotal, tab: tabCounts[msg.tabId] || 0, enabled: s.enabled, twitch: s.twitch });
    });
    return true;
  }
  if (msg.type === 'setEnabled') {
    chrome.storage.local.set({ enabled: msg.enabled })
      .then(applyAll)
      .then(() => sendResponse({ ok: true }));
    return true;
  }
  if (msg.type === 'setTwitch') {
    chrome.storage.local.set({ twitch: msg.twitch })
      .then(applyTwitch)
      .then(() => sendResponse({ ok: true }));
    return true;
  }
  if (msg.type === 'getUpdate') {
    getSavedUpdate().then(sendResponse);
    return true;
  }
  if (msg.type === 'checkUpdate') {
    checkForUpdate()
      .then(getSavedUpdate)
      .then((update) => sendResponse({ ok: true, update }))
      .catch(() => sendResponse({ ok: false }));
    return true;
  }
});
