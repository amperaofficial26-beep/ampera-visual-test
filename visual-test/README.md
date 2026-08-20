# Ampera Visual Test

Demo eksplorasi visual 3D terpisah untuk menguji gaya grafik sebelum diterapkan pada Ampera Tower Defense.

## Isi demo

- Satu manusia playable dengan kamera third-person.
- Satu desa medieval sore hari.
- Satu monster hutan.
- Terrain, rumput, pohon, rumah kayu-batu, jalan, sungai, dan pencahayaan.

## Menjalankan game web lokal

```bash
cd docs
python -m http.server 8080
```

Buka `http://localhost:8080`.

## Deploy

Push project ini ke repository baru, misalnya `ampera-visual-test`. Di **GitHub Settings → Pages**, pilih branch `main` dan folder `/docs`. Setelah URL Pages muncul, masukkan URL itu ke `GAME_URL` di `app.py`, lalu deploy `app.py` ke Streamlit Cloud.
