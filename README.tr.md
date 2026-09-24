# Clearstream

[![Release](https://img.shields.io/github/v/release/magef1x/clearstream)](https://github.com/magef1x/clearstream/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/magef1x/clearstream/total)](https://github.com/magef1x/clearstream/releases)
[![Validate](https://github.com/magef1x/clearstream/actions/workflows/validate.yml/badge.svg)](https://github.com/magef1x/clearstream/actions/workflows/validate.yml)
[![CodeQL](https://github.com/magef1x/clearstream/actions/workflows/codeql.yml/badge.svg)](https://github.com/magef1x/clearstream/actions/workflows/codeql.yml)
[![License](https://img.shields.io/github/license/magef1x/clearstream)](LICENSE)

[English](README.md)

Kick için reklam engelleyici. Video reklamları ve banner'ları engeller.

**[İndir](https://github.com/magef1x/clearstream/releases/latest/download/clearstream.zip)**

## Kurulum

1. Zip'i indirip klasöre çıkar
2. Tarayıcının eklentiler sayfasını aç ve geliştirici modunu aç
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
   - Brave: `brave://extensions`
   - Opera: `opera://extensions`
3. "Paketlenmemiş öğe yükle" ile `clearstream` klasörünü seç
4. Kick'i yenile

Klasörü silersen eklenti de kaldırılır.

Eklenti tarayıcının diline göre Türkçe veya İngilizce açılır. Dili ⚙ ayarlarından değiştirebilirsin.

## Güncelleme

Eklenti menüsünde ⚙ > "Güncellemeleri kontrol et". Yeni sürüm varsa zip'i indirip eski klasörün üzerine yaz, sonra eklentiler sayfasında eklentiyi yenile.

## İzinler

| İzin | Neden |
|---|---|
| kick.com erişimi | Çalıştığı tek site |
| `declarativeNetRequest` | Reklam isteklerini engeller |
| `declarativeNetRequestFeedback` | Sayaç için engellenen istekleri sayar |
| `storage` | Aç/kapa durumunu, sayacı ve dil seçimini kaydeder |
| `tabs` | Açık sekmenin sayısını ve "Yenile" linkini gösterir |

Hiçbir veri toplamaz, internetten kod indirmez. Kendi başına yaptığı tek istek, "Güncellemeleri kontrol et"e bastığında GitHub API'ye gider.

## Sorun

Reklam tekrar çıkmaya başladıysa [issue açabilirsin](https://github.com/magef1x/clearstream/issues).

---

Kick ile bağlantılı değildir. [MIT](LICENSE)
