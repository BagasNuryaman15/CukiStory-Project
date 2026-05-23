# PRD CukiStory v1 — Creator Assembly Cockpit

## 1. Ringkasan Produk

**CukiStory** adalah alat bantu produksi video vertikal untuk creator solo yang membuat konten storytelling seperti fakta unik, horror ringan, urban legend, misteri, sci-fi pendek, thriller ringan, dan comic storytelling.

CukiStory bukan pengganti ChatGPT, ChatGPT Image, CapCut, ElevenLabs, atau editor video profesional. CukiStory berfungsi sebagai **production assembly cockpit**: tempat untuk menyatukan bahan produksi yang sudah dibuat di luar aplikasi, seperti audio VO, SRT, gambar scene, scene timing, subtitle style, transisi, preview, render, dan export project pack.

Prinsip utama produk:

> **CukiStory harus mengikuti workflow kreator, bukan memaksa kreator mengikuti website.**

Workflow kreator yang menjadi dasar produk:

1. **ChatGPT** — ide, brainstorming, script, final VO, scene plan, prompt gambar, caption, hashtag, metadata.
2. **ChatGPT Image** — generate gambar manual per scene.
3. **CapCut / voice tool / TTS tool** — membuat audio VO dan SRT.
4. **CukiStory** — upload VO, upload/import SRT, upload gambar, mapping scene, subtitle style, transisi, preview sync, render/export.
5. **CapCut** — final polish, musik, SFX, finishing, dan upload jika diperlukan.

CukiStory v1 harus fokus pada stabilisasi workflow produksi, bukan menambah fitur AI otomatis yang belum diperlukan.

---

## 2. Latar Belakang

Awalnya, CukiStory diarahkan sebagai alat bantu produksi AI Shorts. Namun setelah penggunaan nyata, masalah utama bukan lagi sekadar membuat prompt gambar atau menulis script. Masalah yang lebih penting adalah menyusun bahan produksi agar sinkron: VO, SRT, scene visual, subtitle, transisi, preview, render, dan export.

Creator sudah memiliki workflow natural:

- ChatGPT nyaman untuk berpikir kreatif.
- ChatGPT Image nyaman untuk generate gambar manual.
- CapCut atau voice tool nyaman untuk membuat VO/SRT.
- Editor video tetap berguna untuk final polish.

Karena itu, CukiStory tidak perlu memindahkan semua proses ke website. CukiStory harus menjadi alat yang membantu fase produksi setelah bahan kreatif utama siap.

---

## 3. Tujuan Produk

Tujuan utama CukiStory v1 adalah membantu creator menyusun dan menyinkronkan bahan produksi video storytelling vertikal secara rapi, cepat, dan minim error.

CukiStory harus membantu creator untuk:

1. Mengimpor audio VO dan file SRT.
2. Membagi SRT ke dalam scene visual.
3. Menghubungkan setiap scene dengan gambar yang sesuai.
4. Mengatur subtitle style untuk video vertikal.
5. Mengatur transisi dan motion sederhana.
6. Melihat preview sinkron antara audio, subtitle, dan scene.
7. Memastikan project siap render melalui checklist validasi.
8. Mengekspor video atau project pack yang rapi.
9. Mengurangi kebingungan dalam proses produksi.
10. Menjadi jembatan antara ChatGPT, image generation, CapCut, dan render/export.

---

## 4. Non-Tujuan Produk

CukiStory v1 **tidak** bertujuan menjadi:

1. Pengganti ChatGPT untuk brainstorming.
2. Pengganti ChatGPT Image untuk generate gambar.
3. Pengganti CapCut sepenuhnya.
4. Editor video kompleks seperti Premiere Pro, After Effects, atau CapCut.
5. Platform SaaS publik.
6. Aplikasi multi-user.
7. Sistem automation 24/7.
8. Tool upload otomatis ke YouTube/TikTok/Reels.
9. AI video generator penuh.
10. AI image generator berbasis API.
11. Sistem login, subscription, payment, atau dashboard analytics publik.

Semua fitur di atas dapat dipertimbangkan nanti hanya jika workflow manual/semi-manual sudah terbukti menghasilkan value nyata.

---

## 5. Target User

### 5.1 User Utama

