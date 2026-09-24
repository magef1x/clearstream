// Network rules block most ads. If an ad UI still slips through,
// this script puts the player back on the stream.
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

  // Chat mutates the DOM constantly, so run at most once per frame
  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      cleanPlayers();
    });
  });
  function apply(enabled) {
    document.documentElement.classList.toggle('clearstream-off', !enabled);
    if (!enabled) {
      observer.disconnect();
      return;
    }
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    });
    cleanPlayers();
  }

  chrome.storage.local.get({ enabled: true }, ({ enabled }) => apply(enabled));

  // Toggling from the popup applies right away, no reload needed
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.enabled) apply(changes.enabled.newValue);
  });
})();
