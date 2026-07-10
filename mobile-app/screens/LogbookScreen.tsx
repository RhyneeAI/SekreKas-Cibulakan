import { useEffect, useState } from "react";
import {
  View, Text, FlatList, TextInput, Button, ActivityIndicator, Alert, Image,
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
    <View className="flex-1 p-4 pt-12">
      {loading && <ActivityIndicator className="mb-2" />}

      {editId && (
        <Text className="text-orange-500 mb-1">
          Mengedit logbook #{editId}
        </Text>
      )}

      <TextInput
        placeholder="Judul kegiatan"
        value={kegiatan}
        onChangeText={setKegiatan}
        className="border border-gray-300 rounded-lg p-2.5 mb-2"
      />
      <TextInput
        placeholder="Deskripsi"
        value={deskripsi}
        onChangeText={setDeskripsi}
        multiline
        className="border border-gray-300 rounded-lg p-2.5 mb-2 h-20"
      />

      <View className="flex-row justify-between mb-2">
        <Button title="Pilih Foto" onPress={pickImage} />
        <Button title="Ambil Foto" onPress={takePhoto} />
      </View>

      {fotoUri && (
        <Image source={{ uri: fotoUri }} className="w-52 h-36 rounded-lg mb-2 self-center" />
      )}

      <Button title={editId ? "Simpan Perubahan" : "Simpan Logbook"} onPress={handleSimpan} />

      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        className="mt-4"
        renderItem={({ item }) => (
          <View className="flex-row items-center py-2 border-b border-gray-200">
            <View className="flex-1">
              <Text className="font-bold">
                {item.tanggal} — {item.kegiatan}
              </Text>
              <Text className="text-xs text-gray-500">{item.deskripsi}</Text>
              {item.foto_url && (
                <Image source={{ uri: item.foto_url }} className="w-20 h-15 rounded mt-1" />
              )}
              <Text className="text-xs text-gray-500">oleh {item.nama}</Text>
            </View>
            <View className="flex-row gap-1">
              <Button title="Edit" onPress={() => handleEdit(item)} />
              <Button title="Hapus" color="red" onPress={() => handleDelete(item.id)} />
            </View>
          </View>
        )}
      />
    </View>
  );
}
