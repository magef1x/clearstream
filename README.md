# Clearstream

[![Release](https://img.shields.io/github/v/release/magef1x/clearstream)](https://github.com/magef1x/clearstream/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/magef1x/clearstream/total)](https://github.com/magef1x/clearstream/releases)
[![Validate](https://github.com/magef1x/clearstream/actions/workflows/validate.yml/badge.svg)](https://github.com/magef1x/clearstream/actions/workflows/validate.yml)
[![CodeQL](https://github.com/magef1x/clearstream/actions/workflows/codeql.yml/badge.svg)](https://github.com/magef1x/clearstream/actions/workflows/codeql.yml)
[![License](https://img.shields.io/github/license/magef1x/clearstream)](LICENSE)

[Türkçe](README.tr.md)

Ad blocker for Kick. Blocks video ads and banners.

**[Download](https://github.com/magef1x/clearstream/releases/latest/download/clearstream.zip)**

## Install

1. Download the zip and extract it
2. Open your browser's extensions page and turn on developer mode
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
   - Brave: `brave://extensions`
   - Opera: `opera://extensions`
3. Click "Load unpacked" and select the `clearstream` folder
4. Refresh Kick

If you delete the folder, the extension is removed too.

The extension uses your browser language (English or Turkish). You can change it in ⚙ settings.

## Updating

In the extension menu, go to ⚙ > "Check for updates". If there's a new version, download the zip, extract it over the old folder, then reload the extension on the extensions page.

## Permissions

| Permission | Why |
|---|---|
| Access to kick.com | The only site it runs on |
| `declarativeNetRequest` | Blocks ad requests |
| `declarativeNetRequestFeedback` | Counts blocked requests for the counter |
| `storage` | Saves on/off, the counter and your language |
| `tabs` | Shows the count for the current tab and the "Refresh" link |

It doesn't collect any data or download code from the internet. The only request it makes on its own is to the GitHub API when you click "Check for updates".

## Issues

If ads start showing up again, [open an issue](https://github.com/magef1x/clearstream/issues).

---

Not affiliated with Kick. [MIT](LICENSE)
