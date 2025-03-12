import { Stack } from "expo-router";
import { StyleContextProvider } from "../utils/StyleContext";
import "../global.css";

export default function RootLayout() {
  return (
    <StyleContextProvider>
      <Stack screenOptions={{
          headerShown: false, // Oculta la cabecera en todas las pantallas del Stack
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: true }} />
      </Stack>
    </StyleContextProvider>
  );
}
