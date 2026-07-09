import { useEffect, useState } from "react";
import { View, Text, FlatList, TextInput, Button, StyleSheet } from "react-native";
import { apiGet, apiPost } from "../lib/api";

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
  const [data, setData] = useState<Transaksi[]>([]);
  const [saldo, setSaldo] = useState(0);
  const [nominal, setNominal] = useState("");
  const [keterangan, setKeterangan] = useState("");

  async function load() {
    const res = await apiGet("/keuangan");
    setData(res.data || []);
    setSaldo(res.saldo_berjalan || 0);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleTambah(jenis: "masuk" | "keluar") {
    if (!nominal) return;
    // TODO: ganti mahasiswa_id_input dengan id user yang sedang login/aktif
    await apiPost("/keuangan", {
      mahasiswa_id_input: 1,
      tanggal: new Date().toISOString().slice(0, 10),
      jenis,
      nominal: Number(nominal),
      keterangan,
    });
    setNominal("");
    setKeterangan("");
    load();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.saldo}>Saldo: Rp{saldo.toLocaleString("id-ID")}</Text>

      <TextInput
        placeholder="Nominal"
        keyboardType="numeric"
        value={nominal}
        onChangeText={setNominal}
        style={styles.input}
      />
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
            <Text>
              {item.tanggal} — {item.jenis === "masuk" ? "+" : "-"}Rp
              {item.nominal.toLocaleString("id-ID")}
            </Text>
            <Text style={styles.subtext}>{item.keterangan} ({item.input_oleh})</Text>
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
  item: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#eee" },
  subtext: { color: "#666", fontSize: 12 },
});
