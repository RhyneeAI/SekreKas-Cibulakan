"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function AdminQRPage() {
  const [token, setToken] = useState<string | null>(null);
  const [expiredAt, setExpiredAt] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchQR() {
    setLoading(true);
    const res = await fetch("/api/absensi/qr-today");
    const data = await res.json();
    setToken(data.token);
    setExpiredAt(data.expired_at);
    const url = await QRCode.toDataURL(data.token, { width: 300 });
    setQrDataUrl(url);
    setLoading(false);
  }

  useEffect(() => {
    fetchQR();
  }, []);

  return (
    <main style={{ padding: 24, maxWidth: 400, margin: "0 auto", textAlign: "center" }}>
      <h1>QR Absensi Hari Ini</h1>

      {loading && <p>Memuat...</p>}

      {qrDataUrl && (
        <img
          src={qrDataUrl}
          alt="QR Code Absensi"
          style={{ width: 300, height: 300, display: "block", margin: "0 auto" }}
        />
      )}

      {expiredAt && (
        <p style={{ color: "#666", fontSize: 14 }}>
          Berlaku hingga: {new Date(expiredAt).toLocaleString("id-ID")}
        </p>
      )}

      <button onClick={fetchQR} style={{ padding: "12px 24px", marginTop: 12 }}>
        Perbarui QR
      </button>
    </main>
  );
}
