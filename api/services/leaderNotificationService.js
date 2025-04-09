import { checkPendingSellDetails } from './waiterService';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

let notificationInterval = null;

// Configurar el manejador de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Configurar el listener para cuando se presiona una notificación
Notifications.addNotificationResponseReceivedListener(response => {
  const data = response.notification.request.content.data;
  if (data?.type === 'cancel_request') {
    router.push({
      pathname: "/leader/CancelOrder",
      params: data.params
    });
  }
});

export const startLeaderNotifications = () => {
  if (notificationInterval) return; // Ya está corriendo

  const checkPendingRequests = async () => {
    try {
      const response = await checkPendingSellDetails();
      if (response && response.type === "SUCCESS" && Array.isArray(response.result) && response.result.length > 0) {
        // Crear un canal de notificación
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });

        // Programar la notificación
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Solicitudes Pendientes",
            body: `Hay ${response.result.length} solicitudes de cancelación pendientes`,
            data: {
              type: 'cancel_request',
              params: {
                sellDetailStatusId: response.result[0].sellDetailStatusId,
                positionSiteId: response.result[0].positionSiteId,
                name: response.result[0].name,
                nameWaiter: response.result[0].nameWaiter,
                quantity: response.result[0].quantity,
                status: response.result[0].status
              }
            },
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
            vibrate: [0, 250, 250, 250],
          },
          trigger: null,
        });
      }
    } catch (error) {
      console.error("Error al verificar solicitudes pendientes:", error);
    }
  };

  // Verificar inmediatamente
  checkPendingRequests();
  
  // Configurar el intervalo para verificar cada 5 segundos
  notificationInterval = setInterval(checkPendingRequests, 5000);
};

export const stopLeaderNotifications = () => {
  if (notificationInterval) {
    clearInterval(notificationInterval);
    notificationInterval = null;
  }
}; 