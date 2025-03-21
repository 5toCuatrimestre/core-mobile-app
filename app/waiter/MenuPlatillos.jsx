import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { StyleContext } from "../../utils/StyleContext";

export default function MenuPlatillos({ onAgregarPlatillo }) {
const router = useRouter();
const { style } = useContext(StyleContext);
const [searchQuery, setSearchQuery] = useState("");
  // Lista de platillos disponibles en el menú
const [platillos, setPlatillos] = useState([
    {   
        id: "101", 
        nombre: "Enchiladas Verdes", 
        precio: 85, 
        descripcion: "Deliciosas enchiladas con salsa verde, crema y queso.", 
        imagen: "https://cdn-icons-png.flaticon.com/512/1046/1046784.png" 
    },
    { 
        id: "102", 
        nombre: "Tacos de Pastor", 
        precio: 65, 
        descripcion: "Tacos de pastor con piña, cebolla y cilantro.", 
        imagen: "https://cdn-icons-png.flaticon.com/512/1046/1046784.png" 
    },
    { 
        id: "103", 
        nombre: "Pozole", 
        precio: 90, 
        descripcion: "Tradicional pozole rojo con guarniciones.", 
        imagen: "https://cdn-icons-png.flaticon.com/512/1046/1046784.png" 
    },
    { 
      id: "104", 
      nombre: "Quesadillas", 
      precio: 55, 
      descripcion: "Quesadillas de queso con hongos o flor de calabaza.", 
      imagen: "https://cdn-icons-png.flaticon.com/512/1046/1046784.png" 
    },
    { 
      id: "105", 
      nombre: "Chiles Rellenos", 
      precio: 95, 
      descripcion: "Chiles poblanos rellenos de queso, bañados en salsa de tomate.", 
      imagen: "https://cdn-icons-png.flaticon.com/512/1046/1046784.png" 
    },
  ]);

  // Filtrar platillos según la búsqueda
  const platillosFiltrados = platillos.filter((platillo) =>
    platillo.nombre.toLowerCase().includes(searchQuery.toLowerCase())
);

  // Función para agregar platillo a la cuenta
const agregarPlatillo = (platillo) => {
    // Navegar de regreso y pasar el platillo seleccionado
    router.back();
    // Utilizar parámetros para pasar el platillo seleccionado
    router.setParams({ 
      platilloId: platillo.id,
      platilloNombre: platillo.nombre,
      platilloPrecio: platillo.precio.toString(),
      platilloDescripcion: platillo.descripcion,
      platilloImagen: platillo.imagen
    });
  };

  return (
    <View className="flex-1 p-4" style={{ backgroundColor: style.BgInterface }}>
      
      {/* Barra de búsqueda */}
      <View className="mb-4 relative">
        <TextInput
          className="p-3 pl-10 border rounded-full"
          placeholder="Buscar platillo"
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{ 
            backgroundColor: "#f5f5f5", 
            borderColor: style.BgButton,
            color: "#333" 
          }}
        />
        <View className="absolute left-3 top-3">
          <Text>🔍</Text>
        </View>
      </View>

      {/* Título de la página */}
      <View className="mb-4">
        <Text className="text-2xl font-bold" style={{ color: style.H1 || "#333" }}>
          Menú de Platillos
        </Text>
        <Text className="text-sm" style={{ color: style.H3 || "#666" }}>
          Selecciona los platillos para agregar a tu cuenta
        </Text>
      </View>

      {/* Lista de platillos disponibles */}
      <ScrollView className="flex-1 mb-4">
        {platillosFiltrados.map((platillo) => (
          <View 
            key={platillo.id}
            className="flex-row justify-between items-center p-3 mb-3 rounded-lg"
            style={{ backgroundColor: style.BgCard || "#ffffff" }}
          >
            <View className="flex-row items-center flex-1">
              <Image
                source={{ uri: platillo.imagen }}
                className="w-16 h-16 rounded-lg mr-3"
              />
              <View className="flex-1">
                <View className="flex-row justify-between">
                  <Text className="text-lg font-semibold" style={{ color: style.H2 || "#333" }}>
                    {platillo.nombre}
                  </Text>
                  <Text className="text-lg font-semibold" style={{ color: style.H2 || "#333" }}>
                    ${platillo.precio}
                  </Text>
                </View>
                <Text className="text-sm" style={{ color: style.H3 || "#666" }}>
                  {platillo.descripcion}
                </Text>
                <TouchableOpacity
                  onPress={() => agregarPlatillo(platillo)}
                  className="mt-2 px-3 py-1 rounded-lg self-end"
                  style={{ backgroundColor: "#1e88e5" }}
                >
                  <Text className="text-white font-semibold">Agregar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        className="p-3 rounded-lg items-center"
        style={{ backgroundColor: "#1e88e5" }}
        onPress={() => router.back()}
      >

        <Text className="font-semibold text-white">Volver a la cuenta</Text>
      </TouchableOpacity>
    </View>
  );
}