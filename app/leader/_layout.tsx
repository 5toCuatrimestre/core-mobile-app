import { Stack } from "expo-router";
import { StyleContextProvider } from "../../utils/StyleContext";
import { startLeaderNotifications, stopLeaderNotifications } from "../../api/services/leaderNotificationService";
import { useEffect } from "react";

export default function Layout() {
  useEffect(() => {
    // Iniciar las notificaciones cuando se monta el layout
    startLeaderNotifications();

    // Detener las notificaciones cuando se desmonta el layout
    return () => {
      stopLeaderNotifications();
    };
  }, []);

  return (
    <StyleContextProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </StyleContextProvider>
  );
}
