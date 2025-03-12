import React, { useContext } from "react";
import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StyleContext } from "../../utils/StyleContext";

export default function CancelOrder() {
  const { mesa } = useLocalSearchParams();
  const router = useRouter();
  const { style } = useContext(StyleContext);

  // Lista de productos a cancelar (mostrados con el estilo de los meseros)
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

      {/* Lista de productos (sin interacción) */}
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
          onPress={() => router.push("/dashboard")}
          style={{ backgroundColor: style.BgButton }}
        >
          <Text className="font-semibold" style={{ color: style.P }}>Autorizar cancelación</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="p-3 rounded-lg items-center"
          onPress={() => router.push("/dashboard")}
          style={{ backgroundColor: "#E53935" }} // Rojo para denegar
        >
          <Text className="font-semibold text-white">Denegar cancelación</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
