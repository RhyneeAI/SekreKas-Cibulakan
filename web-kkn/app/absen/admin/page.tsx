"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { PageShell } from "@/components/PageShell";
import { LoadingCard } from "@/components/LoadingCard";

export default function AdminQRPage() {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchQR() {
    setRefreshing(true);
    const res = await fetch("/api/absensi/qr-today");
    const data = await res.json();
    const url = await QRCode.toDataURL(data.token, {
      width: 280,
      margin: 2,
      color: { dark: "#4A3427", light: "#FFFFFF" },
    });
    setQrDataUrl(url);
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => {
    fetchQR();
  }, []);

  return (
    <PageShell
      title="QR Absensi"
      subtitle="QR tetap — cetak sekali, dipakai setiap hari"
    >
      {loading ? (
        <LoadingCard label="Memuat QR absensi..." />
      ) : (
        <>
          <div className="card text-center">
            <p className="text-xs font-medium text-secondary uppercase tracking-wider mb-4">
              QR Absensi Kelompok
            </p>

            {qrDataUrl && (
              <div className="inline-block p-3 bg-white rounded-2xl border border-border shadow-sm mb-4">
                <img
                  src={qrDataUrl}
                  alt="QR Code Absensi"
                  className="w-64 h-64 mx-auto block"
                />
              </div>
            )}

            <p className="text-sm text-muted">
              Berlaku permanen — absensi tetap dicatat per hari
            </p>
          </div>

          <button
            onClick={fetchQR}
            disabled={refreshing}
            className="btn-primary mt-4"
          >
            {refreshing ? "Memuat..." : "Muat Ulang Tampilan"}
          </button>

          <p className="text-xs text-muted text-center mt-6 leading-relaxed">
            Cetak atau screenshot QR ini sekali, lalu tempel di sekretariat.
            Anggota scan setiap pagi via{" "}
            <span className="font-medium text-secondary">/absen</span> — masing-masing
            cukup sekali per hari.
          </p>
        </>
      )}
    </PageShell>
  );
}
