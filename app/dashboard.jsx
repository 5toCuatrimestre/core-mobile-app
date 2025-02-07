import { View, Text, Button } from "react-native";
import { useRouter } from "expo-router";
import { Routes } from "../utils/routes";

export default function dashboardScreen() {
  const router = useRouter();

  return (
    <View>
      <Text>Pantalla de Detalles</Text>
      <Button title="Volver a Inicio" onPress={() => router.push(Routes.space)} />
    </View>
  );
}
