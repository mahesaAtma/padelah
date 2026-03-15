<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Konfirmasi Pemesanan</title>
    <style>
        body { font-family: sans-serif; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
        .container { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,.1); }
        .header { background: #0d9488; color: #fff; padding: 24px 32px; }
        .header h1 { margin: 0; font-size: 20px; }
        .body { padding: 32px; }
        .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
        .label { color: #888; }
        .value { font-weight: 600; }
        .total { font-size: 18px; color: #0d9488; font-weight: 700; }
        .footer { padding: 20px 32px; font-size: 12px; color: #aaa; text-align: center; }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>Pemesanan Dikonfirmasi</h1>
        <p style="margin:4px 0 0;font-size:13px;opacity:.85;">Terima kasih telah memesan melalui Padelah.com</p>
    </div>
    <div class="body">
        <p style="margin-top:0;">Halo <strong>{{ $booking->user->name }}</strong>,</p>
        <p>Pemesanan Anda telah berhasil dikonfirmasi. Berikut detailnya:</p>

        <div class="row"><span class="label">ID Pemesanan</span><span class="value">#{{ $booking->id }}</span></div>
        <div class="row"><span class="label">Venue</span><span class="value">{{ $booking->venue->name }}</span></div>
        <div class="row"><span class="label">Lapangan</span><span class="value">{{ $booking->court->name }}</span></div>
        <div class="row"><span class="label">Tanggal</span><span class="value">{{ \Carbon\Carbon::parse($booking->booking_date)->translatedFormat('d F Y') }}</span></div>
        <div class="row"><span class="label">Waktu</span><span class="value">{{ substr($booking->start_time, 0, 5) }} – {{ substr($booking->end_time, 0, 5) }}</span></div>
        <div class="row"><span class="label">Total Harga</span><span class="value total">Rp {{ number_format($booking->total_price, 0, ',', '.') }}</span></div>

        <p style="margin-top:24px;font-size:13px;color:#555;">Silakan tunjukkan email ini atau ID pemesanan kepada petugas venue saat tiba.</p>
    </div>
    <div class="footer">© {{ date('Y') }} Padelah.com · Temukan lapangan padel terbaik di Indonesia</div>
</div>
</body>
</html>
