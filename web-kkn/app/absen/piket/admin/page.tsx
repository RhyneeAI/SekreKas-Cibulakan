"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { Alert } from "@/components/Alert";
import { LoadingCard } from "@/components/LoadingCard";
import { formatDateJakarta, mondayOfWeek, todayJakarta } from "@/lib/date";
import { shuffleArray } from "@/lib/piket-roulette";

type Mahasiswa = { id: number; nama: string; boost_group?: string | null };

type GroupChance = {
  baselinePct: number;
  boostedPct: number;
  deltaPct: number;
};

type BoostGroup = {
  id: number;
  nama: string;
  boost_percent: number;
  members: { mahasiswa_id: number; nama: string }[];
  chance?: GroupChance | null;
};

type ExcludedMember = { id: number; nama: string; jabatan: string | null };

type AnggotaHari = {
  mahasiswa_id: number;
  nama: string;
  assign_id: number;
  sudah_absen: boolean;
};

type HariJadwal = {
  tanggal: string;
  anggota: AnggotaHari[];
};

type JadwalDetail = {
  id: number;
  nama: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  orang_per_hari: number;
  hari: HariJadwal[];
};

type JadwalRingkas = {
  id: number;
  nama: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  orang_per_hari: number;
};

type Message = { type: "success" | "error"; text: string } | null;

