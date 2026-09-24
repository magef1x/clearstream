const $ = (id) => document.getElementById(id);
const fmt = (n) => n.toLocaleString('tr-TR');
let activeTab;

function render({ total, tab, enabled }) {
  $('total').textContent = fmt(total);
  $('tab').textContent = fmt(tab);
  $('toggle').checked = enabled;
  $('status').textContent = enabled ? 'Koruma açık' : 'Koruma kapalı';
  document.body.classList.toggle('off', !enabled);
}

function refresh() {
  chrome.runtime.sendMessage({ type: 'getStats', tabId: activeTab?.id }, render);
}

$('toggle').addEventListener('change', async (e) => {
  const enabled = e.target.checked;
  await chrome.runtime.sendMessage({ type: 'setEnabled', enabled });
  refresh();
  // Değişikliğin etkili olması için açık Kick sekmesini yenile
  if (activeTab && /^https?:\/\/([^/]+\.)?kick\.com\//.test(activeTab.url || '')) {
    chrome.tabs.reload(activeTab.id);
  }
});

$('reset').addEventListener('click', async () => {
  await chrome.runtime.sendMessage({ type: 'reset' });
  refresh();
});

chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  activeTab = tab;
  refresh();
  setInterval(refresh, 1000);
});
