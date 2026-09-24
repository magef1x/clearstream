# Clearstream

Kick.com yayınlarındaki video (pre-roll / mid-roll) ve banner reklamlarını engelleyen hafif bir Chrome eklentisi.
Sadece kick.com üzerinde çalışır, başka sitelere dokunmaz, hiçbir veri toplamaz.

> Bağımsız bir projedir. Kick ile resmi bir bağlantısı yoktur ve Kick tarafından desteklenmez. "Kick" adı sahibine aittir.

## Özellikler

- Video reklamları engeller: oynatıcı reklam yükleyemez ve yayına direkt geçer
- Banner ve reklam ağı isteklerini engeller (Google Ad Manager, Criteo, OpenX, Amazon vb.)
- Reklamdan geriye kalan boş kutuları gizler
- Menüde **aç/kapa butonu** ve **engellenen istek sayacı**

## Kurulum

### [⬇️ Clearstream'i indir (zip)](https://github.com/magef1x/clearstream/releases/latest/download/clearstream.zip)

1. Yukarıdaki linkten zip'i indir ve çıkar (sağ tık → **Tümünü ayıkla**).
   İçinden `clearstream` klasörü çıkacak.
2. Chrome'da `chrome://extensions` sayfasını aç
   (Edge: `edge://extensions`, Brave: `brave://extensions`)
3. Sağ üstten **Geliştirici modu**nu aç
4. **Paketlenmemiş öğe yükle** butonuna bas ve `clearstream` klasörünü seç
5. Kick sekmesini yenile

> Klasörü kalıcı bir yere koy (ör. Belgeler). Chrome eklentiyi o klasörden çalıştırır,
> klasör silinirse eklenti de kaybolur.

### Güncelleme

Yeni sürümü aynı linkten indir, eski `clearstream` klasörünün üzerine yaz,
sonra `chrome://extensions` sayfasında eklentinin yenile (⟳) butonuna bas.

## Nasıl çalışır?

| Dosya | Görevi |
|---|---|
| `rules.json` | Reklam alan adlarına giden istekleri Chrome'un `declarativeNetRequest` API'si ile engeller |
| `content.css` | Reklamdan boş kalan alanları gizler |
| `content.js` | Oynatıcı bir şekilde reklam moduna girerse yayına geri döndürür |
| `background.js` | Engellenen istekleri sayar, aç/kapa durumunu uygular |
| `popup.*` | Eklenti menüsü |

Sayaç "reklam" değil "istek" sayar. Tek bir reklam birden fazla istek yapabilir.

## Reklam tekrar çıkmaya başladıysa

Kick yeni bir reklam sağlayıcısı eklemiş olabilir. [Issue aç](https://github.com/magef1x/clearstream/issues)
ya da yeni alan adını `rules.json` içindeki `requestDomains` listesine ekleyip PR gönder.

## Lisans

[MIT](LICENSE)

---

**English:** Clearstream is a lightweight Chrome extension that blocks video and banner ads on Kick.com.
Install via `chrome://extensions` → Developer mode → *Load unpacked*. Independent project, not affiliated with or endorsed by Kick.
