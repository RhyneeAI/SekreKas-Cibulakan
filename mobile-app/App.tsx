import "./global.css";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AuthProvider, useAuth } from "./lib/auth";
import LoginScreen from "./screens/LoginScreen";
import KeuanganScreen from "./screens/KeuanganScreen";
import LogbookScreen from "./screens/LogbookScreen";
import AbsensiRekapScreen from "./screens/AbsensiRekapScreen";
import PiketScreen from "./screens/PiketScreen";

const Tab = createBottomTabNavigator();

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-cream">
        <ActivityIndicator size="large" color="#C68A3E" />
      </View>
    );
  }

  if (!user) return <LoginScreen />;

  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Keuangan" component={KeuanganScreen} />
        <Tab.Screen name="Logbook" component={LogbookScreen} />
        <Tab.Screen name="Piket" component={PiketScreen} />
        <Tab.Screen name="Absensi" component={AbsensiRekapScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
