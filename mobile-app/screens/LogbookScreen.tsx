import { useEffect, useState } from "react";
import {
  View, Text, FlatList, TextInput, Button, StyleSheet, ActivityIndicator, Alert,
} from "react-native";
import { apiGet, apiPost, apiPut, apiDelete } from "../lib/api";

type Logbook = {
  id: number;
  tanggal: string;
  kegiatan: string;
  deskripsi: string;
  nama: string;
};

export default function LogbookScreen() {
  const [data, setData] = useState<Logbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [kegiatan, setKegiatan] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [editId, setEditId] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    const res = await apiGet("/logbook");
    if (res.ok) setData(res.data.data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSimpan() {
    if (!kegiatan) return;
    const body: any = {
      mahasiswa_id: 1,
      tanggal: new Date().toISOString().slice(0, 10),
      kegiatan,
      deskripsi,
    };

    if (editId) {
      await apiPut(`/logbook/${editId}`, body);
      setEditId(null);
    } else {
      await apiPost("/logbook", body);
    }
    setKegiatan("");
    setDeskripsi("");
    load();
  }

  async function handleDelete(id: number) {
    Alert.alert("Hapus", "Yakin ingin menghapus?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          await apiDelete(`/logbook/${id}`);
          load();
        },
      },
    ]);
  }

  function handleEdit(item: Logbook) {
    setEditId(item.id);
    setKegiatan(item.kegiatan);
    setDeskripsi(item.deskripsi);
  }

  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator style={{ marginBottom: 8 }} />}

      {editId && (
        <Text style={{ color: "orange", marginBottom: 4 }}>
          Mengedit logbook #{editId}
        </Text>
      )}

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
      <Button title={editId ? "Simpan Perubahan" : "Simpan Logbook"} onPress={handleSimpan} />

      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        style={{ marginTop: 16 }}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>
                {item.tanggal} — {item.kegiatan}
              </Text>
              <Text style={styles.subtext}>{item.deskripsi}</Text>
              <Text style={styles.subtext}>oleh {item.nama}</Text>
            </View>
            <View style={styles.actions}>
              <Button title="Edit" onPress={() => handleEdit(item)} />
              <Button title="Hapus" color="red" onPress={() => handleDelete(item.id)} />
            </View>
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
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: { fontWeight: "bold" },
  subtext: { color: "#666", fontSize: 12 },
  actions: { flexDirection: "row", gap: 4 },
});