User utama CukiStory v1 adalah **creator solo** yang membuat video vertikal storytelling untuk YouTube Shorts, TikTok, dan Instagram Reels.

Karakter user:

- Membuat konten sendiri.
- Menggunakan ChatGPT Plus untuk ide, script, prompt, dan gambar.
- Menggunakan CapCut atau tool lain untuk VO/SRT/final polish.
- Tidak ingin workflow terlalu teknis.
- Butuh alat bantu yang jelas, ringan, dan langsung berguna.
- Lebih butuh produksi yang rapi daripada sistem automation mahal.

### 5.2 User Sekunder

User sekunder di masa depan:

- Editor video internal.
- Tim kecil content production.
- Creator yang ingin menyimpan template produksi.
- Developer yang ingin membangun automation setelah workflow terbukti.

Namun untuk v1, semua keputusan produk harus tetap mengutamakan creator solo.

---

## 6. Masalah Utama yang Diselesaikan

### 6.1 Masalah Sinkronisasi VO, SRT, dan Scene

Creator kesulitan mencocokkan audio VO dengan subtitle dan scene visual. Jika timing salah, video terasa tidak natural, subtitle telat, gambar muncul tidak sesuai narasi, dan retention turun.

CukiStory harus menjadikan **Full VO + SRT Timing** sebagai workflow utama.

### 6.2 Masalah Scene Visual Tidak Terstruktur

Tanpa scene timeline yang jelas, creator mudah kehilangan konteks:

- Gambar ini untuk bagian VO yang mana?
- Subtitle mana yang masuk scene ini?
- Scene ini sudah siap atau belum?
- Scene mana yang belum punya gambar?
- Durasi scene ini mengikuti apa?

CukiStory harus menyediakan scene timeline yang jelas dan mudah dibaca.

### 6.3 Masalah Subtitle Style dan Readability

Subtitle untuk Shorts/TikTok harus mudah dibaca, tidak terlalu besar, tidak menutupi visual penting, dan cocok untuk video 9:16.

CukiStory harus menyediakan kontrol subtitle yang cukup, tetapi tidak terlalu rumit.

### 6.4 Masalah Export dan Backup Project

Creator butuh output yang rapi, bukan hanya render video. Project perlu bisa diekspor sebagai pack yang berisi metadata, scene timeline, SRT backup, dan JSON project ringan.

### 6.5 Masalah Storage Lokal

Browser storage dapat penuh jika gambar/audio besar disimpan langsung ke localStorage. CukiStory v1 harus membedakan metadata dan file besar.

Metadata boleh disimpan lokal, tetapi media besar harus session-only untuk MVP, atau ditangani dengan strategi penyimpanan yang lebih aman di fase berikutnya.

---

## 7. Prinsip Produk

### 7.1 Creator Workflow First

CukiStory harus mengikuti workflow kreator yang sudah natural. Jangan memaksa user berpindah dari ChatGPT ke website untuk proses yang lebih nyaman dilakukan lewat chat.

### 7.2 Assembly, Not Full Automation

CukiStory v1 berfokus pada assembly, sync, preview, dan export. Automation tidak menjadi prioritas utama.

### 7.3 SRT as Source of Truth

Untuk workflow utama, SRT menjadi sumber utama timing subtitle. Scene visual dapat dimapping berdasarkan cue SRT.

### 7.4 Simple Before Powerful

Fitur harus jelas dulu sebelum dibuat kompleks. UI harus menjawab pertanyaan creator:

- Aku mulai dari mana?
- Apa yang belum lengkap?
- Scene mana yang bermasalah?
- Apakah project sudah siap render?

### 7.5 No API Until Needed

CukiStory v1 tidak membutuhkan AI API. ChatGPT Plus dan tool manual masih cukup untuk fase validasi workflow.

### 7.6 CapCut Still Matters

CukiStory tidak perlu menggantikan CapCut sepenuhnya. CapCut tetap bisa digunakan untuk final polish, musik, SFX, dan upload.

### 7.7 Production Clarity Over Visual Gimmick

UI boleh memiliki estetika cyberpunk/cinematic, tetapi tidak boleh mengorbankan kejelasan workflow.

---

## 8. Workflow Utama CukiStory v1

### 8.1 Phase 1 — Creative Room

Tempat: ChatGPT

Aktivitas:

