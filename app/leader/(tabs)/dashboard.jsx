import React, { useState, useContext, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Routes } from "../../../utils/routes";
import { StyleContext } from "../../../utils/StyleContext";
import { checkPendingSellDetails, updateSellDetailStatus } from "../../../api/services/waiterService";
import * as Notifications from 'expo-notifications';

// Configurar el comportamiento de las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pendingDetails, setPendingDetails] = useState([]);
  const { style } = useContext(StyleContext);

  useEffect(() => {
    // Solicitar permisos al cargar el componente
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permisos de notificación denegados');
      }
    };
    requestPermissions();

    // Configurar el listener para cuando se presiona una notificación
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data?.type === 'cancel_request') {
        router.push({
          pathname: "/leader/CancelOrder",
          params: data.params
        });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Función para verificar detalles pendientes
  const checkPendingDetails = async () => {
    try {
      const response = await checkPendingSellDetails();
      if (response && response.type === "SUCCESS" && Array.isArray(response.result)) {
        setPendingDetails(response.result);
      } else {
        setPendingDetails([]);
      }
    } catch (error) {
      console.error("Error al verificar detalles pendientes:", error);
    }
  };

  // Función para manejar la actualización del estado
  const handleStatusUpdate = async (sellDetailStatusId, status) => {
    if (!sellDetailStatusId) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Error",
          body: "Error: ID de detalle no válido",
          sound: true,
        },
        trigger: null,
      });
      return;
    }

    try {
      setLoading(true);
      const response = await updateSellDetailStatus(sellDetailStatusId, status);
      
      if (response && response.type === "SUCCESS") {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Éxito",
            body: `Cancelación ${status === "ACCEPTED" ? "aceptada" : "rechazada"}`,
            sound: true,
          },
          trigger: null,
        });
        await checkPendingDetails();
      } else {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Error",
            body: response?.text || "Error al actualizar el estado",
            sound: true,
          },
          trigger: null,
        });
      }
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Error",
          body: "Error al actualizar el estado",
          sound: true,
        },
        trigger: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDetailPress = async (detail) => {
    if (!detail || !detail.sellDetailStatusId) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Error",
          body: "Error: Detalle no válido",
          sound: true,
        },
        trigger: null,
      });
      return;
    }

    // Navegar a la vista de CancelOrder con los detalles
    router.push({
      pathname: "/leader/CancelOrder",
      params: {
        sellDetailStatusId: detail.sellDetailStatusId,
        sellDetailId: detail.sellDetailId,
        quantity: detail.quantity,
        status: detail.status,
        positionSiteId: detail.positionSiteId,
        name: detail.name,
        nameWaiter: detail.nameWaiter
      }
    });
  };

  // Configurar el intervalo para verificar cada 5 segundos
  useEffect(() => {
    const interval = setInterval(checkPendingDetails, 5000);
    
    // Verificar inmediatamente al cargar
    checkPendingDetails();
    
    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(interval);
  }, []);

  return (
    <View className="flex-1 p-4" style={{ backgroundColor: style.BgInterface }}>
      {/* Barra de título */}
      <Text className="text-xl font-bold mb-4 text-center" style={{ color: style.H2 }}>
        Solicitudes de Cancelación
      </Text>

      {/* Lista de solicitudes pendientes */}
      {pendingDetails.length > 0 ? (
        <FlatList
          data={pendingDetails}
          keyExtractor={(item) => item.sellDetailStatusId.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleDetailPress(item)}
              className="flex-row items-center p-3 rounded-lg mb-2 shadow-sm"
              style={{ backgroundColor: style.BgCard }}
            >
              <Image
                source={{ uri: "https://cdn-icons-png.flaticon.com/512/1046/1046784.png" }}
                className="w-10 h-10 rounded-full mr-4"
              />
              <View className="flex-1">
                <Text className="text-lg font-semibold" style={{ color: style.H2 }}>
                  {item.name}
                </Text>
                <Text style={{ color: style.H3 }}>
                  Mesa #{item.positionSiteId} - Cantidad: {item.quantity}
                </Text>
                <Text style={{ color: style.H3 }}>
                  Mesero: {item.nameWaiter}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View className="flex-1 justify-center items-center">
          <Text style={{ color: style.H3 }}>No hay solicitudes de cancelación pendientes</Text>
        </View>
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      )}
    </View>
  );
}

const styles = {
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
};
