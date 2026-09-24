// Ağ kuralları reklamların büyük kısmını engelliyor. Bu script, yine de
// araya giren bir reklam arayüzü olursa oynatıcıyı içeriğe geri döndürür.
(() => {
  const AD_CLASSES = ['vjs-ad-playing', 'vjs-ad-loading', 'vjs-ad-content-resuming'];

  function cleanPlayers() {
    document.querySelectorAll('.video-js').forEach((player) => {
      if (!AD_CLASSES.some((c) => player.classList.contains(c))) return;
      player.classList.remove(...AD_CLASSES);
      const video = player.querySelector('video');
      if (video && video.paused) video.play().catch(() => {});
    });
    document.querySelectorAll('.ima-ad-container, [id^="google_ads_iframe"]').forEach((el) => el.remove());
  }

  // Chat sürekli DOM değiştirdiği için kareye en fazla bir kez çalıştır
  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      cleanPlayers();
    });
  });
  const start = () => {
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    });
    cleanPlayers();
  };

  chrome.storage.local.get({ enabled: true }, ({ enabled }) => {
    if (!enabled) {
      document.documentElement.classList.add('clearstream-off');
      return;
    }
    start();
  });
})();
