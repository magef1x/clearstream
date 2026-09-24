// Engellenen istekleri sayar, açma/kapama durumunu uygular.
// onRuleMatchedDebug sadece paketlenmemiş (geliştirici modu) eklentilerde çalışır.

const tabCounts = {};
let pendingTotal = 0;
let flushTimer = null;

function flush() {
  flushTimer = null;
  const add = pendingTotal;
  pendingTotal = 0;
  chrome.storage.local.get({ total: 0 }, ({ total }) => {
    chrome.storage.local.set({ total: total + add });
  });
}

function updateBadge(tabId) {
  const n = tabCounts[tabId] || 0;
  chrome.action.setBadgeText({ tabId, text: n ? String(n) : '' });
}

chrome.declarativeNetRequest.onRuleMatchedDebug?.addListener(({ request }) => {
  const tabId = request.tabId;
  if (tabId >= 0) {
    tabCounts[tabId] = (tabCounts[tabId] || 0) + 1;
    updateBadge(tabId);
  }
  pendingTotal++;
  if (!flushTimer) flushTimer = setTimeout(flush, 1000);
});

// Sayfa yenilenince / başka sayfaya geçince sekme sayacını sıfırla
chrome.tabs.onUpdated.addListener((tabId, info) => {
  if (info.status === 'loading' && info.url) {
    delete tabCounts[tabId];
    updateBadge(tabId);
  }
});
chrome.tabs.onRemoved.addListener((tabId) => delete tabCounts[tabId]);

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

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'getStats') {
    chrome.storage.local.get({ total: 0, enabled: true }, ({ total, enabled }) => {
      sendResponse({ total: total + pendingTotal, tab: tabCounts[msg.tabId] || 0, enabled });
    });
    return true;
  }
  if (msg.type === 'setEnabled') {
    chrome.storage.local.set({ enabled: msg.enabled });
    applyEnabled(msg.enabled).then(() => sendResponse({ ok: true }));
    return true;
  }
  if (msg.type === 'reset') {
    pendingTotal = 0;
    for (const id in tabCounts) {
      delete tabCounts[id];
      updateBadge(Number(id));
    }
    chrome.storage.local.set({ total: 0 }, () => sendResponse({ ok: true }));
    return true;
  }
});