- Membuat ide konten.
- Brainstorming angle.
- Menulis hook.
- Membuat final VO.
- Membuat scene breakdown.
- Membuat prompt gambar per scene.
- Membuat caption, hashtag, dan metadata.

Output:

- Final VO text.
- Scene plan.
- Prompt gambar.
- Character notes.
- Metadata upload.

CukiStory tidak wajib digunakan di fase ini.

### 8.2 Phase 2 — Asset Creation

Tempat: ChatGPT Image + CapCut / voice tool / TTS tool

Aktivitas:

- Generate gambar per scene secara manual.
- Membuat audio VO.
- Membuat atau mengekspor SRT.

Output:

- File audio VO.
- File SRT.
- Gambar per scene.

### 8.3 Phase 3 — Production Assembly

Tempat: CukiStory

Aktivitas:

- Membuat project baru.
- Mengisi story package jika diperlukan.
- Upload VO audio.
- Upload/import SRT.
- Validasi SRT.
- Membuat atau menyesuaikan scene.
- Auto map SRT cue ke scene.
- Upload gambar per scene.
- Mengatur subtitle style.
- Mengatur transition/motion sederhana.
- Preview sync.
- Periksa render readiness checklist.
- Render/export video.
- Export project pack.

Output:

- Preview project sinkron.
- Render video.
- Project pack.

### 8.4 Phase 4 — Final Polish

Tempat: CapCut

Aktivitas:

- Menambahkan musik.
- Menambahkan SFX.
- Fine-tuning visual jika perlu.
- Final export.
- Upload ke platform.

Output:

- Final video siap publish.

---

## 9. Fitur Inti MVP

### 9.1 Project Dashboard

Dashboard harus menampilkan daftar project dan status produksi secara jelas.

Kebutuhan:

- Buat project baru.
- Buka project existing.
- Lihat status project.
- Tampilkan informasi penting seperti title, mode audio, jumlah scene, readiness, dan last updated.
- UI boleh cinematic/cyberpunk, tetapi tetap mudah dipahami.

Prioritas: Tinggi.

---

### 9.2 Story Package

Story Package adalah tempat menyimpan informasi produksi yang berasal dari ChatGPT.

Field yang dibutuhkan:

- Title.
- Hook.
- Tagline.
- Final VO text.
- YouTube/TikTok description.
- Hashtags.
- Notes.

Catatan penting:

Story Package bukan ruang brainstorming utama. Ini adalah arsip produksi dan referensi project.

Prioritas: Sedang.

---

### 9.3 Full VO + SRT Timing Mode

Mode ini menjadi workflow utama CukiStory v1.

Kebutuhan:

- Upload audio VO.
- Upload/import SRT UTF-8/Unicode.
- Parse timestamp dengan koma dan titik.
- Mendukung subtitle multiline.
- Sort cue berdasarkan start time.
- Simpan raw SRT untuk backup/export pack.
- Menampilkan cue count.
- Menampilkan range durasi SRT.
- Menampilkan preview cue.
- Warning mismatch antara audio duration dan SRT duration.

Prioritas: Sangat Tinggi.

---

### 9.4 SRT Validation

SRT harus divalidasi sebelum digunakan untuk render.

Validasi wajib:

- Cue kosong.
- Timestamp invalid.
- Cue overlap.
- Cue tidak berurutan.
- Cue tanpa teks.

Warning:

- Gap terlalu panjang.
- Durasi cue terlalu pendek atau terlalu panjang.
- Mismatch audio vs SRT.

Prioritas: Tinggi.

---

### 9.5 Scene Timeline

Scene Timeline adalah pusat assembly visual.

Setiap scene harus memiliki:

- Scene title.
- Visual notes.
- SFX notes.
- Status scene.
- Mapped SRT cue range.
- VO segment preview.
- Image upload.
- Transition to next scene.
- Optional manual visual timing adjustment.

Status scene:

- Empty.
- Mapped.
- Image missing.
- Ready.

Prioritas: Sangat Tinggi.

---

### 9.6 SRT to Scene Mapping

CukiStory harus membantu user membagi cue SRT ke scene.

Kebutuhan:

