# Clearstream

[![Release](https://img.shields.io/github/v/release/magef1x/clearstream)](https://github.com/magef1x/clearstream/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/magef1x/clearstream/total)](https://github.com/magef1x/clearstream/releases)
[![Validate](https://github.com/magef1x/clearstream/actions/workflows/validate.yml/badge.svg)](https://github.com/magef1x/clearstream/actions/workflows/validate.yml)
[![CodeQL](https://github.com/magef1x/clearstream/actions/workflows/codeql.yml/badge.svg)](https://github.com/magef1x/clearstream/actions/workflows/codeql.yml)
[![License](https://img.shields.io/github/license/magef1x/clearstream)](LICENSE)

[English](README.md)

Kick ve Twitch için reklam engelleyici. Kick'te video reklamları ve banner'ları, Twitch'te video reklamları engeller (deneysel).

**[İndir](https://github.com/magef1x/clearstream/releases/latest/download/clearstream.zip)**

## Kurulum

1. Zip'i indirip klasöre çıkar
2. Tarayıcının eklentiler sayfasını aç ve geliştirici modunu aç
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
   - Brave: `brave://extensions`
   - Opera: `opera://extensions`
3. "Paketlenmemiş öğe yükle" ile `clearstream` klasörünü seç
4. Kick'i ya da Twitch'i yenile

Klasörü silersen eklenti de kaldırılır.

Eklenti tarayıcının diline göre Türkçe veya İngilizce açılır. Dili ⚙ ayarlarından değiştirebilirsin.

## Güncelleme

Eklenti menüsünde ⚙ > "Güncellemeleri kontrol et". Yeni sürüm varsa zip'i indirip eski klasörün üzerine yaz, sonra eklentiler sayfasında eklentiyi yenile.

## İzinler

| İzin | Neden |
|---|---|
| kick.com ve twitch.tv erişimi | Çalıştığı tek siteler |
| `declarativeNetRequest` | Reklam isteklerini engeller |
| `declarativeNetRequestFeedback` | Sayaç için engellenen istekleri sayar |
| `storage` | Aç/kapa durumunu, sayacı ve dil seçimini kaydeder |
| `tabs` | Açık sekmenin sayısını ve "Yenile" linkini gösterir |
| `scripting` | Twitch script'ini açıp kapatır |

Hiçbir veri toplamaz, internetten kod indirmez. Twitch'te reklam engelleme script'i sadece Twitch'in kendi sunucularıyla konuşur. Bunun dışında yaptığı tek istek, "Güncellemeleri kontrol et"e bastığında GitHub API'ye gider.

## Twitch

Twitch reklamları yayının içine gömüyor, bu yüzden reklam sunucularını engellemek orada işe yaramıyor. Clearstream bunun için [vaft](https://github.com/pixeltris/TwitchAdSolutions) kullanıyor: reklam başlayınca reklam bitene kadar yayının reklamsız kopyasına geçiyor. Birkaç saniye kalite düşebilir, reklam bitince oynatıcı bir kez yeniden yüklenir.

Deneysel bir özellik, ⚙ ayarlarından kapatılabilir. Başka bir Twitch reklam engelleyiciyle birlikte kullanma. Clearstream böyle birini fark ederse menüde uyarı gösterir.

## Sorun

Reklam tekrar çıkmaya başladıysa [issue açabilirsin](https://github.com/magef1x/clearstream/issues).

---

Kick ya da Twitch ile bağlantılı değildir. [MIT](LICENSE)

Twitch reklam engelleme, [TwitchAdSolutions](https://github.com/pixeltris/TwitchAdSolutions) katkıcılarının vaft script'ini kullanır. Script değiştirilmeden MIT lisansıyla eklenmiştir ([vendor/LICENSE-vaft](vendor/LICENSE-vaft)).
