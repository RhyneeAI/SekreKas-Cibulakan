import { useEffect, useState } from "react";
import {
  View, Text, FlatList, TextInput, Button, ActivityIndicator, Alert, Modal, TouchableOpacity,
} from "react-native";
import { apiGet, apiPost, apiPut, apiDelete } from "../lib/api";
import { useAuth } from "../lib/auth";

const KATEGORI_LIST = ["konsumsi", "transportasi", "dokumentasi", "perlengkapan", "lainnya"];

type Transaksi = {
  id: number;
  tanggal: string;
  jenis: "masuk" | "keluar";
  nominal: number;
  kategori: string;
  keterangan: string;
  input_oleh: string;
};

export default function KeuanganScreen() {
  const { user } = useAuth();
  const [data, setData] = useState<Transaksi[]>([]);
  const [saldo, setSaldo] = useState(0);
  const [loading, setLoading] = useState(true);
  const [nominal, setNominal] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [kategori, setKategori] = useState("");
  const [showKategori, setShowKategori] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    const res = await apiGet("/keuangan");
    if (res.ok) {
      setData(res.data.data || []);
      setSaldo(res.data.saldo_berjalan || 0);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleTambah(jenis: "masuk" | "keluar") {
    if (!nominal) return;
    const body: any = {
      mahasiswa_id_input: user!.mahasiswa_id,
      tanggal: new Date().toISOString().slice(0, 10),
      jenis,
      nominal: Number(nominal),
      keterangan,
    };
    if (kategori) body.kategori = kategori;

    if (editId) {
      await apiPut(`/keuangan/${editId}`, body);
      setEditId(null);
    } else {
      await apiPost("/keuangan", body);
    }
    setNominal("");
    setKeterangan("");
    setKategori("");
    load();
  }

  async function handleDelete(id: number) {
    Alert.alert("Hapus", "Yakin ingin menghapus?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          await apiDelete(`/keuangan/${id}`);
          load();
        },
      },
    ]);
  }

  function handleEdit(item: Transaksi) {
    setEditId(item.id);
    setNominal(String(item.nominal));
    setKeterangan(item.keterangan);
    setKategori(item.kategori || "");
  }

  return (
    <View className="flex-1 p-4 pt-12">
      <Text className="text-xl font-bold mb-4">
        Saldo: Rp{saldo.toLocaleString("id-ID")}
      </Text>

      {loading && <ActivityIndicator className="mb-2" />}

      {editId && (
        <Text className="text-orange-500 mb-1">
          Mengedit transaksi #{editId}
        </Text>
      )}

      <TextInput
        placeholder="Nominal"
        keyboardType="numeric"
        value={nominal}
        onChangeText={setNominal}
        className="border border-gray-300 rounded-lg p-2.5 mb-2"
      />

      <TouchableOpacity
        onPress={() => setShowKategori(true)}
        className="border border-gray-300 rounded-lg p-2.5 mb-2 justify-center"
      >
        <Text className={kategori ? "text-black" : "text-gray-400"}>
          {kategori || "Pilih kategori"}
        </Text>
      </TouchableOpacity>

      <Modal visible={showKategori} transparent animationType="slide">
        <View className="flex-1 justify-center bg-black/30 px-8">
          <View className="bg-white rounded-xl p-5">
            <Text className="font-bold mb-2">Pilih Kategori</Text>
            {KATEGORI_LIST.map((k) => (
              <TouchableOpacity
                key={k}
                onPress={() => { setKategori(k); setShowKategori(false); }}
                className="py-3 border-b border-gray-200"
              >
                <Text>{k}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <TextInput
        placeholder="Keterangan"
        value={keterangan}
        onChangeText={setKeterangan}
        className="border border-gray-300 rounded-lg p-2.5 mb-2"
      />

      <View className="flex-row justify-between mb-4">
        <Button title="+ Masuk" onPress={() => handleTambah("masuk")} />
        <Button title="- Keluar" onPress={() => handleTambah("keluar")} color="crimson" />
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View className="flex-row items-center py-2 border-b border-gray-200">
            <View className="flex-1">
              <Text>
                {item.tanggal} — {item.jenis === "masuk" ? "+" : "-"}Rp
                {item.nominal.toLocaleString("id-ID")}
              </Text>
              <Text className="text-xs text-gray-500">
                {item.keterangan} ({item.input_oleh})
                {item.kategori ? ` — ${item.kategori}` : ""}
              </Text>
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
