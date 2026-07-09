import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { apiGet } from "../lib/api";

type Rekap = {
  mahasiswa_id: number;
  nama: string;
  waktu_masuk: string | null;
  status: "hadir" | "belum_absen";
};

export default function AbsensiRekapScreen() {
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [data, setData] = useState<Rekap[]>([]);

  async function load() {
    const res = await apiGet(`/absensi/rekap?tanggal=${tanggal}`);
    setData(res.data || []);
  }

  useEffect(() => {
    load();
  }, [tanggal]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Absensi — {tanggal}</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => String(item.mahasiswa_id)}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.nama}</Text>
            <Text style={item.status === "hadir" ? styles.hadir : styles.belum}>
              {item.status === "hadir" ? `Hadir (${item.waktu_masuk})` : "Belum absen"}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 48 },
  header: { fontSize: 18, fontWeight: "bold", marginBottom: 16 },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  hadir: { color: "green" },
  belum: { color: "#999" },
});
