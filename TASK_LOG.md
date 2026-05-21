# CukiStory Project Task Log

Catatan ini dipakai sebagai laporan kerja ringan setiap selesai revisi. Formatnya sengaja singkat supaya mudah dibaca tanpa perlu memahami branch Git.

## 2026-05-21

### Editor workflow clarity

- Merapikan project editor menjadi alur yang lebih jelas: Scenes, Voice Over, Style, Preview & Render.
- Memisahkan Style step menjadi kartu vertikal: Subtitle Settings, Motion Settings, Transition Settings, Apply Settings, dan Current Style Summary.
- Menambahkan kontrol subtitle size dan subtitle position yang tersambung ke preview/render.
- Menambahkan global motion effect agar Motion Settings terasa lengkap dan bisa diterapkan ke semua scene.
- Memperbarui opsi transition duration menjadi 0.15s, 0.25s, 0.5s, 0.75s, dan 1.0s.

### Subtitle rendering

- Memastikan full subtitle tampil sebagai chunk berurutan, bukan blok besar bertumpuk.
- Memastikan word-by-word reveal hanya menampilkan satu kata aktif pada satu waktu.
- Memperbaiki chunking subtitle agar long subtitle dipecah 3-7 kata dan lebih memilih split di punctuation.
- Menambahkan subtitle position lower third, center, dan top.
- Menyesuaikan font scale subtitle agar lebih aman untuk video vertikal 9:16.

### Timing and warnings

- Menjaga auto timing berbasis speech estimate dari subtitle dan sync ke VO duration saat audio tersedia.
- Memperhalus validation warning supaya terasa sebagai guidance, bukan error agresif.
- Mengubah threshold mismatch scene duration vs VO menjadi lebih masuk akal untuk render warning.

### UI polish

- Mengurangi glow background dan shadow card agar editor tidak terlalu ramai.
- Mengubah warna tombol global supaya primary button memakai cyan-blue yang lebih tenang tanpa pink terlalu kontras.
- Membuat secondary, quiet, dan danger button lebih soft untuk pemakaian editor jangka panjang.

### Verification

- `npm run build` berhasil.
- Dev server sempat dijalankan di `http://localhost:3000`, lalu dihentikan setelah pengecekan.

### Notes

- Tidak menambahkan AI API, login/register, Supabase, cloud storage, payment, upload platform, atau timeline editor.
- Worktree belum di-commit.

## 2026-05-22

### Full VO + SRT Timing Mode

- Menambahkan mode audio `Full VO + SRT Timing` sebagai workflow rekomendasi.
- Menambahkan parser `.srt` UTF-8/Unicode dengan dukungan timestamp koma dan titik, multiline subtitle, dan pengurutan cue berdasarkan start time.
- Menyimpan SRT cue, nama file SRT, mode audio, dan mapping cue di model project.
- Menambahkan panel Voice & SRT Timing untuk upload VO, upload SRT, melihat cue count, range durasi SRT, preview cue, dan warning mismatch audio vs SRT.

### SRT to scene mapping

- Menambahkan mapping cue range per scene: start cue dan end cue.
- Menambahkan Auto Map SRT to Scenes untuk membagi cue berurutan ke scene berdasarkan total durasi, bukan sekadar jumlah cue.
- Scene card sekarang menampilkan start, end, duration dari SRT mapping, cue text preview, dan status "Controlled by mapped SRT cues".
- Menambahkan manual duration override untuk SRT mode jika creator perlu memaksa durasi scene.

### SRT rendering

- Preview/render Remotion sekarang bisa memakai SRT sebagai timing global subtitle.
- Subtitle SRT tetap memakai visual style CukiStory, termasuk full subtitle, word-by-word reveal, karaoke highlight, size, dan position.
- Scene image di SRT mode dirender mengikuti timestamp cue yang dipetakan.
- Full VO tetap diputar dari frame 0.

### Per-scene transitions

- Menambahkan transition duration per scene.
- Global transition dan transition duration sekarang berperan sebagai default; scene existing tidak dipaksa berubah kecuali user klik Apply Settings.
- Scene card bisa mengatur transition type dan duration untuk transisi scene tersebut ke scene berikutnya.

### Storage safety

- Metadata project tetap disimpan di localStorage.
- Image/audio berbentuk data URL/blob tidak lagi disimpan ke localStorage agar save tidak gagal karena file besar.
- UI menampilkan pesan bahwa file image/audio masih session-only di MVP dan perlu dipilih ulang setelah refresh.

### SRT mode UI cleanup

- Menyembunyikan textarea Subtitle di Scene Card saat Full VO + SRT Timing aktif agar tidak ada dua sumber subtitle yang membingungkan.
- Mengganti area subtitle scene dengan Mapped SRT Preview yang menampilkan cue, timestamp, dan text yang benar-benar akan dirender.
- Menambahkan empty state yang jelas saat scene belum memiliki mapping SRT.
- Menambahkan status di Preview & Render untuk jumlah scene yang sudah mapped dan jumlah SRT cue yang sudah assigned.

### Visual SRT timing experiment

- Membuat branch eksperimen `experiment/srt-visual-offsets` dari checkpoint SRT workflow.
- Menambahkan visual start offset per scene agar image bisa muncul sebelum cue SRT pertama.
- Menambahkan end hold per scene agar image bisa tetap tampil setelah cue SRT terakhir.
- Manual duration override di SRT mode sekarang tetap berbasis start cue/offset, bukan jatuh ke timing sequential lama.
- Memperbaiki input angka duration/offset/hold agar bisa dikosongkan saat diedit dan baru di-clamp saat blur atau Enter.

### Verification

- `npm run build` berhasil.

### Notes

- Tidak menambahkan AI API, login/register, Supabase, cloud storage, payment, timeline editor kompleks, atau upload YouTube/TikTok.
