import { Stack } from "expo-router";
import { StyleContextProvider } from "../utils/StyleContext"; 
import "../global.css";

export default function RootLayout() {
  return (
      <StyleContextProvider>
        <Stack />
      </StyleContextProvider>
  );
}
