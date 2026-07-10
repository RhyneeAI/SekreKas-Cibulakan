import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiPost, apiGet } from "./api";

type User = {
  mahasiswa_id: number;
  nama: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (mahasiswa_id: number, pin: string) => Promise<string | null>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>(null!);

const STORAGE_KEY = "kkn_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((json) => {
      if (json) setUser(JSON.parse(json));
      setLoading(false);
    });
  }, []);

  async function login(mahasiswa_id: number, pin: string): Promise<string | null> {
    const uuid = crypto.randomUUID();
    const res = await apiPost("/absensi/verify-pin", { mahasiswa_id, pin, uuid });
    if (!res.ok) return res.data?.message || "PIN salah";
    const userData: User = { mahasiswa_id: res.data.mahasiswa_id, nama: res.data.nama };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
    return null;
  }

  async function logout() {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
