"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { PageShell } from "@/components/PageShell";
import { Alert } from "@/components/Alert";
import { LoadingCard } from "@/components/LoadingCard";
import { ScanOverlay } from "@/components/ScanOverlay";

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
    } catch {
      // Scanner sudah berhenti
    }
    try {
      scanner.clear();
    } catch {
      // DOM mungkin sudah di-unmount
    }
    stopCameraTracks();
  }

  function stopCameraTracks() {
    document.querySelectorAll("#qr-preview video").forEach((el) => {
      const video = el as HTMLVideoElement;
      const stream = video.srcObject as MediaStream | null;
      stream?.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    });
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

  async function stopScanner() {
    const scanner = scannerRef.current;
    if (scanner) {
      scannerRef.current = null;
      await safeStopScanner(scanner);
    } else {
      stopCameraTracks();
    }
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
    let mounted = true;
    const scanner = new Html5Qrcode("qr-preview");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          aspectRatio: 1,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const edge = Math.min(viewfinderWidth, viewfinderHeight);
            const size = Math.floor(edge * 0.75);
            return { width: size, height: size };
          },
        },
        (decodedText) => {
          if (!mounted || scanHandledRef.current) return;
          scanHandledRef.current = true;
          void (async () => {
            scannerRef.current = null;
            await safeStopScanner(scanner);
            if (mounted) setScanning(false);
            doCheckIn(decodedText);
          })();
        },
        undefined
      )
      .catch(() => {
        if (mounted) {
          setMessage({ type: "error", text: "Tidak bisa mengakses kamera" });
          setScanning(false);
        }
      });

    return () => {
      mounted = false;
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
        <div className="card overflow-hidden p-0 relative animate-scale-in">
          <div id="qr-preview" className="w-full aspect-square bg-text" />
          <ScanOverlay />
        </div>
        <button
          onClick={() => void stopScanner()}
          className="btn-secondary mt-4 animate-fade-in-up [animation-delay:0.15s]"
        >
          Batal
        </button>
      </PageShell>
    );
  }

  if (mode === "ready" && device) {
    const isSuccess = message?.type === "success";

    return (
      <PageShell title="Absensi" subtitle={`Halo, ${device.nama}`}>
        <div className="card text-center animate-scale-in">
          <div
            className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-colors duration-500 ${
              isSuccess
                ? "bg-success/20 border-2 border-success animate-success-pop"
                : "bg-success/15 border border-success/30"
            }`}
          >
            <span className="text-2xl" aria-hidden>
              {isSuccess ? "🎉" : "✓"}
            </span>
          </div>
          <p className="text-sm text-muted mb-1">Device terdaftar</p>
          <p className="font-semibold text-text text-lg mb-6">{device.nama}</p>

          <div className="relative">
            {!submitting && !isSuccess && (
              <span className="absolute inset-0 rounded-xl border-2 border-primary/40 animate-pulse-ring pointer-events-none" />
            )}
            <button
              onClick={startScanner}
              disabled={submitting}
              className={`btn-primary text-lg relative z-10 ${
                !submitting && !isSuccess ? "animate-pulse-soft" : ""
              }`}
            >
              {submitting ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Memproses...
                </span>
              ) : (
                "Scan QR & Absen"
              )}
            </button>
          </div>
        </div>

        {message && <Alert type={message.type}>{message.text}</Alert>}

        <p className="text-xs text-muted text-center mt-6 animate-fade-in [animation-delay:0.2s]">
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
      <div className="card space-y-4 animate-scale-in">
        <div className="animate-fade-in-up [animation-delay:0.05s]">
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

        <div className="animate-fade-in-up [animation-delay:0.12s]">
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

        <div className="animate-fade-in-up [animation-delay:0.2s]">
          <button
            onClick={mode === "register" ? handleRegister : handleVerifyPin}
            disabled={submitting}
            className="btn-primary"
          >
            {submitting ? (
              <span className="inline-flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Memproses...
              </span>
            ) : mode === "register" ? (
              "Daftar Device"
            ) : (
              "Verifikasi PIN"
            )}
          </button>
        </div>
      </div>

      {mode === "register" && (
        <p className="mt-4 text-sm text-center text-muted animate-fade-in-up [animation-delay:0.28s]">
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
