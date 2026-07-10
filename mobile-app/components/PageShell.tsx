import {
  View,
  Text,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type PageShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function PageShell({ title, subtitle, children }: PageShellProps) {
  return (
    <SafeAreaView className="flex-1 bg-cream">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerClassName="flex-grow px-6 py-8"
          keyboardShouldPersistTaps="handled"
        >
          <View className="items-center mb-6">
            <View className="bg-white/70 border border-border rounded-full p-2 mb-3">
              <Image
                source={require("../assets/icon.png")}
                className="w-[72px] h-[72px] rounded-full"
                resizeMode="cover"
              />
            </View>
            <Text className="text-xs font-medium text-secondary uppercase tracking-wider">
              SekreKas Cibulakan
            </Text>
            <Text className="text-2xl font-bold text-text mt-1 text-center">
              {title}
            </Text>
            {subtitle ? (
              <Text className="text-sm text-muted mt-2 text-center leading-5">
                {subtitle}
              </Text>
            ) : null}
          </View>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
