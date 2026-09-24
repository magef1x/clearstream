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

function showUpdate(update) {
  $('update').hidden = !update;
  if (!update) return;
  $('update-version').textContent = 'v' + update.version;
  $('update').href = update.download;
  $('update').title = 'Neler yeni: ' + update.page;
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
  btn.textContent = 'Kontrol ediliyor…';
  result.textContent = '';
  result.className = 'check-result';

  const res = await chrome.runtime.sendMessage({ type: 'checkUpdate' });
  btn.disabled = false;
  btn.textContent = 'Güncellemeleri kontrol et';

  if (!res?.ok) {
    result.textContent = 'GitHub\'a ulaşılamadı, sonra tekrar dene.';
    result.classList.add('error');
  } else if (res.update) {
    result.textContent = `v${res.update.version} çıkmış, yukarıdaki banttan indirebilirsin.`;
    result.classList.add('new');
    showUpdate(res.update);
  } else {
    result.textContent = 'En güncel sürümü kullanıyorsun ✓';
    result.classList.add('ok');
  }
});

$('version').textContent = 'v' + chrome.runtime.getManifest().version;

// Daha önce bulunmuş bir güncelleme varsa göster (yeni istek atmaz)
chrome.runtime.sendMessage({ type: 'getUpdate' }, showUpdate);

chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  activeTab = tab;
  refresh();
  setInterval(refresh, 1000);
});
