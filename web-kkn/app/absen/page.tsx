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

  if (mode === "loading") return <main className="p-6">Memuat...</main>;

  if (scanning) {
    return (
      <main className="p-6 max-w-sm mx-auto text-center">
        <h2 className="text-lg font-semibold mb-4">Arahkan kamera ke QR Code</h2>
        <div
          id="qr-preview"
          ref={previewRef}
          className="w-full aspect-square bg-black"
        />
        <button
          onClick={stopScanner}
          className="mt-3 px-4 py-2 bg-gray-200 rounded"
        >
          Batal
        </button>
      </main>
    );
  }

  if (mode === "ready" && device) {
    return (
      <main className="p-6 max-w-sm mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">Absensi KKN</h1>
        <p className="mb-6">Halo, {device.nama}</p>
        <button
          onClick={startScanner}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg text-lg"
        >
          Scan QR & Absen
        </button>
        {message && <p className="mt-4 text-red-600">{message}</p>}
      </main>
    );
  }

  return (
    <main className="p-6 max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-2">
        {mode === "register" ? "Daftar Device" : "Verifikasi PIN"}
      </h1>
      <p className="text-sm text-gray-600 mb-4">
        {mode === "register"
          ? "Device baru terdeteksi. Pilih nama kamu dan buat PIN (hanya sekali)."
          : "Device baru terdeteksi. Masukkan nama dan PIN yang sudah kamu buat sebelumnya."}
      </p>

      <select
        value={selectedMhs}
        onChange={(e) => setSelectedMhs(Number(e.target.value))}
        className="block w-full p-2 border rounded mb-3"
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
        className="block w-full p-2 border rounded mb-3"
      />

      <button
        onClick={mode === "register" ? handleRegister : handleVerifyPin}
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium"
      >
        {mode === "register" ? "Daftar" : "Verifikasi"}
      </button>

      {mode === "register" && (
        <p className="mt-3 text-sm">
          Sudah pernah daftar dari device lain?{" "}
          <button
            onClick={() => setMode("verify")}
            className="text-blue-600 underline"
          >
            Masukkan PIN
          </button>
        </p>
      )}

      {message && <p className="mt-3 text-red-600">{message}</p>}
    </main>
  );
}
