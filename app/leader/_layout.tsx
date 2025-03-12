import { Stack } from "expo-router";
import { StyleContextProvider } from "../../utils/StyleContext";
import "../../global.css";

export default function RootLayout() {
  return (
    <StyleContextProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </StyleContextProvider>
  );
}
