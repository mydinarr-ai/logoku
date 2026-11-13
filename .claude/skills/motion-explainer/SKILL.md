---
name: motion-explainer
description: Buat video motion explainer vertikal 9:16 (Reels/TikTok/Shorts) bergaya @motionformat - ilustrasi isometrik/kartun 3D, headline kuning tebal berbingkai gelap berbentuk pertanyaan penasaran, caption di bawah, durasi 20-45 detik, bahasa Indonesia santai. Gunakan skill ini setiap kali user minta "buatkan video motion", "video explainer", "reels edukasi", "video kartun/animasi", "storyboard motion", "bikin video seperti motionformat", atau memberi topik (sejarah, sains sehari-hari, bisnis digital, materi pelajaran) untuk dijadikan video pendek, walau tidak menyebut kata "motion" atau "skill".
---

# Motion Explainer (gaya @motionformat)

Tujuan: dari **satu topik** → **video MP4 9:16 siap upload**, dengan input minimal dari user (Bu Dina). Kerjakan end-to-end; jangan berhenti di "ide" kecuali user memang hanya minta naskah/storyboard.

## Ciri gaya (hasil analisis profil @motionformat)

- Format: Reels 9:16, explainer singkat, bukan video bicara. Visual yang bercerita.
- Hook = **pertanyaan/klaim yang bikin penasaran** dalam 2-4 kata: "NASI SUDAH MATANG?", "TANPA GAMBAR, satu lembar pun tidak ada", "DIBANGUN 1 MALAM?", "MENYELAM & NAIK LAGI, gimana caranya?", "BATERAI HP SAAT DICAS?".
- Topik: keseharian + budaya/sejarah Indonesia + sains populer (Roro Jonggrang, kapal pinisi, candi, rice cooker). Dekat dengan audiens, ada "oh ternyata begitu".
- Visual: ilustrasi isometrik / 3D-kartun, warna hangat, satu objek utama per scene, latar sederhana, ada maskot lucu (karakter bulat/pisang kecil) untuk brand.
- Teks: headline besar kuning/putih berbingkai gelap di atas, subjudul kecil serif/italik bila perlu, caption pendek di bawah.
- Brand: highlight "Karya kami, Testimoni, Promo, FAQ", CTA ke website / kelas.

Detail pedoman visual dan template prompt ada di `references/gaya-visual.md` (baca saat membuat prompt gambar).

## Alur kerja

Ikuti urutan ini. Tiap tahap menghasilkan file di folder kerja `motion-<slug-topik>/`.

### 1. Tangkap brief (jangan tanya panjang)
Ambil dari pesan user: **topik**, target penonton, tujuan (edukasi siswa / promosi TEFA / konten brand), durasi. Bila tidak disebut, pakai default: 30 detik, 6-8 scene, penonton umum/siswa SMK, bahasa Indonesia santai. Tanya hanya jika topik benar-benar tidak jelas. Asumsi yang dipakai disebut singkat di akhir.

### 2. Riset fakta (wajib untuk topik sejarah/sains/data)
Video edukasi yang salah fakta merusak kredibilitas. Cek fakta kunci lewat web search bila tersedia, pisahkan **fakta** vs **cerita rakyat/mitos** (contoh: legenda Roro Jonggrang bukan fakta sejarah, sebutkan "menurut legenda"). Jangan mengarang angka atau sumber. Jika tidak bisa mengecek, tandai "perlu verifikasi" di naskah.

### 3. Naskah + storyboard (Hook → Value → CTA)
Susun `naskah.md` berupa tabel:

| # | Detik | Headline (maks 5 kata) | Narasi/VO | Caption layar (maks ~12 kata) | Visual (deskripsi adegan) | Gerak kamera |

Aturan:
- Scene 1 = hook (pertanyaan). 2-3 detik pertama menentukan orang lanjut nonton.
- Scene tengah = value: satu ide per scene, 3-5 detik, kalimat pendek.
- Scene akhir = jawaban singkat + CTA (follow / komentar / kunjungi link). CTA satu saja.
- Total narasi sekitar 2,3 kata per detik (30 detik ≈ 70-80 kata).
- Tampilkan naskah ke user sebelum produksi berat **hanya jika** user minta review; kalau user bilang "buatkan", lanjut produksi dan serahkan hasil jadi + naskah.

### 4. Aset visual per scene
Satu gambar 9:16 (1080x1920) per scene, nama `scene1.png`, `scene2.png`, dst. Pilih jalur sesuai tool yang tersedia (cek dengan ToolSearch):
1. **Generator gambar yang terhubung** (mis. Canva `generate-image`, atau Karyawan AI `gen_run`/`gen_list_models`). Pakai template prompt di `references/gaya-visual.md`, kunci gaya yang sama di semua scene supaya konsisten. Maskot dipakai konsisten, dengan deskripsi yang sama.
2. **Gambar dari user** (foto/ilustrasi yang diunggah): pakai apa adanya.
3. **Tanpa generator**: buat ilustrasi flat/isometrik sederhana sebagai SVG/HTML lalu render ke PNG dengan Playwright; atau pakai latar gradien dari renderer (`"bg"` di scene). Beri tahu user bahwa ini versi sederhana dan tawarkan prompt gambar siap tempel untuk dibuat di tool mereka (Gemini/Canva/Midjourney, dll).

