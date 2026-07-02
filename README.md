# Task Grove — Dashboard Tugas

Django app: 6 card (Mas Arif, Mbak Arum, Kak Azka, Kak Dea, Mas Nabil, Others),
tiap card bisa tambah tugas + deadline, centang → pindah ke section "Selesai".
Task diurutkan otomatis berdasarkan deadline terdekat. Tema dark green, calming.

## Jalan di lokal (opsional, buat cek dulu sebelum deploy)

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Buka http://127.0.0.1:8000 — 6 person otomatis dibuat saat pertama kali diakses.

## Deploy ke Railway

1. **Push project ini ke GitHub repo baru** (private/public terserah kamu):
   ```bash
git init
git add .
git commit -m "Task Grove dashboard"
git branch -M main
git remote add origin <url-repo-github-kamu>
git push -u origin main
```

2. **Buat project baru di Railway** (railway.app) → "New Project" → "Deploy from GitHub repo" → pilih repo ini.

3. **Tambah database Postgres**: di project Railway, klik "+ New" → "Database" → "Add PostgreSQL".
   Railway otomatis inject env var `DATABASE_URL` ke service Django kamu — tidak perlu setting manual,
   `settings.py` sudah baca `DATABASE_URL` lewat `dj-database-url`.

4. **Set environment variable** di service Django (tab "Variables"):
   - `DJANGO_SECRET_KEY` — isi string acak panjang (jangan pakai default yang ada di settings.py)
   - `DJANGO_DEBUG` — set `False`

5. Railway otomatis detect `requirements.txt` + `Procfile` dan build pakai Nixpacks.
   - `release: python manage.py migrate` jalan otomatis tiap deploy (migrasi database).
   - `web: gunicorn todoproject.wsgi` jalanin server production.

6. Setelah deploy sukses, klik "Generate Domain" di tab Settings → dapat URL publik
   (misal `taskgrove-production.up.railway.app`) yang bisa diakses dari browser mana saja.
   Ini **open access, tanpa login**, sesuai keputusan awal.

## Struktur data

- `Person`: 6 nama fixed, dibuat otomatis (lihat `todo/views.py` → `DEFAULT_PERSONS`).
  Kalau mau ubah nama/tambah orang, edit lewat Django admin (`/admin/`, perlu bikin
  superuser dulu: `python manage.py createsuperuser`).
- `Task`: judul, deadline (opsional), status selesai, timestamp dibuat/diselesaikan.

## Catatan

- Task tanpa deadline otomatis ditaruh paling bawah list.
- Task dengan deadline lewat (overdue) ditandai merah muda; deadline hari ini ditandai emas.
- Karena open access tanpa login, siapapun yang punya link bisa tambah/centang/hapus tugas.
  Kalau nanti berubah pikiran dan mau proteksi, paling gampang tambah HTTP Basic Auth
  di level Railway/proxy, atau saya bisa bikinkan halaman login sederhana.
