## GFS Akomodasi

Backend sekarang disiapkan untuk jalan dengan PHP built-in server di port `31145`, dan frontend harus mengaksesnya lewat URL API, bukan lagi asumsi folder XAMPP/Apache.

### Backend

1. Buat file `backend/.env` dari contoh:
   `copy backend\\.env.example backend\\.env`
2. Isi koneksi database sesuai VPS.
3. Jalankan server API:

```powershell
cd backend
php -S 0.0.0.0:31145 index.php
```

Endpoint health check:

```text
http://YOUR_SERVER_IP:31145/api
```

### Frontend

1. Buat file `frontend/.env` dari contoh:
   `copy frontend\\.env.example frontend\\.env`
2. Pastikan `VITE_API_BASE_URL` mengarah ke:

```text
http://YOUR_SERVER_IP:31145/api
```

Jika frontend diakses lewat IP/domain yang sama dengan backend, tanpa `VITE_API_BASE_URL` pun frontend sekarang akan otomatis mencoba ke `http://HOST_AKTIF:31145/api`.

Frontend dev server dan preview sekarang dikunci di port `4321`.
# gfs_akomodasi