- Auto map SRT to scenes.
- Manual start cue dan end cue per scene.
- Mapping berbasis stable cue id, bukan hanya index.
- Preview text dari cue yang mapped.
- Indikator cue assigned/unassigned.
- Checklist scene yang belum mapped.

Prioritas: Sangat Tinggi.

---

### 9.7 Image Upload per Scene

User harus bisa upload gambar hasil generate manual untuk setiap scene.

Kebutuhan:

- Upload image per scene.
- Preview image.
- Indikator image missing.
- Tidak menyimpan data URL image besar ke localStorage.
- Jelaskan bahwa media bersifat session-only pada MVP.

Prioritas: Tinggi.

---

### 9.8 Subtitle Style Controls

Subtitle harus bisa disesuaikan untuk video 9:16.

Kebutuhan:

- Subtitle mode: full subtitle, word-by-word, karaoke highlight.
- Subtitle size.
- Subtitle position: lower third, center, top.
- Style preset seperti Story Caption.
- Chunking subtitle 3–7 kata.
- Prefer split berdasarkan punctuation.
- Subtitle tetap mengikuti SRT global timing.

Prioritas: Tinggi.

---

### 9.9 Transition and Motion Controls

Transisi dan motion harus cukup fleksibel tanpa menjadi timeline editor kompleks.

Kebutuhan:

- Transition type per scene.
- Transition duration per scene.
- Scene terakhir tidak perlu transition control.
- Global transition sebagai default.
- Motion effect global sederhana.
- Apply settings tidak boleh merusak setting scene existing kecuali user memang memilih apply.

Prioritas: Sedang-Tinggi.

---

### 9.10 Preview Sync Panel

Preview Sync harus memberi kejelasan apakah project sudah sinkron.

Kebutuhan:

- Status audio.
- Status SRT.
- Status mapping.
- Status image.
- Status duration.
- Status scene timing.
- Preview render berdasarkan source of truth yang sama dengan Remotion render.

Prioritas: Sangat Tinggi.

---

### 9.11 Render Readiness Checklist

Sebelum render, user harus tahu apa yang wajib lengkap dan apa yang hanya warning.

Required checks:

- VO/audio tersedia.
- Durasi audio terbaca.
- SRT tersedia untuk SRT mode.
- SRT valid.
- Scene tersedia.
- Setiap scene yang diperlukan sudah mapped.
- Setiap scene yang diperlukan punya image.
- Final duration valid.

Recommended checks:

- Audio duration vs SRT duration mismatch.
- Gap SRT terlalu panjang.
- Scene terlalu pendek/panjang.
- Cue belum assigned.
- Visual hold terlalu panjang.

Render harus diblokir jika required checks gagal.

Prioritas: Sangat Tinggi.

---

### 9.12 Render Feedback

Saat render berjalan, user harus mendapat feedback yang jelas.

Kebutuhan:

- Status rendering.
- Progress estimasi.
- Elapsed time.
- Output target.
- Modal render yang jelas.
- Jelaskan bahwa progress bersifat estimasi sampai Remotion selesai.

Prioritas: Sedang.

---

### 9.13 Export Project Pack

CukiStory harus bisa mengekspor project pack ringan.

Isi export pack:

- Final VO text.
- YouTube/TikTok metadata.
- Scene timeline markdown.
- Project JSON ringan.
- SRT backup jika tersedia.

Catatan:

Project JSON tidak boleh membawa data URL image/audio besar. Ganti dengan placeholder session-only.

Prioritas: Tinggi.

---

### 9.14 Local Metadata Storage

Untuk MVP, storage sederhana sudah cukup.

Kebutuhan:

- Metadata project disimpan di localStorage.
- Media besar tidak disimpan permanen di localStorage.
- UI memberi tahu user bahwa image/audio perlu dipilih ulang setelah refresh jika masih session-only.

Prioritas: Tinggi.

---

### 9.15 Test Runner and Validation Helpers

Karena fitur timing sensitif, helper murni dan test harus dipertahankan.

Area yang perlu test:

- SRT parser.
- Timestamp koma/titik.
- Cue sorting.
- Stable cue id.
- Auto mapping.
- Visual hold timing.
- Timeline duration source of truth.
- Render validation required/recommended checks.

Prioritas: Tinggi.

---

## 10. Fitur yang Ditunda

Fitur berikut tidak masuk prioritas v1:

