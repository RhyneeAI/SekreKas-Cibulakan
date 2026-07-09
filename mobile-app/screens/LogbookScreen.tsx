import { useEffect, useState } from "react";
import { View, Text, FlatList, TextInput, Button, StyleSheet } from "react-native";
import { apiGet, apiPost } from "../lib/api";

type Logbook = {
  id: number;
  tanggal: string;
  kegiatan: string;
  deskripsi: string;
  nama: string;
};

export default function LogbookScreen() {
  const [data, setData] = useState<Logbook[]>([]);
  const [kegiatan, setKegiatan] = useState("");
  const [deskripsi, setDeskripsi] = useState("");

  async function load() {
    const res = await apiGet("/logbook");
    setData(res.data || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSimpan() {
    if (!kegiatan) return;
    // TODO: ganti mahasiswa_id dengan id user yang sedang login/aktif
    await apiPost("/logbook", {
      mahasiswa_id: 1,
      tanggal: new Date().toISOString().slice(0, 10),
      kegiatan,
      deskripsi,
    });
    setKegiatan("");
    setDeskripsi("");
    load();
  }

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Judul kegiatan"
        value={kegiatan}
        onChangeText={setKegiatan}
        style={styles.input}
      />
      <TextInput
        placeholder="Deskripsi"
        value={deskripsi}
        onChangeText={setDeskripsi}
        multiline
        style={[styles.input, { height: 80 }]}
      />
      <Button title="Simpan Logbook" onPress={handleSimpan} />

      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        style={{ marginTop: 16 }}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.title}>
              {item.tanggal} — {item.kegiatan}
            </Text>
            <Text style={styles.subtext}>{item.deskripsi}</Text>
            <Text style={styles.subtext}>oleh {item.nama}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 48 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  item: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#eee" },
  title: { fontWeight: "bold" },
  subtext: { color: "#666", fontSize: 12 },
});
