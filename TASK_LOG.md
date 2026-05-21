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
