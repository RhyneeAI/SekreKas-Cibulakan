"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

const STORAGE_KEY = "kkn_absensi_device";

type StoredDevice = {
  uuid: string;
  mahasiswa_id: number;
  nama: string;
};

type Mahasiswa = { id: number; nama: string };

export default function AbsenPage() {
  const [device, setDevice] = useState<StoredDevice | null>(null);
  const [mode, setMode] = useState<"loading" | "register" | "verify" | "ready">(
    "loading"
  );
  const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);
  const [selectedMhs, setSelectedMhs] = useState<number | "">("");
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

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
      setMessage("Pilih nama dan buat PIN minimal 4 digit");
      return;
    }
    const uuid = crypto.randomUUID();
    const res = await fetch("/api/absensi/register-device", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uuid, mahasiswa_id: selectedMhs, pin }),
    });
    const data = await res.json();
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
      setMessage(data.message);
    }
  }

  async function handleVerifyPin() {
    if (!selectedMhs || pin.length < 4) {
      setMessage("Pilih nama dan masukkan PIN");
      return;
    }
    const uuid = crypto.randomUUID();
    const res = await fetch("/api/absensi/verify-pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mahasiswa_id: selectedMhs, pin, uuid }),
    });
    const data = await res.json();
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
      setMessage(data.message);
    }
  }

  async function startScanner() {
    setScanning(true);
    setMessage(null);
  }

  function handleScanResult(decodedText: string) {
    stopScanner();
    doCheckIn(decodedText);
  }

  async function doCheckIn(token: string) {
    if (!device) return;
    const res = await fetch("/api/absensi/check-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uuid: device.uuid, qr_token: token }),
    });
    const data = await res.json();
    setMessage(data.success ? `Absen berhasil, ${device.nama}!` : data.message);
  }

  async function stopScanner() {
    setScanning(false);
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {}
      scannerRef.current = null;
    }
  }

  useEffect(() => {
    if (!scanning || !previewRef.current) return;
    const scanner = new Html5Qrcode("qr-preview");
    scannerRef.current = scanner;
    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        handleScanResult
      )
      .catch(() => {
        setMessage("Tidak bisa mengakses kamera");
        setScanning(false);
      });
    return () => {
      scanner.stop().catch(() => {});
    };
  }, [scanning]);

  if (mode === "loading") return <main style={{ padding: 24 }}>Memuat...</main>;

  if (scanning) {
    return (
      <main style={{ padding: 24, maxWidth: 400, margin: "0 auto" }}>
        <h2>Arahkan kamera ke QR Code</h2>
        <div
          id="qr-preview"
          ref={previewRef}
          style={{ width: "100%", aspectRatio: "1/1", background: "#000" }}
        />
        <button
          onClick={stopScanner}
          style={{ marginTop: 12, padding: "8px 16px" }}
        >
          Batal
        </button>
      </main>
    );
  }

  if (mode === "ready" && device) {
    return (
      <main style={{ padding: 24, maxWidth: 400, margin: "0 auto" }}>
        <h1>Absensi KKN</h1>
        <p>Halo, {device.nama}</p>
        <button onClick={startScanner} style={{ padding: "12px 24px" }}>
          Scan QR & Absen
        </button>
        {message && <p>{message}</p>}
      </main>
    );
  }

  return (
    <main style={{ padding: 24, maxWidth: 400, margin: "0 auto" }}>
      <h1>{mode === "register" ? "Daftar Device" : "Verifikasi PIN"}</h1>
      <p>
        {mode === "register"
          ? "Device baru terdeteksi. Pilih nama kamu dan buat PIN (hanya sekali)."
          : "Device baru terdeteksi. Masukkan nama dan PIN yang sudah kamu buat sebelumnya."}
      </p>

      <select
        value={selectedMhs}
        onChange={(e) => setSelectedMhs(Number(e.target.value))}
        style={{ display: "block", marginBottom: 12, padding: 8, width: "100%" }}
      >
        <option value="">-- Pilih Nama --</option>
        {mahasiswaList.map((m) => (
          <option key={m.id} value={m.id}>
            {m.nama}
          </option>
        ))}
      </select>

      <input
        type="password"
        inputMode="numeric"
        maxLength={6}
        placeholder="PIN (4-6 digit)"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        style={{ display: "block", marginBottom: 12, padding: 8, width: "100%" }}
      />

      <button
        onClick={mode === "register" ? handleRegister : handleVerifyPin}
        style={{ padding: "12px 24px", width: "100%" }}
      >
        {mode === "register" ? "Daftar" : "Verifikasi"}
      </button>

      {mode === "register" && (
        <p style={{ marginTop: 12 }}>
          Sudah pernah daftar dari device lain?{" "}
          <button onClick={() => setMode("verify")} style={{ textDecoration: "underline" }}>
            Masukkan PIN
          </button>
        </p>
      )}

      {message && <p style={{ color: "red" }}>{message}</p>}
    </main>
  );
}
