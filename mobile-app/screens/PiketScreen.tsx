import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { apiGet, apiPost } from "../lib/api";
import { PageShell } from "../components/PageShell";
import { formatDateId, mondayOfWeek, todayLocal } from "../lib/date";

type PoolMember = {
  id: number;
  nama: string;
  boost_group: string | null;
};

type ExcludedMember = { id: number; nama: string };

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

type JadwalRingkas = {
  id: number;
  nama: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  orang_per_hari: number;
};

type HariJadwal = {
  tanggal: string;
  anggota: { nama: string; sudah_absen: boolean }[];
};

type JadwalDetail = {
  id: number;
  nama: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  orang_per_hari: number;
  hari: HariJadwal[];
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function PiketScreen() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [spinLabel, setSpinLabel] = useState("");

  const [pool, setPool] = useState<PoolMember[]>([]);
  const [excluded, setExcluded] = useState<ExcludedMember[]>([]);
  const [boostGroups, setBoostGroups] = useState<BoostGroup[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [jadwalList, setJadwalList] = useState<JadwalRingkas[]>([]);
  const [activeJadwal, setActiveJadwal] = useState<JadwalDetail | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [nama, setNama] = useState("");
  const [tanggalMulai, setTanggalMulai] = useState(mondayOfWeek(todayLocal()));
  const [orangPerHari, setOrangPerHari] = useState("2");

  const loadData = useCallback(async () => {
    setLoading(true);
    const poolRes = await apiGet<{
      data: PoolMember[];
      excluded: ExcludedMember[];
      pool_size: number;
    }>("/mahasiswa?roulette=1");

    if (!poolRes.ok) {
      setLoading(false);
      return;
    }

    const members = poolRes.data.data ?? [];
    const poolSize = poolRes.data.pool_size ?? members.length;

    const [jadwalRes, boostRes] = await Promise.all([
      apiGet<{ data: JadwalRingkas[] }>("/piket/jadwal"),
      apiGet<{ data: BoostGroup[] }>(`/piket/boost?pool=${poolSize}`),
    ]);

    setPool(members);
    setExcluded(poolRes.data.excluded ?? []);
    setSelectedIds(members.map((m) => m.id));
    setBoostGroups(boostRes.ok ? boostRes.data.data ?? [] : []);

    if (jadwalRes.ok) {
      setJadwalList(jadwalRes.data.data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function loadDetail(id: number) {
    const res = await apiGet<{ data: JadwalDetail }>(`/piket/jadwal/${id}`);
    if (res.ok) setActiveJadwal(res.data.data);
  }

  function toggleMember(id: number) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function runSpinAnimation() {
    setSpinning(true);
    const names = shuffle(
      pool.filter((m) => selectedIds.includes(m.id)).map((m) => m.nama)
    );
    for (let i = 0; i < 10; i++) {
      setSpinLabel(names[i % names.length] ?? "...");
      await new Promise((r) => setTimeout(r, 70 + i * 12));
    }
    setSpinning(false);
  }

  async function handleGenerate() {
    if (!nama.trim()) {
      setError("Nama jadwal wajib diisi");
      return;
    }
    if (selectedIds.length === 0) {
      setError("Pilih minimal 1 anggota untuk pool");
      return;
    }

    setSubmitting(true);
    setError(null);
    setMessage(null);
    await runSpinAnimation();

    const res = await apiPost("/piket/jadwal", {
      nama: nama.trim(),
      tanggal_mulai: tanggalMulai,
      orang_per_hari: Number(orangPerHari) || 2,
      mahasiswa_ids: selectedIds,
      auto_assign: true,
      mulai_senin: true,
    });

    setSubmitting(false);
    if (!res.ok) {
      setError(res.data?.message ?? "Gagal membuat jadwal");
      return;
    }

    setMessage(`Jadwal "${res.data.nama}" berhasil dibuat`);
    setActiveJadwal(res.data.jadwal);
    setNama("");
    setShowForm(false);
    void loadData();
  }

  async function handleReroll(id: number) {
    setSubmitting(true);
    setError(null);
    await runSpinAnimation();

    const res = await apiPost(`/piket/jadwal/${id}/roulette`, {
      mahasiswa_ids: selectedIds,
    });
    setSubmitting(false);

    if (!res.ok) {
      setError(res.data?.message ?? "Gagal putar ulang");
      return;
    }

    setMessage(`Roulette ulang ${res.data.rerolled_days} hari`);
    setActiveJadwal(res.data.jadwal);
    void loadData();
  }

  if (loading) {
    return (
      <PageShell title="Jadwal Piket" subtitle="Memuat...">
        <ActivityIndicator size="large" color="#C68A3E" className="mt-8" />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Jadwal Piket"
      subtitle="Generate mingguan 7 hari + roulette assign"
    >
      {spinning && (
        <View className="bg-primary/10 border border-primary/30 rounded-2xl p-4 mb-4 items-center">
          <Text className="text-xs text-muted uppercase tracking-wider mb-1">
            Roulette
          </Text>
          <Text className="text-xl font-bold text-primary">{spinLabel}</Text>
        </View>
      )}

      {boostGroups.length > 0 && (
        <View className="bg-white border border-border rounded-2xl p-4 mb-4">
          <Text className="text-xs font-medium text-secondary uppercase mb-2">
            Boost per grup
          </Text>
          {boostGroups.map((g) => (
            <View key={g.id} className="mb-2">
              <Text className="text-sm font-medium text-text">
                {g.nama} (+{g.boost_percent}%)
                {g.chance
                  ? ` · ~${g.chance.baselinePct}%→${g.chance.boostedPct}%/slot`
                  : ""}
              </Text>
              <Text className="text-xs text-muted">
                {g.members.map((m) => m.nama).join(", ")}
              </Text>
            </View>
          ))}
          <Text className="text-xs text-muted mt-1">
            Pool: {pool.length} orang — boost halus per putaran, terasa sepanjang
            minggu.
          </Text>
        </View>
      )}

      {excluded.length > 0 && (
        <View className="bg-white border border-border rounded-2xl p-4 mb-4">
          <Text className="text-xs font-medium text-muted uppercase mb-1">
            Tidak masuk roulette
          </Text>
          <Text className="text-sm text-text">
            {excluded.map((e) => e.nama).join(", ")}
          </Text>
        </View>
      )}

      {message && (
        <View className="bg-success/15 border border-success/30 rounded-xl p-3 mb-4">
          <Text className="text-sm text-success">{message}</Text>
        </View>
      )}
      {error && (
        <View className="bg-danger/15 border border-danger/30 rounded-xl p-3 mb-4">
          <Text className="text-sm text-danger">{error}</Text>
        </View>
      )}

      <TouchableOpacity
        onPress={() => setShowForm((v) => !v)}
        className="bg-primary rounded-xl py-3.5 mb-4"
      >
        <Text className="text-white text-center font-semibold">
          {showForm ? "Tutup Form" : "+ Buat Jadwal Mingguan"}
        </Text>
      </TouchableOpacity>

      {showForm && (
        <View className="bg-white border border-border rounded-2xl p-4 mb-4 gap-3">
          <Text className="text-sm font-medium text-text">Nama jadwal</Text>
          <TextInput
            className="border border-border rounded-xl px-4 py-3 text-text bg-cream"
            placeholder="Piket Dapur"
            value={nama}
            onChangeText={setNama}
          />

          <Text className="text-sm font-medium text-text">Minggu mulai (Senin)</Text>
          <TextInput
            className="border border-border rounded-xl px-4 py-3 text-text bg-cream"
            value={tanggalMulai}
            onChangeText={(v) => setTanggalMulai(mondayOfWeek(v))}
            placeholder="YYYY-MM-DD"
          />
          <Text className="text-xs text-muted">
            {formatDateId(mondayOfWeek(tanggalMulai))}
          </Text>

          <Text className="text-sm font-medium text-text">Orang per hari</Text>
          <TextInput
            className="border border-border rounded-xl px-4 py-3 text-text bg-cream"
            value={orangPerHari}
            onChangeText={setOrangPerHari}
            keyboardType="number-pad"
          />

          <Text className="text-sm font-medium text-text">
            Pool ({selectedIds.length}/{pool.length})
          </Text>
          <ScrollView className="max-h-36 border border-border rounded-xl">
            {pool.map((m) => (
              <TouchableOpacity
                key={m.id}
                onPress={() => toggleMember(m.id)}
                className="flex-row items-center px-3 py-2.5 border-b border-border"
              >
                <View
                  className={`w-5 h-5 rounded border mr-3 items-center justify-center ${
                    selectedIds.includes(m.id)
                      ? "bg-primary border-primary"
                      : "border-muted"
                  }`}
                >
                  {selectedIds.includes(m.id) && (
                    <Text className="text-white text-xs">✓</Text>
                  )}
                </View>
                <Text className="text-sm text-text flex-1">
                  {m.nama}
                  {m.boost_group ? (
                    <Text className="text-primary text-xs"> ({m.boost_group})</Text>
                  ) : null}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            onPress={() => void handleGenerate()}
            disabled={submitting || spinning}
            className={`rounded-xl py-3.5 ${submitting ? "bg-primary/50" : "bg-primary"}`}
          >
            <Text className="text-white text-center font-semibold">
              {submitting ? "Membuat..." : "🎲 Generate Roulette"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {activeJadwal && (
        <View className="bg-white border border-border rounded-2xl p-4 mb-4">
          <View className="flex-row justify-between items-start mb-3">
            <View className="flex-1 pr-2">
              <Text className="font-semibold text-text text-lg">
                {activeJadwal.nama}
              </Text>
              <Text className="text-xs text-muted">
                {formatDateId(activeJadwal.tanggal_mulai)} —{" "}
                {formatDateId(activeJadwal.tanggal_selesai)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => void handleReroll(activeJadwal.id)}
              disabled={submitting || spinning}
              className="border border-primary rounded-lg px-3 py-2"
            >
              <Text className="text-primary text-xs font-medium">🎲 Ulang</Text>
            </TouchableOpacity>
          </View>
          {activeJadwal.hari.map((h) => (
            <View
              key={h.tanggal}
              className="border border-border rounded-xl px-3 py-2 mb-2 bg-cream/50"
            >
              <Text className="text-xs font-medium text-secondary">
                {formatDateId(h.tanggal)}
              </Text>
              {h.anggota.length === 0 ? (
                <Text className="text-sm text-muted">—</Text>
              ) : (
                h.anggota.map((a, i) => (
                  <Text key={i} className="text-sm text-text">
                    {a.nama}
                    {a.sudah_absen ? " ✓" : ""}
                  </Text>
                ))
              )}
            </View>
          ))}
        </View>
      )}

      <Text className="text-sm font-medium text-text mb-2">Riwayat jadwal</Text>
      {jadwalList.length === 0 ? (
        <Text className="text-sm text-muted">Belum ada jadwal</Text>
      ) : (
        jadwalList.map((j) => (
          <TouchableOpacity
            key={j.id}
            onPress={() => void loadDetail(j.id)}
            className="bg-white border border-border rounded-xl p-3 mb-2"
          >
            <Text className="font-medium text-text">{j.nama}</Text>
            <Text className="text-xs text-muted">
              {formatDateId(j.tanggal_mulai)} — {formatDateId(j.tanggal_selesai)} ·{" "}
              {j.orang_per_hari}/hari
            </Text>
          </TouchableOpacity>
        ))
      )}
    </PageShell>
  );
}
