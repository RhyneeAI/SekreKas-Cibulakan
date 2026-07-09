import { useEffect, useState } from "react";
import { View, Text, FlatList, Button, StyleSheet, ActivityIndicator } from "react-native";
import { apiGet } from "../lib/api";

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
    <View style={styles.container}>
      <View style={styles.dateRow}>
        <Button title="<" onPress={() => gantiHari(-1)} />
        <Text style={styles.header}>{formatDate(tanggal)}</Text>
        <Button title=">" onPress={() => gantiHari(1)} />
      </View>

      {loading && <ActivityIndicator style={{ margin: 16 }} />}

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
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  header: { fontSize: 18, fontWeight: "bold" },
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
