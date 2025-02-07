import { View, Text, Button } from "react-native";
import { useRouter } from "expo-router";
import { Routes } from "../utils/routes";

export default function dashboardScreen() {
  const router = useRouter();

  return (
    <View>
      <Text>Hello world</Text>
      <Button title="Ir a espacios" onPress={() => router.push(Routes.space)} />
    </View>
  );
}