1. AI API image generation.
2. AI script generation di dalam website.
3. Auto voice generation API.
4. Login/register.
5. Supabase/cloud database.
6. Cloud file storage.
7. Payment/subscription.
8. Multi-user collaboration.
9. Auto-upload ke YouTube/TikTok.
10. Full analytics dashboard.
11. Timeline editor kompleks seperti CapCut.
12. Mobile app native.
13. VPS/worker 24 jam.
14. OpenRouter orchestration.
15. SaaS public deployment.

Alasan penundaan:

- Belum dibutuhkan untuk validasi workflow.
- Menambah kompleksitas engineering.
- Berisiko mengalihkan fokus dari masalah utama.
- ChatGPT Plus dan workflow manual masih cukup.

---

## 11. Data Model Konseptual

### 11.1 Project

Field:

- id
- title
- createdAt
- updatedAt
- audioMode
- storyPackage
- scenes
- srt
- subtitleSettings
- motionSettings
- renderSettings
- exportSettings

### 11.2 StoryPackage

Field:

- title
- hook
- tagline
- finalVO
- description
- hashtags
- notes

### 11.3 SRTData

Field:

- rawSrt
- fileName
- cues
- validationIssues
- durationRange

### 11.4 SRTCue

Field:

- id
- originalIndex
- startTime
- endTime
- text
- hash

### 11.5 Scene

Field:

- id
- title
- visualNotes
- sfxNotes
- status
- imageSessionRef
- srtCueStartId
- srtCueEndId
- transitionType
- transitionDuration
- imageStartOffset
- holdImageAfterCue
- manualDurationOverride

### 11.6 SubtitleSettings

Field:

- mode
- size
- position
- preset
- chunking
- karaokeHighlight

### 11.7 MotionSettings

Field:

- globalMotionEffect
- defaultTransitionType
- defaultTransitionDuration

### 11.8 RenderReadiness

Field:

- requiredChecks
- recommendedChecks
- canRender
- finalDuration

---

## 12. Source of Truth

CukiStory harus memiliki aturan source of truth yang jelas.

### 12.1 Timing Subtitle

Untuk Full VO + SRT mode:

- Subtitle timing mengikuti SRT.
- Subtitle tidak mengikuti scene.duration lama.
- Cue SRT adalah sumber utama teks dan timing subtitle.

### 12.2 Timing Visual

- Visual scene mengikuti mapped SRT cue.
- Scene image dapat memiliki image start offset.
- Scene image dapat memiliki hold image after cue.
- Scene terakhir harus ditahan sampai final duration jika diperlukan untuk menghindari black tail.

### 12.3 Final Duration

Final duration dihitung dari:

- audio duration,
- SRT duration,
- visual mapped scene end,
- aturan mode audio aktif.

Preview dan render harus memakai helper durasi yang sama.

---

## 13. UX Requirements

### 13.1 Onboarding Project Baru

Saat membuat project baru, default mode harus mendukung workflow utama:

- Full VO + SRT Timing.
- User diarahkan untuk upload audio VO dan SRT.
- User diberi tahu bahwa creative assets sebaiknya sudah dibuat dari ChatGPT/CapCut.

### 13.2 Empty State yang Jelas

Setiap bagian harus punya empty state:

- Belum ada audio.
- Belum ada SRT.
- Belum ada scene.
- Scene belum mapped.
- Scene belum punya image.
- Project belum siap render.

### 13.3 Bahasa UI

Bahasa UI harus jelas dan tidak terlalu teknis.

Contoh label yang disarankan:

- Upload Voice Over
- Upload SRT Subtitle
- Auto Map SRT to Scenes
- Scene Visual
- Mapped VO Segment
- Missing Image
- Ready to Render
- Export Project Pack

Hindari label yang terlalu abstrak atau developer-oriented.

### 13.4 Visual Style

Visual style boleh:

- cinematic,
- cyberpunk,
- dark UI,
- production cockpit,
- high contrast.

Namun harus tetap:

- mudah dibaca,
- tidak terlalu ramai,
- tombol utama jelas,
- status produksi mudah dipahami,
- tidak membingungkan creator.

---

## 14. Render Requirements

Render harus:

