import React, { useContext, useState } from "react";
import { View, Text, TouchableOpacity, Image, ActivityIndicator, ToastAndroid } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StyleContext } from "../../utils/StyleContext";
import { updateSellDetailStatus } from "../../api/services/waiterService";

export default function CancelOrder() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { style } = useContext(StyleContext);
  const [processing, setProcessing] = useState(false);

  const handleAutorizar = async () => {
    try {
      setProcessing(true);
      
      const response = await updateSellDetailStatus(params.sellDetailStatusId, "ACCEPTED");
      
      if (response && response.type === "SUCCESS") {
        ToastAndroid.show("Cancelación autorizada exitosamente", ToastAndroid.SHORT);
        router.back();
      } else {
        ToastAndroid.show(response?.text || "Error al autorizar la cancelación", ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error("Error al autorizar:", error);
      ToastAndroid.show("Error al autorizar la cancelación", ToastAndroid.SHORT);
    } finally {
      setProcessing(false);
    }
  };

  const handleDenegar = async () => {
    try {
      setProcessing(true);
      ToastAndroid.show("Denegando cancelación...", ToastAndroid.SHORT);
      
      const response = await updateSellDetailStatus(params.sellDetailStatusId, "REJECTED");
      
      if (response && response.type === "SUCCESS") {
        ToastAndroid.show("Cancelación denegada", ToastAndroid.SHORT);
        router.back();
      } else {
        ToastAndroid.show(response?.text || "Error al denegar la cancelación", ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error("Error al denegar:", error);
      ToastAndroid.show("Error al denegar la cancelación", ToastAndroid.SHORT);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View className="flex-1 p-4" style={{ backgroundColor: style.BgInterface }}>
      {/* Logo principal */}
      <View className="items-center mb-4">
        <Image
          source={{ uri: "https://cdn-icons-png.flaticon.com/512/1046/1046784.png" }}
          className="w-20 h-20"
        />
      </View>

      {/* Barra de título */}
      <Text className="text-xl font-bold mb-1 text-center" style={{ color: style.H2 }}>
        Mesa #{params.positionSiteId}
      </Text>
      <Text className="text-lg font-semibold mb-4 text-center" style={{ color: style.H3 }}>
        Cancelación de {params.name}
      </Text>

      {/* Detalles del producto */}
      <View
        className="flex-row items-center p-3 rounded-lg mb-2 shadow-sm"
        style={{ backgroundColor: style.BgCard }}
      >
        <Image
          source={{ uri: "https://cdn-icons-png.flaticon.com/512/1046/1046784.png" }}
          className="w-10 h-10 rounded-full mr-4"
        />
        <View className="flex-1">
          <Text className="text-lg font-semibold" style={{ color: style.H2 }}>
            {params.name}
          </Text>
          <Text style={{ color: style.H3 }}>
            Cantidad: {params.quantity}
          </Text>
          <Text style={{ color: style.H3 }}>
            Mesero: {params.nameWaiter}
          </Text>
          <Text style={{ color: style.H3 }}>
            Estado: {params.status}
          </Text>
        </View>
      </View>

      {/* Botones de acción */}
      <View className="mt-4">
        <TouchableOpacity
          className="p-3 rounded-lg items-center mb-2"
          onPress={handleAutorizar} 
          style={{ backgroundColor: style.BgButton }}
          disabled={processing}
        >
          <Text className="font-semibold" style={{ color: style.P }}>
            {processing ? "Procesando..." : "Autorizar cancelación"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="p-3 rounded-lg items-center"
          onPress={handleDenegar}
          style={{ backgroundColor: "#E53935" }}
          disabled={processing}
        >
          <Text className="font-semibold text-white">
            {processing ? "Procesando..." : "Denegar cancelación"}
          </Text>
        </TouchableOpacity>
      </View>

      {processing && (
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
