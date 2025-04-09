import React, { useContext, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, ToastAndroid } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StyleContext } from "../../utils/StyleContext";

export default function CancelOrder() {
  const { mesa } = useLocalSearchParams();
  const router = useRouter();
  const { style } = useContext(StyleContext);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Lista de productos a cancelar
  const productos = [
    {
      id: "1",
      nombre: "Arroz",
      descripcion: "El pedido quiere ser cancelado",
      imagen: "https://cdn-icons-png.flaticon.com/512/3075/3075977.png",
    },
    {
      id: "2",
      nombre: "Hamburguesa",
      descripcion: "El pedido quiere ser cancelado",
      imagen: "https://cdn-icons-png.flaticon.com/512/1046/1046784.png",
    },
  ];

  const handleAutorizar = () => {
    setProcessing(true);
    ToastAndroid.show("Autorizando cancelación...", ToastAndroid.SHORT);
    setTimeout(() => {
      ToastAndroid.show("Cancelación autorizada exitosamente", ToastAndroid.SHORT);
      setProcessing(false);
      router.push("/leader/dashboard");
    }, 1500);
  };

  const handleDenegar = () => {
    setProcessing(true);
    ToastAndroid.show("Denegando cancelación...", ToastAndroid.SHORT);
    setTimeout(() => {
      ToastAndroid.show("Cancelación denegada", ToastAndroid.SHORT);
      setProcessing(false);
      router.push("/leader/dashboard");
    }, 1500);
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
        {mesa}
      </Text>
      <Text className="text-lg font-semibold mb-4 text-center" style={{ color: style.H3 }}>
        Cancelación de Productos
      </Text>

      {/* Lista de productos */}
      <FlatList
        data={productos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            className="flex-row items-center p-3 rounded-lg mb-2 shadow-sm"
            style={{ backgroundColor: style.BgCard }}
          >
            <Image
              source={{ uri: item.imagen }}
              className="w-10 h-10 rounded-full mr-4"
            />
            <View>
              <Text className="text-lg font-semibold" style={{ color: style.H2 }}>{item.nombre}</Text>
              <Text style={{ color: style.H3 }}>{item.descripcion}</Text>
            </View>
          </View>
        )}
      />

      {/* Botones de acción */}
      <View className="mt-4">
        <TouchableOpacity
          className="p-3 rounded-lg items-center mb-2"
          onPress={handleAutorizar} 
          style={{ backgroundColor: style.BgButton }}
          disabled={processing}
        >
          <Text className="font-semibold" style={{ color: style.P }}>Autorizar cancelación</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="p-3 rounded-lg items-center"
          onPress={handleDenegar}
          style={{ backgroundColor: "#E53935" }}
          disabled={processing}
        >
          <Text className="font-semibold text-white">Denegar cancelación</Text>
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
