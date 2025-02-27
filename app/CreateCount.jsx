import React, { useState, useContext } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { StyleContext } from "../utils/StyleContext";

export default function CreateCount() {
  const router = useRouter();
  const { style } = useContext(StyleContext);
  const [searchQuery, setSearchQuery] = useState("");

  // Lista de productos (ejemplo)
  const [productos, setProductos] = useState([
    { 
      id: "1", 
      nombre: "Arroz", 
      precio: 50, 
      descripcion: "Suave y esponjoso, perfecto para acompañar platillos.", 
      cantidad: 3,
      imagen: "https://example.com/arroz.jpg" 
    },
    { 
      id: "2", 
      nombre: "Amburguesa", 
      precio: 80, 
      descripcion: "Jugosa carne de res con queso, lechuga y tomate.", 
      cantidad: 2,
      imagen: "https://example.com/hamburguesa.jpg" 
    },
    // Puedes agregar más productos aquí
  ]);

  // Filtrar productos según la búsqueda
  const productosFiltrados = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Función para aumentar la cantidad de un producto
  const aumentarCantidad = (id) => {
    setProductos(
      productos.map((producto) =>
        producto.id === id ? { ...producto, cantidad: producto.cantidad + 1 } : producto
      )
    );
  };

  // Función para disminuir la cantidad de un producto
  const disminuirCantidad = (id) => {
    setProductos(
      productos.map((producto) =>
        producto.id === id && producto.cantidad > 0
          ? { ...producto, cantidad: producto.cantidad - 1 }
          : producto
      )
    );
  };

  // Calcular el total
  const total = productos.reduce((sum, producto) => sum + (producto.precio * producto.cantidad), 0);

  return (
    <View className="flex-1 p-4" style={{ backgroundColor: style.BgInterface }}>
      {/* Barra de búsqueda */}
      <View className="mb-4 relative">
        <TextInput
          className="p-3 pl-10 border rounded-full"
          placeholder="Search here"
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
        <TouchableOpacity 
          className="absolute right-2 top-2 bg-blue-500 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "#1e88e5" }}
        >
          <Text className="text-white text-xl">+</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de productos */}
      <ScrollView className="flex-1 mb-4">
        {productosFiltrados.map((producto) => (
          <View 
            key={producto.id}
            className="flex-row justify-between items-center p-3 mb-3 rounded-lg"
            style={{ backgroundColor: style.BgCard || "#ffffff" }}
          >
            <View className="flex-row items-center flex-1">
              <Image
                source={{ uri: producto.imagen }}
                className="w-16 h-16 rounded-lg mr-3"
              />
              <View className="flex-1">
                <View className="flex-row justify-between">
                  <Text className="text-lg font-semibold" style={{ color: style.H2 || "#333" }}>
                    {producto.nombre}
                  </Text>
                  <Text className="text-lg font-semibold" style={{ color: style.H2 || "#333" }}>
                    ${producto.precio}
                  </Text>
                </View>
                <Text className="text-sm" style={{ color: style.H3 || "#666" }}>
                  {producto.descripcion}
                </Text>
                <View className="flex-row items-center mt-1">
                  <Text className="text-sm mr-2" style={{ color: style.H3 || "#666" }}>
                    {producto.cantidad} platos
                  </Text>
                  <View className="flex-row ml-auto">
                    <TouchableOpacity
                      onPress={() => aumentarCantidad(producto.id)}
                      className="w-6 h-6 bg-blue-500 rounded-full justify-center items-center mr-2"
                      style={{ backgroundColor: "#1e88e5" }}
                    >
                      <Text className="text-white">+</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => disminuirCantidad(producto.id)}
                      className="w-6 h-6 bg-blue-500 rounded-full justify-center items-center"
                      style={{ backgroundColor: "#1e88e5" }}
                    >
                      <Text className="text-white">-</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Botón de terminar */}
      <TouchableOpacity
        className="p-3 rounded-lg items-center"
        style={{ backgroundColor: "#1e88e5" }}
        onPress={() => router.back()}
      >
        <Text className="font-semibold text-white">Terminar</Text>
      </TouchableOpacity>
    </View>
  );
}