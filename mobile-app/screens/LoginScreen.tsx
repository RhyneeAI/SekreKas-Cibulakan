import { useEffect, useState } from "react";
import {
  View, Text, TextInput, Button, StyleSheet, ActivityIndicator, TouchableOpacity, Modal,
} from "react-native";
import { apiGet } from "../lib/api";
import { useAuth } from "../lib/auth";

type Mahasiswa = { id: number; nama: string };

export default function LoginScreen() {
  const { login } = useAuth();
  const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);
  const [selected, setSelected] = useState<Mahasiswa | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await apiGet("/mahasiswa");
      if (res.ok) setMahasiswaList(res.data.data || []);
      setLoading(false);
    })();
  }, []);

  async function handleLogin() {
    if (!selected || pin.length < 4) {
      setError("Pilih nama dan masukkan PIN");
      return;
    }
    setError(null);
    const msg = await login(selected.id, pin);
    if (msg) setError(msg);
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login KKN</Text>

      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        style={styles.select}
      >
        <Text style={{ color: selected ? "#000" : "#999" }}>
          {selected ? selected.nama : "-- Pilih Nama --"}
        </Text>
      </TouchableOpacity>

      <Modal visible={showPicker} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={{ fontWeight: "bold", marginBottom: 8 }}>Pilih Nama</Text>
            {mahasiswaList.map((m) => (
              <TouchableOpacity
                key={m.id}
                onPress={() => { setSelected(m); setShowPicker(false); }}
                style={styles.item}
              >
                <Text>{m.nama}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <TextInput
        placeholder="PIN"
        secureTextEntry
        keyboardType="numeric"
        maxLength={6}
        value={pin}
        onChangeText={setPin}
        style={styles.input}
      />

      <Button title="Login" onPress={handleLogin} />

      {error && <Text style={{ color: "red", marginTop: 8 }}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 32, paddingTop: 48 },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 24 },
  select: {
    borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, marginBottom: 12,
  },
  input: {
    borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, marginBottom: 12,
  },
  overlay: {
    flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.3)", padding: 32,
  },
  modal: { backgroundColor: "#fff", borderRadius: 12, padding: 20 },
  item: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
});