- Menggunakan audio dari frame 0.
- Menggunakan subtitle dari SRT global timing.
- Menampilkan scene image sesuai mapping visual.
- Menggunakan transition per scene secara outgoing-only.
- Tidak menerapkan transition pada scene terakhir.
- Mengikuti final duration yang sama dengan preview.
- Menampilkan warning jika project tidak ideal.
- Memblokir render jika required checks gagal.

---

## 15. Export Requirements

Export video dan project pack harus dibedakan.

### 15.1 Video Export

Output:

- MP4/video render.

### 15.2 Project Pack Export

Output:

- Markdown scene timeline.
- Final VO text.
- Metadata YouTube/TikTok.
- SRT backup.
- Project JSON ringan.

Tujuan project pack:

- Backup.
- Dokumentasi produksi.
- Bisa dibaca ulang.
- Bisa digunakan untuk revisi manual.
- Tidak membebani storage.

---

## 16. Success Metrics

CukiStory v1 dianggap berhasil jika:

1. Creator bisa menyusun project dari VO + SRT + gambar tanpa bingung.
2. Mapping SRT ke scene terasa jelas.
3. Preview dan render konsisten.
4. Subtitle tampil rapi di format 9:16.
5. Render validation membantu, bukan mengganggu.
6. Export project pack berguna untuk backup dan workflow produksi.
7. Creator tidak merasa website menggantikan ChatGPT/CapCut secara paksa.
8. Waktu produksi 1 video menjadi lebih rapi dan lebih mudah diulang.
9. Error storage lokal berkurang.
10. Codex tidak menambah fitur di luar scope tanpa alasan kuat.

---

## 17. Risiko Produk

### 17.1 Risiko Scope Creep

CukiStory bisa melebar menjadi terlalu banyak fitur.

Mitigasi:

- Gunakan PRD sebagai batas.
- Tunda API/SaaS/login/cloud.
- Fokus pada workflow utama.

### 17.2 Risiko UI Terlalu Kompleks

Production cockpit bisa terlihat keren tetapi membingungkan.

Mitigasi:

- Utamakan urutan kerja.
- Gunakan checklist.
- Gunakan empty state jelas.
- Kurangi dekorasi jika mengganggu.

### 17.3 Risiko Timing Tidak Konsisten

Preview dan render bisa berbeda jika source of truth tidak sama.

Mitigasi:

- Gunakan helper timing bersama.
- Pertahankan unit test.
- Hindari logic timing ganda di UI dan render.

### 17.4 Risiko Storage

Browser storage bisa gagal jika menyimpan media besar.

Mitigasi:

- Metadata only di localStorage.
- Media besar session-only.
- Export JSON ringan.
- Pertimbangkan IndexedDB/cloud storage di fase berikutnya jika benar-benar perlu.

### 17.5 Risiko Workflow Tidak Natural

Jika CukiStory mencoba menggantikan ChatGPT/CapCut, creator akan merasa workflow makin ribet.

Mitigasi:

- Posisikan CukiStory sebagai assembly cockpit.
- Jangan menjadikan prompt generation sebagai pusat produk v1.

---

## 18. Roadmap

### 18.1 Phase 1 — Stabilization

Fokus:

- Rapikan workflow utama.
- Pastikan Full VO + SRT mode stabil.
- Pastikan preview/render sync.
- Pastikan render validation akurat.
- Pastikan export pack bekerja.
- Rapikan UI agar mudah dipahami.

Output:

- CukiStory v1 stabil untuk produksi manual/semi-manual.

### 18.2 Phase 2 — Creator Workflow Polish

Fokus:

- Template project.
- Preset subtitle style.
- Preset transition/motion.
- Better storyboard overview.
- Scene status filtering.
- Improved project backup/import.

Output:

- Produksi lebih cepat dan lebih nyaman.

### 18.3 Phase 3 — Storage Improvement

Fokus:

- IndexedDB untuk media lokal.
- Import/export project lebih aman.
- Optional local file references.
- Pertimbangkan cloud storage hanya jika benar-benar dibutuhkan.

Output:

- Project bisa bertahan lebih baik setelah refresh/session.

### 18.4 Phase 4 — Selective Automation

Fokus:

- Generate helper metadata.
- Optional prompt formatting.
- Optional SRT cleanup.
- Optional API hanya untuk fitur yang terbukti menghemat waktu signifikan.