Selalu simpan juga `prompt-gambar.md` berisi prompt tiap scene, supaya user bisa generate ulang atau perbaiki sendiri.

### 5. Suara
- Opsional tapi sangat disarankan. Jika ada tool voice/TTS yang terhubung (mis. Karyawan AI `voice_list`/`gen_run`), buat `vo.mp3` dari narasi. Bila tidak ada, buat `narasi-vo.txt` yang rapi untuk direkam user atau dipakai di TTS pilihan mereka.
- Musik latar: hanya bila user menyediakan file (`music`). Jangan ambil musik berhak cipta dari internet.
- Penyesuaian: setelah ada `vo.mp3`, jalankan `node <path-skill>/scripts/fit-audio.cjs motion-<slug>/storyboard.json motion-<slug>/vo.mp3`. Skrip membagi durasi audio ke tiap scene menurut jumlah kata (isi field `narasi` tiap scene dengan teks yang dibacakan; bila kosong dipakai `caption`) dan mengisi field `audio`. Itu perkiraan: cek draft dan koreksi `duration` manual bila ada scene yang terasa terlalu cepat atau lambat.
- Opsi suara murah: rekam sendiri, CapCut Text to Speech, atau Google AI Studio (cek apakah model speech gratis untuk akun user; Google Cloud TTS wajib billing).

### 6. Render
Tulis `storyboard.json` (skema di bawah), lalu:

```bash
# cek cepat (540x960, 15fps)
node <path-skill>/scripts/render.cjs motion-<slug>/storyboard.json motion-<slug>/draft.mp4 --draft
# final (1080x1920, 30fps)
node <path-skill>/scripts/render.cjs motion-<slug>/storyboard.json motion-<slug>/final.mp4
```

`<path-skill>` = folder skill ini (`.claude/skills/motion-explainer`). Playwright dan ffmpeg sudah tersedia di lingkungan cloud. Lihat satu-dua frame draft (ekstrak dengan `ffmpeg -ss 1 -i draft.mp4 -frames:v 1 f.png`) untuk cek teks tidak terpotong dan tidak menutupi objek, baru render final.

### 7. Serahkan
Kirim ke user: `final.mp4`, `naskah.md`, `prompt-gambar.md`, dan **caption + hashtag** untuk postingan (Hook → Value → CTA). Tutup dengan 2-3 baris: asumsi yang dipakai, bagian yang perlu diverifikasi, dan satu saran perbaikan berikutnya.

## Skema storyboard.json

```json
{
  "title": "Nasi Sudah Matang?",
  "brand": "@akunkamu",
  "mascot": "mascot.png",
  "audio": "vo.mp3",
  "music": "musik.mp3",
  "theme": { "headlineFill": "#FFC93C", "headlineStroke": "#1B1030", "accent": "#FFC93C" },
  "scenes": [
    { "image": "scene1.png", "headline": "Nasi sudah matang?", "caption": "Rice cooker bilang matang. Benarkah?",
      "duration": 3.5, "motion": "zoom-in" }
  ]
}
```

- `motion`: `zoom-in`, `zoom-out`, `pan-left`, `pan-right`, `none`. Variasikan antar scene agar terasa hidup.
- `bg`: CSS background bila scene tidak punya gambar.
- Semua field kecuali `scenes` opsional. Path relatif terhadap lokasi `storyboard.json`.
- Contoh lengkap: `assets/contoh/storyboard.json`.

## Batasan renderer (jujur ke user)
Renderer membuat **gerak kamera, teks animasi, transisi, maskot, dan mixing audio** di atas gambar statis. Ini bukan animasi karakter per frame seperti studio. Efek "hidup" datang dari gerak kamera, pop-in teks, dan ritme scene yang cepat. Bila user ingin animasi karakter yang benar-benar bergerak, arahkan ke generator video AI atau Canva (video/animasi), lalu tawarkan menyusun hasilnya di sini.

## Aturan kualitas
- Satu scene = satu ide = satu gambar fokus. Jangan memadatkan teks.
- Headline maksimal 5 kata, caption maksimal ~12 kata, ukuran teks tetap terbaca di HP.
- Beri jarak aman: teks atas di 8-20% tinggi layar, caption di 70-85%, area bawah 15% kosong (UI Reels).
- Fakta ≠ legenda ≠ opini. Tandai jelas.
- Jangan meniru karakter, maskot, atau aset milik @motionformat. Kita meniru **format dan struktur**, bukan aset. Maskot dibuat sendiri (milik brand Bu Dina/sekolah).
- Untuk konteks sekolah (TEFA, materi Bisnis Digital), hubungkan topik dengan materi ajar dan beri satu pertanyaan refleksi di caption bila relevan.
