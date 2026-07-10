import { useEffect, useState } from "react";
import {
  View, Text, TextInput, Button, ActivityIndicator, TouchableOpacity, Modal,
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
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center px-8 pt-12">
      <Text className="text-2xl font-bold text-center mb-6">Login KKN</Text>

      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        className="border border-gray-300 rounded-lg p-3 mb-3"
      >
        <Text className={selected ? "text-black" : "text-gray-400"}>
          {selected ? selected.nama : "-- Pilih Nama --"}
        </Text>
      </TouchableOpacity>

      <Modal visible={showPicker} transparent animationType="slide">
        <View className="flex-1 justify-center bg-black/30 px-8">
          <View className="bg-white rounded-xl p-5">
            <Text className="font-bold mb-2">Pilih Nama</Text>
            {mahasiswaList.map((m) => (
              <TouchableOpacity
                key={m.id}
                onPress={() => { setSelected(m); setShowPicker(false); }}
                className="py-3 border-b border-gray-200"
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
        className="border border-gray-300 rounded-lg p-3 mb-3"
      />

      <Button title="Login" onPress={handleLogin} />

      {error && <Text className="text-red-500 mt-2">{error}</Text>}
    </View>
  );
}
