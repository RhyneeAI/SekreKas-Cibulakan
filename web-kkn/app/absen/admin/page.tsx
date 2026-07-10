"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { PageShell } from "@/components/PageShell";
import { LoadingCard } from "@/components/LoadingCard";

export default function AdminQRPage() {
  const [expiredAt, setExpiredAt] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchQR() {
    setRefreshing(true);
    const res = await fetch("/api/absensi/qr-today");
    const data = await res.json();
    setExpiredAt(data.expired_at);
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
      subtitle="Tampilkan QR ini untuk di-scan anggota kelompok"
    >
      {loading ? (
        <LoadingCard label="Memuat QR hari ini..." />
      ) : (
        <>
          <div className="card text-center">
            <p className="text-xs font-medium text-secondary uppercase tracking-wider mb-4">
              QR Hari Ini
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

            {expiredAt && (
              <p className="text-sm text-muted">
                Berlaku hingga{" "}
                <span className="font-medium text-text">
                  {new Date(expiredAt).toLocaleString("id-ID", {
                    dateStyle: "long",
                    timeStyle: "short",
                  })}
                </span>
              </p>
            )}
          </div>

          <button
            onClick={fetchQR}
            disabled={refreshing}
            className="btn-primary mt-4"
          >
            {refreshing ? "Memperbarui..." : "Perbarui QR"}
          </button>

          <p className="text-xs text-muted text-center mt-6 leading-relaxed">
            Buka halaman ini setiap pagi dan tampilkan QR ke anggota yang akan
            absen via{" "}
            <span className="font-medium text-secondary">/absen</span>
          </p>
        </>
      )}
    </PageShell>
  );
}
