import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AuthProvider, useAuth } from "./lib/auth";
import LoginScreen from "./screens/LoginScreen";
import KeuanganScreen from "./screens/KeuanganScreen";
import LogbookScreen from "./screens/LogbookScreen";
import AbsensiRekapScreen from "./screens/AbsensiRekapScreen";

const Tab = createBottomTabNavigator();

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) return <LoginScreen />;

  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Keuangan" component={KeuanganScreen} />
        <Tab.Screen name="Logbook" component={LogbookScreen} />
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
