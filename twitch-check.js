// Runs in the Twitch page right before vendor/vaft.js. Looks for another Twitch
// ad blocker that got there first, and leaves a note on <html> for the popup.
(() => {
  let conflict = null;
  if (typeof window.twitchAdSolutionsVersion !== 'undefined') {
    // Another copy of vaft / TwitchAdSolutions (e.g. through uBlock Origin or a userscript)
    conflict = 'vaft';
  } else if (!/\[native code\]/.test(String(window.Worker))) {
    // Something already replaced Twitch's player worker (Purple AdBlock, TwitchNoSub, ...)
    conflict = 'worker';
  }
  if (conflict) document.documentElement.dataset.clearstreamConflict = conflict;
})();
