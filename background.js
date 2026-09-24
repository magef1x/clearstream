// Engellenen istekleri sayar, açma/kapama durumunu uygular, istenince güncelleme kontrol eder.
// onRuleMatchedDebug sadece paketlenmemiş (geliştirici modu) eklentilerde çalışır.

// Chrome bu script'i ~30 sn boşta kalınca durdurur, bellekteki her şey silinir.
// Bu yüzden sekme sayaçları storage.session'da (tarayıcı kapanana kadar), toplam storage.local'da tutulur.
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

// Sayfa yenilenince / başka sayfaya geçince sekme sayacını sıfırla
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

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get({ enabled: true }, ({ enabled }) => applyEnabled(enabled));
});
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get({ enabled: true }, ({ enabled }) => applyEnabled(enabled));
});

// --- Güncelleme kontrolü: sadece kullanıcı ayarlardan butona basınca çalışır ---

const RELEASE_API = 'https://api.github.com/repos/magef1x/clearstream/releases/latest';
const CURRENT_VERSION = chrome.runtime.getManifest().version;

// "1.10.0" > "1.9.2" gibi sürümleri sayı sayı karşılaştırır
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
  // Bulunan sürüm saklanır ki menü her açıldığında yeniden istek atmadan bant gösterilsin
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
    Promise.all([ready, chrome.storage.local.get({ total: 0, enabled: true })]).then(([, { total, enabled }]) => {
      sendResponse({ total: total + pendingTotal, tab: tabCounts[msg.tabId] || 0, enabled });
    });
    return true;
  }
  if (msg.type === 'setEnabled') {
    chrome.storage.local.set({ enabled: msg.enabled });
    applyEnabled(msg.enabled).then(() => sendResponse({ ok: true }));
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
