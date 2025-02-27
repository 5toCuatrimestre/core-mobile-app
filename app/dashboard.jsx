import React, { useState, useContext } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { Routes } from "../utils/routes";
import { StyleContext } from "../utils/StyleContext";

export default function Dashboard() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { style } = useContext(StyleContext);

  // Lista de meseros
  const meseros = [
    { id: "1", nombre: "Mesero Apaez", mesa: "Mesa 1" },
    { id: "2", nombre: "Mesero Isaac", mesa: "Mesa 2" },
    { id: "3", nombre: "Mesero Daniel", mesa: "Mesa 3" },
    { id: "4", nombre: "Mesera Alicia", mesa: "Mesa 4" },
    { id: "5", nombre: "Mesero", mesa: "Mesa 5" },
    { id: "6", nombre: "Mesero Luis", mesa: "Mesa 6" },
  ];

  // Filtrar por búsqueda
  const filteredMeseros = meseros.filter((m) =>
    m.nombre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View className="flex-1 p-4" style={{ backgroundColor: style.BgInterface }}>
      {/* Barra de búsqueda */}
      <TextInput
        className="p-3 border rounded-lg mb-4"
        placeholder="Buscar Mesero"
        placeholderTextColor={style.H3}
        value={search}
        onChangeText={setSearch}
        style={{ backgroundColor: style.BgCard, borderColor: style.H3, color: style.P }}
      />

      {/* Lista de meseros */}
      <FlatList
        data={filteredMeseros}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push({ pathname: "/CancelOrder", params: { mesa: item.mesa } })}
            className="flex-row items-center p-3 rounded-lg mb-2 shadow-sm"
            style={{ backgroundColor: style.BgCard }}
          >
            <Image
              source={{ uri: "https://cdn-icons-png.flaticon.com/512/1046/1046784.png" }}
              className="w-10 h-10 rounded-full mr-4"
            />
            <View>
              <Text className="text-lg font-semibold" style={{ color: style.H2 }}>{item.nombre}</Text>
              <Text style={{ color: style.H3 }}>{item.mesa}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Botón "Ir a espacios" */}
      <TouchableOpacity
        className="mt-4 p-3 rounded-lg items-center"
        onPress={() => router.push(Routes.space)}
        style={{ backgroundColor: style.BgButton }}
      >
        <Text className="font-semibold" style={{ color: style.P }}>Ir a espacios</Text>
      </TouchableOpacity>
    </View>
  );
}