export default function PiketAdminPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [spinLabel, setSpinLabel] = useState("");
  const [message, setMessage] = useState<Message>(null);
  const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [jadwalList, setJadwalList] = useState<JadwalRingkas[]>([]);
  const [activeJadwal, setActiveJadwal] = useState<JadwalDetail | null>(null);
  const [boostList, setBoostList] = useState<BoostGroup[]>([]);
  const [excludedList, setExcludedList] = useState<ExcludedMember[]>([]);

  const [nama, setNama] = useState("");
  const [tanggalMulai, setTanggalMulai] = useState(mondayOfWeek(todayJakarta()));
  const [orangPerHari, setOrangPerHari] = useState(2);

  async function loadData() {
    const mhsRes = await fetch("/api/mahasiswa?roulette=1");
    const mhsJson = await mhsRes.json();
    const mhs: Mahasiswa[] = mhsJson.data ?? [];
    const poolSize = mhsJson.pool_size ?? mhs.length;

    const [jadwalRes, boostRes] = await Promise.all([
      fetch("/api/piket/jadwal"),
      fetch(`/api/piket/boost?pool=${poolSize}`),
    ]);
    const jadwalJson = await jadwalRes.json();
    const boostJson = await boostRes.json();

    setMahasiswaList(mhs);
    setSelectedIds(mhs.map((m) => m.id));
    setExcludedList(mhsJson.excluded ?? []);
    setJadwalList(jadwalJson.data ?? []);
    setBoostList(boostJson.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function loadJadwalDetail(id: number) {
    const res = await fetch(`/api/piket/jadwal/${id}`);
    if (!res.ok) return;
    const json = await res.json();
    setActiveJadwal(json.data);
  }

  function toggleMember(id: number) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function runRouletteAnimation() {
    setSpinning(true);
    const names = shuffleArray(
      mahasiswaList.filter((m) => selectedIds.includes(m.id)).map((m) => m.nama)
    );
    for (let i = 0; i < 12; i++) {
      setSpinLabel(names[i % names.length] ?? "...");
      await new Promise((r) => setTimeout(r, 80 + i * 10));
    }
    setSpinning(false);
  }

  async function handleGenerate() {
    if (!nama.trim()) {
      setMessage({ type: "error", text: "Nama jadwal wajib diisi" });
      return;
    }
    if (selectedIds.length === 0) {
      setMessage({ type: "error", text: "Pilih minimal 1 anggota untuk roulette" });
      return;
    }

    setSubmitting(true);
    setMessage(null);
    await runRouletteAnimation();

    const res = await fetch("/api/piket/jadwal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nama: nama.trim(),
        tanggal_mulai: tanggalMulai,
        orang_per_hari: orangPerHari,
        mahasiswa_ids: selectedIds,
        auto_assign: true,
        mulai_senin: true,
      }),
    });
    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setMessage({ type: "error", text: data.message ?? "Gagal membuat jadwal" });
      return;
    }

    setMessage({
      type: "success",
      text: `Jadwal "${data.nama}" mingguan berhasil dibuat (${data.total_assign} assign)`,
    });
    setActiveJadwal(data.jadwal);
    setNama("");
    void loadData();
  }

  async function handleReroll(jadwalId: number) {
    setSubmitting(true);
    setMessage(null);
    await runRouletteAnimation();

    const res = await fetch(`/api/piket/jadwal/${jadwalId}/roulette`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mahasiswa_ids: selectedIds }),
    });
    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setMessage({ type: "error", text: data.message ?? "Gagal putar ulang" });
      return;
    }

    setMessage({
      type: "success",
      text: `Roulette ulang ${data.rerolled_days} hari (${data.skipped_days} hari dikunci karena sudah absen)`,
    });
    setActiveJadwal(data.jadwal);
    void loadData();
  }

  if (loading) {
    return (
      <PageShell title="Jadwal Piket" subtitle="Memuat...">
        <LoadingCard />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Jadwal Piket"
      subtitle="Buat jadwal 1 minggu (7 hari) dengan roulette assign otomatis"
    >
      {boostList.length > 0 && (
        <div className="card mb-4 py-3 px-4 bg-primary/5 border-primary/20">
          <p className="text-xs font-medium text-secondary uppercase tracking-wider mb-2">
            Boost chance per grup
          </p>
          <ul className="text-sm text-text space-y-2">
            {boostList.map((g) => (
              <li key={g.id}>
                <span className="font-medium">{g.nama}</span>
                <span className="text-muted"> — +{g.boost_percent}% untuk grup</span>
                {g.chance && (
                  <span className="text-primary text-xs ml-1">
                    (~{g.chance.baselinePct}% → {g.chance.boostedPct}% per slot)
                  </span>
                )}
                <p className="text-xs text-muted mt-0.5">
                  {g.members.map((m) => m.nama).join(", ")}
                </p>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted mt-2">
            Dari {mahasiswaList.length} orang di pool roulette — boost terlihat tipis per
            putaran, tapi terkumpul sepanjang minggu.
          </p>
        </div>
      )}

      {excludedList.length > 0 && (
        <div className="card mb-4 py-3 px-4 border-border">
          <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">
            Tidak masuk roulette
          </p>
          <p className="text-sm text-text">
            {excludedList.map((e) => e.nama).join(", ")}
          </p>
        </div>
      )}
      {spinning && (
        <div className="card text-center mb-4 border-primary/40 animate-pulse-soft">
          <p className="text-xs uppercase tracking-wider text-muted mb-2">Roulette</p>
          <p className="text-2xl font-bold text-primary min-h-[2rem]">{spinLabel}</p>
        </div>
      )}

      <div className="card space-y-4 animate-scale-in">
        <div>
          <label className="block text-sm font-medium text-text mb-2">Nama Jadwal</label>
          <input
            className="input-field"
            placeholder="Contoh: Piket Dapur"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Minggu mulai (otomatis dari Senin)
          </label>
          <input
            type="date"
            className="input-field"
            value={tanggalMulai}
            onChange={(e) => setTanggalMulai(mondayOfWeek(e.target.value))}
          />
          <p className="text-xs text-muted mt-1">
            Senin: {formatDateJakarta(mondayOfWeek(tanggalMulai))}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Orang per hari
          </label>
          <input
            type="number"
            min={1}
            max={10}
            className="input-field"
            value={orangPerHari}
            onChange={(e) => setOrangPerHari(Number(e.target.value) || 1)}
          />
        </div>

        <div>
          <p className="text-sm font-medium text-text mb-2">
            Pool roulette ({selectedIds.length}/{mahasiswaList.length})
          </p>
          <div className="max-h-40 overflow-y-auto border border-border rounded-xl divide-y divide-border">
            {mahasiswaList.map((m) => {
              const group = boostList.find((g) =>
                g.members.some((mem) => mem.mahasiswa_id === m.id)
              );
              return (
              <label
                key={m.id}
                className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer hover:bg-cream"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(m.id)}
                  onChange={() => toggleMember(m.id)}
                  className="accent-primary"
                />
                <span>
                  {m.nama}
                  {group && (
                    <span className="text-primary text-xs ml-1">
                      (grup {group.nama})
                    </span>
                  )}
                </span>
              </label>
            );
            })}
          </div>
        </div>

        <button
          onClick={() => void handleGenerate()}
          disabled={submitting || spinning}
          className="btn-primary"
        >
          {submitting ? "Membuat jadwal..." : "🎲 Generate Mingguan (Roulette)"}
        </button>
      </div>

      {message && <Alert type={message.type}>{message.text}</Alert>}

      {activeJadwal && (
        <div className="card mt-4 space-y-3 animate-fade-in-up">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-text">{activeJadwal.nama}</p>
              <p className="text-xs text-muted">
                {formatDateJakarta(activeJadwal.tanggal_mulai)} —{" "}
                {formatDateJakarta(activeJadwal.tanggal_selesai)}
              </p>
              <p className="text-xs text-muted">
                {activeJadwal.orang_per_hari} orang/hari
              </p>
            </div>
            <button
              onClick={() => void handleReroll(activeJadwal.id)}
              disabled={submitting || spinning}
              className="btn-secondary text-sm shrink-0"
            >
              🎲 Putar Ulang
            </button>
          </div>

          <div className="space-y-2">
            {activeJadwal.hari.map((h) => (
              <div
                key={h.tanggal}
                className="border border-border rounded-xl px-3 py-2 bg-cream/50"
              >
                <p className="text-xs font-medium text-secondary mb-1">
                  {formatDateJakarta(h.tanggal)}
                </p>
                {h.anggota.length === 0 ? (
                  <p className="text-sm text-muted">Belum ada assign</p>
                ) : (
                  <ul className="text-sm text-text space-y-0.5">
                    {h.anggota.map((a) => (
                      <li key={a.assign_id}>
                        {a.nama}
                        {a.sudah_absen && (
                          <span className="text-success text-xs ml-2">✓ absen</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {jadwalList.length > 0 && (
        <div className="mt-6 space-y-2">
          <p className="text-sm font-medium text-text">Jadwal sebelumnya</p>
          {jadwalList.map((j) => (
            <button
              key={j.id}
              onClick={() => void loadJadwalDetail(j.id)}
              className="w-full text-left card py-3 hover:border-primary/40 transition-colors"
            >
              <p className="font-medium text-text">{j.nama}</p>
              <p className="text-xs text-muted">
                {formatDateJakarta(j.tanggal_mulai)} —{" "}
                {formatDateJakarta(j.tanggal_selesai)} · {j.orang_per_hari}/hari
              </p>
            </button>
          ))}
        </div>
      )}
    </PageShell>
  );
}
