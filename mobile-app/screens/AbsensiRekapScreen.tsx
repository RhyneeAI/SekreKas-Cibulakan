import { useEffect, useState } from "react";
import { View, Text, FlatList, Button, ActivityIndicator } from "react-native";
import { apiGet } from "../lib/api";
import { useAuth } from "../lib/auth";

type Rekap = {
  mahasiswa_id: number;
  nama: string;
  waktu_masuk: string | null;
  status: "hadir" | "belum_absen";
};

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function AbsensiRekapScreen() {
  const { user, logout } = useAuth();
  const [tanggal, setTanggal] = useState(new Date());
  const [data, setData] = useState<Rekap[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await apiGet(`/absensi/rekap?tanggal=${formatDate(tanggal)}`);
    if (res.ok) setData(res.data.data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [tanggal]);

  function gantiHari(offset: number) {
    const d = new Date(tanggal);
    d.setDate(d.getDate() + offset);
    setTanggal(d);
  }

  return (
    <View className="flex-1 p-4 pt-12">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-sm text-gray-500">{user?.nama}</Text>
        <Button title="Logout" onPress={logout} color="crimson" />
      </View>

      <View className="flex-row justify-between items-center mb-4">
        <Button title="<" onPress={() => gantiHari(-1)} />
        <Text className="text-lg font-bold">{formatDate(tanggal)}</Text>
        <Button title=">" onPress={() => gantiHari(1)} />
      </View>

      {loading && <ActivityIndicator className="m-4" />}

      <FlatList
        data={data}
        keyExtractor={(item) => String(item.mahasiswa_id)}
        renderItem={({ item }) => (
          <View className="flex-row justify-between py-2.5 border-b border-gray-200">
            <Text>{item.nama}</Text>
            <Text className={item.status === "hadir" ? "text-green-600" : "text-gray-400"}>
              {item.status === "hadir" ? `Hadir (${item.waktu_masuk})` : "Belum absen"}
            </Text>
          </View>
        )}
      />
    </View>
  );
}
