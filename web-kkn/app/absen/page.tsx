"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { PageShell } from "@/components/PageShell";
import { Alert } from "@/components/Alert";
import { LoadingCard } from "@/components/LoadingCard";

const STORAGE_KEY = "kkn_absensi_device";

type StoredDevice = {
  uuid: string;
  mahasiswa_id: number;
  nama: string;
};

type Mahasiswa = { id: number; nama: string };

type Message = { type: "success" | "error"; text: string } | null;

export default function AbsenPage() {
  const [device, setDevice] = useState<StoredDevice | null>(null);
  const [mode, setMode] = useState<"loading" | "register" | "verify" | "ready">(
    "loading"
  );
  const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);
  const [selectedMhs, setSelectedMhs] = useState<number | "">("");
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState<Message>(null);
  const [scanning, setScanning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scanHandledRef = useRef(false);

  async function safeStopScanner(scanner: Html5Qrcode) {
    try {
      const state = scanner.getState();
      if (
        state === Html5QrcodeScannerState.SCANNING ||
        state === Html5QrcodeScannerState.PAUSED
      ) {
        await scanner.stop();
      }
      scanner.clear();
    } catch {
      // Scanner sudah berhenti atau belum sempat start
    }
  }

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setDevice(JSON.parse(stored));
      setMode("ready");
      return;
    }
    setMode("register");
    fetchMahasiswa();
  }, []);

  async function fetchMahasiswa() {
    const res = await fetch("/api/mahasiswa");
    const json = await res.json();
    setMahasiswaList(json.data ?? []);
  }

  async function handleRegister() {
    if (!selectedMhs || pin.length < 4) {
      setMessage({ type: "error", text: "Pilih nama dan buat PIN minimal 4 digit" });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    const uuid = crypto.randomUUID();
    const res = await fetch("/api/absensi/register-device", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uuid, mahasiswa_id: selectedMhs, pin }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (data.success) {
      const stored: StoredDevice = {
        uuid: data.uuid,
        mahasiswa_id: data.mahasiswa_id,
        nama: data.nama,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      setDevice(stored);
      setMode("ready");
      setMessage(null);
    } else {
      setMessage({ type: "error", text: data.message });
    }
  }

  async function handleVerifyPin() {
    if (!selectedMhs || pin.length < 4) {
      setMessage({ type: "error", text: "Pilih nama dan masukkan PIN" });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    const uuid = crypto.randomUUID();
    const res = await fetch("/api/absensi/verify-pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mahasiswa_id: selectedMhs, pin, uuid }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (data.success) {
      const stored: StoredDevice = {
        uuid: data.uuid,
        mahasiswa_id: data.mahasiswa_id,
        nama: data.nama,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      setDevice(stored);
      setMode("ready");
      setMessage(null);
    } else {
      setMessage({ type: "error", text: data.message });
    }
  }

  function startScanner() {
    setScanning(true);
    setMessage(null);
  }

  function stopScanner() {
    setScanning(false);
  }

  async function doCheckIn(token: string) {
    if (!device) return;
    setSubmitting(true);
    const res = await fetch("/api/absensi/check-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uuid: device.uuid, qr_token: token }),
    });
    const data = await res.json();
    setSubmitting(false);
    setMessage(
      data.success
        ? { type: "success", text: `Absen berhasil, ${device.nama}!` }
        : { type: "error", text: data.message }
    );
  }

  useEffect(() => {
    if (!scanning) return;

    scanHandledRef.current = false;
    let cancelled = false;
    const scanner = new Html5Qrcode("qr-preview");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          if (cancelled || scanHandledRef.current) return;
          scanHandledRef.current = true;
          setScanning(false);
          doCheckIn(decodedText);
        }
      )
      .catch(() => {
        if (!cancelled) {
          setMessage({ type: "error", text: "Tidak bisa mengakses kamera" });
          setScanning(false);
        }
      });

    return () => {
      cancelled = true;
      if (scannerRef.current === scanner) {
        scannerRef.current = null;
      }
      void safeStopScanner(scanner);
    };
  }, [scanning]);

  if (mode === "loading") {
    return (
      <PageShell title="Absensi" subtitle="Memuat data...">
        <LoadingCard />
      </PageShell>
    );
  }

  if (scanning) {
    return (
      <PageShell
        title="Scan QR"
        subtitle="Arahkan kamera ke QR Code absensi hari ini"
      >
        <div className="card overflow-hidden p-0">
          <div
            id="qr-preview"
            className="w-full aspect-square bg-text/90"
          />
        </div>
        <button onClick={stopScanner} className="btn-secondary mt-4">
          Batal
        </button>
      </PageShell>
    );
  }

  if (mode === "ready" && device) {
    return (
      <PageShell title="Absensi" subtitle={`Halo, ${device.nama}`}>
        <div className="card text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/15 border border-success/30 flex items-center justify-center">
            <span className="text-2xl" aria-hidden>
              ✓
            </span>
          </div>
          <p className="text-sm text-muted mb-1">Device terdaftar</p>
          <p className="font-semibold text-text text-lg mb-6">{device.nama}</p>
          <button
            onClick={startScanner}
            disabled={submitting}
            className="btn-primary text-lg"
          >
            {submitting ? "Memproses..." : "Scan QR & Absen"}
          </button>
        </div>

        {message && <Alert type={message.type}>{message.text}</Alert>}

        <p className="text-xs text-muted text-center mt-6">
          Tap tombol di atas lalu arahkan kamera ke QR dari admin/SC
        </p>
      </PageShell>
    );
  }

  return (
    <PageShell
      title={mode === "register" ? "Daftar Device" : "Verifikasi PIN"}
      subtitle={
        mode === "register"
          ? "Device baru terdeteksi. Pilih nama dan buat PIN (hanya sekali)."
          : "Masukkan nama dan PIN yang sudah kamu buat sebelumnya."
      }
    >
      <div className="card space-y-4">
        <div>
          <label htmlFor="nama" className="block text-sm font-medium text-text mb-2">
            Nama Anggota
          </label>
          <select
            id="nama"
            value={selectedMhs}
            onChange={(e) =>
              setSelectedMhs(e.target.value ? Number(e.target.value) : "")
            }
            className="input-field"
          >
            <option value="">-- Pilih Nama --</option>
            {mahasiswaList.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nama}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="pin" className="block text-sm font-medium text-text mb-2">
            PIN (4–6 digit)
          </label>
          <input
            id="pin"
            type="password"
            inputMode="numeric"
            maxLength={6}
            placeholder="••••"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="input-field tracking-widest text-center text-lg"
          />
        </div>

        <button
          onClick={mode === "register" ? handleRegister : handleVerifyPin}
          disabled={submitting}
          className="btn-primary"
        >
          {submitting
            ? "Memproses..."
            : mode === "register"
              ? "Daftar Device"
              : "Verifikasi PIN"}
        </button>
      </div>

      {mode === "register" && (
        <p className="mt-4 text-sm text-center text-muted">
          Sudah pernah daftar dari device lain?{" "}
          <button
            onClick={() => {
              setMode("verify");
              setMessage(null);
              setPin("");
            }}
            className="text-primary font-medium underline underline-offset-2 hover:text-primary/80 transition-colors"
          >
            Masukkan PIN
          </button>
        </p>
      )}

      {message && <Alert type={message.type}>{message.text}</Alert>}
    </PageShell>
  );
}
