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
    <main className="p-6 max-w-sm mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">QR Absensi Hari Ini</h1>

      {loading && <p>Memuat...</p>}

      {qrDataUrl && (
        <img
          src={qrDataUrl}
          alt="QR Code Absensi"
          className="w-72 h-72 mx-auto block"
        />
      )}

      {expiredAt && (
        <p className="text-gray-500 text-sm mt-2">
          Berlaku hingga: {new Date(expiredAt).toLocaleString("id-ID")}
        </p>
      )}

      <button
        onClick={fetchQR}
        className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg"
      >
        Perbarui QR
      </button>
    </main>
  );
}
