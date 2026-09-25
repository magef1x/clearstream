# Clearstream

[![Release](https://img.shields.io/github/v/release/magef1x/clearstream)](https://github.com/magef1x/clearstream/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/magef1x/clearstream/total)](https://github.com/magef1x/clearstream/releases)
[![Validate](https://github.com/magef1x/clearstream/actions/workflows/validate.yml/badge.svg)](https://github.com/magef1x/clearstream/actions/workflows/validate.yml)
[![CodeQL](https://github.com/magef1x/clearstream/actions/workflows/codeql.yml/badge.svg)](https://github.com/magef1x/clearstream/actions/workflows/codeql.yml)
[![License](https://img.shields.io/github/license/magef1x/clearstream)](LICENSE)

[Türkçe](README.tr.md)

Ad blocker for Kick and Twitch. Blocks video ads and banners on Kick, and video ads on Twitch (experimental).

**[Download](https://github.com/magef1x/clearstream/releases/latest/download/clearstream.zip)**

## Install

1. Download the zip and extract it
2. Open your browser's extensions page and turn on developer mode
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
   - Brave: `brave://extensions`
   - Opera: `opera://extensions`
3. Click "Load unpacked" and select the `clearstream` folder
4. Refresh Kick or Twitch

If you delete the folder, the extension is removed too.

The extension uses your browser language (English or Turkish). You can change it in ⚙ settings.

## Updating

In the extension menu, go to ⚙ > "Check for updates". If there's a new version, download the zip, extract it over the old folder, then reload the extension on the extensions page.

## Permissions

| Permission | Why |
|---|---|
| Access to kick.com and twitch.tv | The only sites it runs on |
| `declarativeNetRequest` | Blocks ad requests |
| `declarativeNetRequestFeedback` | Counts blocked requests for the counter |
| `storage` | Saves on/off, the counter and your language |
| `tabs` | Shows the count for the current tab and the "Refresh" link |
| `scripting` | Turns the Twitch script on and off |

It doesn't collect any data or download code from the internet. On Twitch, the ad blocking script talks only to Twitch's own servers. Other than that, the only request it makes is to the GitHub API when you click "Check for updates".

## Twitch

Twitch puts ads inside the stream itself, so blocking ad servers doesn't work there. Clearstream uses [vaft](https://github.com/pixeltris/TwitchAdSolutions) for this: when an ad starts, it switches to an ad-free copy of the stream until the ad is over. The quality may drop for a few seconds and the player reloads once when the ad ends.

It's experimental and can be turned off in ⚙ settings. Don't use it together with another Twitch ad blocker. If Clearstream notices one, the menu shows a warning.

## Issues

If ads start showing up again, [open an issue](https://github.com/magef1x/clearstream/issues).

---

Not affiliated with Kick or Twitch. [MIT](LICENSE)

Twitch ad blocking uses vaft by the [TwitchAdSolutions](https://github.com/pixeltris/TwitchAdSolutions) contributors, included unmodified under the MIT License ([vendor/LICENSE-vaft](vendor/LICENSE-vaft)).
