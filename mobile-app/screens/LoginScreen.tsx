import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { apiGet } from "../lib/api";
import { useAuth } from "../lib/auth";
import { PageShell } from "../components/PageShell";
import { Alert } from "../components/Alert";

type Mahasiswa = { id: number; nama: string };

export default function LoginScreen() {
  const { login } = useAuth();
  const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);
  const [selected, setSelected] = useState<Mahasiswa | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await apiGet<{ data: Mahasiswa[] }>("/mahasiswa?pengurus=1", {
        silent: true,
      });
      if (res.ok) {
        setMahasiswaList(res.data.data || []);
      } else {
        setError(res.message ?? "Gagal memuat daftar pengurus");
      }
      setLoading(false);
    })();
  }, []);

  async function handleLogin() {
    if (!selected || pin.length < 4) {
      setError("Pilih nama dan masukkan PIN");
      return;
    }
    setError(null);
    setSubmitting(true);
    const msg = await login(selected.id, pin);
    setSubmitting(false);
    if (msg) setError(msg);
  }

  if (loading) {
    return (
      <PageShell title="Login" subtitle="Memuat data pengurus...">
        <View className="bg-white/60 border border-border rounded-2xl p-5 items-center py-8">
          <ActivityIndicator size="large" color="#C68A3E" />
        </View>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Login Pengurus"
      subtitle="Gunakan PIN yang sudah didaftarkan di web absensi (/absen)"
    >
      <View className="bg-white/60 border border-border rounded-2xl p-5">
        <Text className="text-sm font-medium text-text mb-2">Nama</Text>
        <TouchableOpacity
          onPress={() => setShowPicker(true)}
          className="bg-white/70 border border-border rounded-xl px-4 py-3 mb-4"
          activeOpacity={0.7}
        >
          <Text className={selected ? "text-text font-medium" : "text-muted"}>
            {selected ? selected.nama : "-- Pilih Nama --"}
          </Text>
        </TouchableOpacity>

        <Text className="text-sm font-medium text-text mb-2">PIN</Text>
        <TextInput
          placeholder="••••"
          placeholderTextColor="#8B7A6B"
          secureTextEntry
          keyboardType="numeric"
          maxLength={6}
          value={pin}
          onChangeText={setPin}
          className="bg-white/70 border border-border rounded-xl px-4 py-3 mb-4 text-text text-center text-lg tracking-widest"
        />

        <Pressable
          onPress={handleLogin}
          disabled={submitting}
          className="bg-primary rounded-xl py-3 active:opacity-90 disabled:opacity-50"
        >
          <Text className="text-white text-center font-medium text-base">
            {submitting ? "Memproses..." : "Masuk"}
          </Text>
        </Pressable>
      </View>

      <Modal visible={showPicker} transparent animationType="slide">
        <Pressable
          className="flex-1 justify-end bg-black/30"
          onPress={() => setShowPicker(false)}
        >
          <Pressable className="bg-cream rounded-t-2xl max-h-[70%]" onPress={() => {}}>
            <View className="p-5 border-b border-border">
              <Text className="text-lg font-bold text-text">Pilih Nama</Text>
              <Text className="text-sm text-muted mt-1">
                Pengurus kelompok KKN
              </Text>
            </View>
            <View className="px-5 pb-8">
              {mahasiswaList.map((m) => (
                <TouchableOpacity
                  key={m.id}
                  onPress={() => {
                    setSelected(m);
                    setShowPicker(false);
                  }}
                  className="py-3 border-b border-border active:bg-white/40"
                  activeOpacity={0.7}
                >
                  <Text className="text-text font-medium">{m.nama}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {error && <Alert type="error">{error}</Alert>}

      <Text className="text-xs text-muted text-center mt-6 leading-5">
        Belum punya PIN? Daftar sekali di halaman web absensi, lalu kembali ke
        sini untuk login.
      </Text>
    </PageShell>
  );
}
