import { useEffect, useState } from "react";
import {
  View, Text, FlatList, TextInput, Button, StyleSheet, ActivityIndicator, Alert, Modal, TouchableOpacity,
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
    <View style={styles.container}>
      <Text style={styles.saldo}>Saldo: Rp{saldo.toLocaleString("id-ID")}</Text>

      {loading && <ActivityIndicator style={{ marginBottom: 8 }} />}

      {editId && (
        <Text style={{ color: "orange", marginBottom: 4 }}>
          Mengedit transaksi #{editId}
        </Text>
      )}

      <TextInput
        placeholder="Nominal"
        keyboardType="numeric"
        value={nominal}
        onChangeText={setNominal}
        style={styles.input}
      />

      <TouchableOpacity
        onPress={() => setShowKategori(true)}
        style={[styles.input, { justifyContent: "center" }]}
      >
        <Text style={{ color: kategori ? "#000" : "#999" }}>
          {kategori || "Pilih kategori"}
        </Text>
      </TouchableOpacity>

      <Modal visible={showKategori} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontWeight: "bold", marginBottom: 8 }}>Pilih Kategori</Text>
            {KATEGORI_LIST.map((k) => (
              <TouchableOpacity
                key={k}
                onPress={() => { setKategori(k); setShowKategori(false); }}
                style={styles.modalItem}
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
        style={styles.input}
      />

      <View style={styles.row}>
        <Button title="+ Masuk" onPress={() => handleTambah("masuk")} />
        <Button title="- Keluar" onPress={() => handleTambah("keluar")} color="crimson" />
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={{ flex: 1 }}>
              <Text>
                {item.tanggal} — {item.jenis === "masuk" ? "+" : "-"}Rp
                {item.nominal.toLocaleString("id-ID")}
              </Text>
              <Text style={styles.subtext}>
                {item.keterangan} ({item.input_oleh})
                {item.kategori ? ` — ${item.kategori}` : ""}
              </Text>
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
  saldo: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  subtext: { color: "#666", fontSize: 12 },
  actions: { flexDirection: "row", gap: 4 },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 32,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});
