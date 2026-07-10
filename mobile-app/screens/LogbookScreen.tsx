import { useEffect, useState } from "react";
import {
  View, Text, FlatList, TextInput, Button, StyleSheet, ActivityIndicator, Alert, Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { apiGet, apiPost, apiPut, apiDelete } from "../lib/api";
import { useAuth } from "../lib/auth";

type Logbook = {
  id: number;
  tanggal: string;
  kegiatan: string;
  deskripsi: string;
  foto_url: string | null;
  nama: string;
};

export default function LogbookScreen() {
  const { user } = useAuth();
  const [data, setData] = useState<Logbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [kegiatan, setKegiatan] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [fotoBase64, setFotoBase64] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    const res = await apiGet("/logbook");
    if (res.ok) setData(res.data.data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function pickImage() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Izin diperlukan", "Akses galeri diperlukan untuk upload foto");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      quality: 0.5,
      selectionLimit: 1,
    });
    if (!result.canceled && result.assets[0]) {
      setFotoUri(result.assets[0].uri);
      setFotoBase64(result.assets[0].base64 || null);
    }
  }

  async function takePhoto() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Izin diperlukan", "Akses kamera diperlukan untuk mengambil foto");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      base64: true,
      quality: 0.5,
    });
    if (!result.canceled && result.assets[0]) {
      setFotoUri(result.assets[0].uri);
      setFotoBase64(result.assets[0].base64 || null);
    }
  }

  async function handleSimpan() {
    if (!kegiatan) return;
    const body: any = {
      mahasiswa_id: user!.mahasiswa_id,
      tanggal: new Date().toISOString().slice(0, 10),
      kegiatan,
      deskripsi,
    };
    if (fotoBase64) body.foto_url = `data:image/jpeg;base64,${fotoBase64}`;

    if (editId) {
      await apiPut(`/logbook/${editId}`, body);
      setEditId(null);
    } else {
      await apiPost("/logbook", body);
    }
    setKegiatan("");
    setDeskripsi("");
    setFotoUri(null);
    setFotoBase64(null);
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
    setFotoUri(null);
    setFotoBase64(null);
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

      <View style={styles.row}>
        <Button title="Pilih Foto" onPress={pickImage} />
        <Button title="Ambil Foto" onPress={takePhoto} />
      </View>

      {fotoUri && (
        <Image source={{ uri: fotoUri }} style={styles.preview} />
      )}

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
              {item.foto_url && (
                <Image source={{ uri: item.foto_url }} style={styles.thumb} />
              )}
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
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  preview: { width: 200, height: 150, borderRadius: 8, marginBottom: 8, alignSelf: "center" },
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
  thumb: { width: 80, height: 60, borderRadius: 4, marginTop: 4 },
});
