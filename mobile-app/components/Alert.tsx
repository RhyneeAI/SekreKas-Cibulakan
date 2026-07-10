import { Text, View } from "react-native";

type AlertProps = {
  type: "success" | "error" | "info";
  children: React.ReactNode;
};

const textColor = {
  success: "text-success",
  error: "text-danger",
  info: "text-secondary",
};

const containerStyle = {
  success: "bg-success/10 border-success/30",
  error: "bg-danger/10 border-danger/30",
  info: "bg-primary/10 border-primary/30",
};

export function Alert({ type, children }: AlertProps) {
  return (
    <View className={`mt-4 px-4 py-3 rounded-xl border ${containerStyle[type]}`}>
      <Text className={`text-sm text-center ${textColor[type]}`}>{children}</Text>
    </View>
  );
}
