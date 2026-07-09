import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import KeuanganScreen from "./screens/KeuanganScreen";
import LogbookScreen from "./screens/LogbookScreen";
import AbsensiRekapScreen from "./screens/AbsensiRekapScreen";

const Tab = createBottomTabNavigator();

export default function App() {
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