Output:

- Automation ringan tanpa mengubah workflow utama.

### 18.5 Phase 5 — Scale Decision

Fokus:

- Evaluasi apakah perlu SaaS.
- Evaluasi apakah perlu login.
- Evaluasi apakah perlu backend.
- Evaluasi apakah perlu API model.
- Evaluasi apakah perlu deployment publik.

Output:

- Keputusan scale berdasarkan bukti, bukan hype.

---

## 19. Codex Development Rules

Codex harus mengikuti aturan berikut:

1. Jangan menambahkan AI API kecuali diminta eksplisit.
2. Jangan menambahkan login/register kecuali diminta eksplisit.
3. Jangan menambahkan Supabase/cloud storage kecuali ada keputusan produk baru.
4. Jangan mengubah workflow utama tanpa menjelaskan dampaknya.
5. Jangan membuat CukiStory menjadi pengganti ChatGPT.
6. Jangan membuat CukiStory menjadi pengganti CapCut penuh.
7. Pertahankan Full VO + SRT sebagai mode utama.
8. Preview dan render harus memakai source of truth yang sama.
9. Semua perubahan timing harus disertai test.
10. Semua UI baru harus memperjelas workflow, bukan hanya mempercantik tampilan.
11. Required render checks harus benar-benar memblokir render jika gagal.
12. Recommended checks hanya menjadi warning.
13. Media besar jangan disimpan ke localStorage.
14. Export project JSON harus tetap ringan.
15. Setiap fitur baru harus menjawab masalah creator yang nyata.

---

## 20. Definisi Done untuk v1

CukiStory v1 dianggap selesai jika:

1. User bisa membuat project baru dengan mode Full VO + SRT.
2. User bisa upload audio VO.
3. User bisa upload/import SRT.
4. SRT tervalidasi dengan jelas.
5. User bisa membuat beberapa scene.
6. User bisa auto map SRT ke scene.
7. User bisa manual adjust mapping cue per scene.
8. User bisa upload gambar per scene.
9. Scene status menampilkan kondisi yang benar.
10. Subtitle style bisa diatur.
11. Transition per scene bisa diatur.
12. Preview menampilkan audio, subtitle, dan visual secara sinkron.
13. Render validation membedakan required dan recommended checks.
14. Render tidak berjalan jika required checks gagal.
15. Export project pack tersedia.
16. Project JSON tidak menyimpan media besar.
17. Build berhasil.
18. Test berhasil.
19. UI cukup jelas untuk digunakan creator tanpa membaca dokumentasi panjang.
20. Workflow tidak memaksa user meninggalkan ChatGPT atau CapCut.

---

## 21. Keputusan Produk Final

Keputusan produk untuk CukiStory v1:

> CukiStory adalah creator assembly cockpit untuk workflow video storytelling vertikal berbasis VO, SRT, scene visual, subtitle, transition, preview, render, dan export pack.

CukiStory v1 tidak mengejar automation penuh, SaaS, API, atau pengganti CapCut. Fokus utamanya adalah membuat proses produksi manual/semi-manual menjadi rapi, sinkron, dan bisa diulang.

Kalimat prinsip:

> **ChatGPT is the creative room. CukiStory is the production assembly cockpit. CapCut remains the final polish room.**

Versi Indonesia:

> **ChatGPT adalah ruang kreatif. CukiStory adalah ruang penyusunan produksi. CapCut tetap menjadi ruang finishing.**

---

## 22. Next Step Setelah PRD

Setelah PRD ini dikunci, langkah berikutnya bukan langsung menambah fitur baru.

Langkah berikutnya:

1. Audit kondisi CukiStory sekarang dibanding PRD ini.
2. Tandai fitur yang sudah sesuai.
3. Tandai fitur yang perlu dirapikan.
4. Tandai fitur yang terlalu melebar.
5. Buat stabilization prompt untuk Codex.
6. Minta Codex merapikan workflow dan UI berdasarkan PRD.
7. Jalankan build dan test.
8. Lakukan uji produksi 1 video nyata dari awal sampai export.

Keputusan penting:

> Jangan lanjut ke API, cloud, SaaS, atau automation sebelum CukiStory terbukti membantu produksi minimal beberapa video nyata dengan workflow ini.

