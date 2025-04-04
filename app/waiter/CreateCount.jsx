import React, { useState, useContext, useEffect, useLayoutEffect } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, ScrollView, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { StyleContext } from "../../utils/StyleContext";
import { Alert } from "react-native";

export default function CreateCount() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();

  useLayoutEffect(() => {
    navigation.setOptions({ title: "Crear cuenta" });
  }, [navigation]);
    
  const { style } = useContext(StyleContext);
  const [searchQuery, setSearchQuery] = useState("");

  const [productos, setProductos] = useState([
    { 
      id: "1", 
      nombre: "Arroz", 
      precio: 50, 
      descripcion: "Suave y esponjoso, perfecto para acompañar platillos.", 
      cantidad: 3,
      imagen: "https://cdn-icons-png.flaticon.com/512/1046/1046784.png" 
    },
    { 
      id: "2", 
      nombre: "Amburguesa", 
      precio: 80, 
      descripcion: "Jugosa carne de res con queso, lechuga y tomate.", 
      cantidad: 2,
      imagen: "https://cdn-icons-png.flaticon.com/512/1046/1046784.png" 
    },
  ]);

  useEffect(() => {
    if (params.platilloId) {
      const productoExistente = productos.find(
        (producto) => producto.id === params.platilloId
      );

      if (productoExistente) {
        aumentarCantidad(params.platilloId);
      } else {
        const nuevoPlatillo = {
          id: params.platilloId,
          nombre: params.platilloNombre,
          precio: parseFloat(params.platilloPrecio),
          descripcion: params.platilloDescripcion,
          cantidad: 1,
          imagen: params.platilloImagen,
        };
        setProductos([...productos, nuevoPlatillo]);
      }

      router.setParams({});
    }
  }, [params]);

  const productosFiltrados = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const aumentarCantidad = (id) => {
    setProductos(
      productos.map((producto) =>
        producto.id === id ? { ...producto, cantidad: producto.cantidad + 1 } : producto
      )
    );
  };

  const disminuirCantidad = (id) => {
    setProductos(
      productos.map((producto) =>
        producto.id === id && producto.cantidad > 0
          ? { ...producto, cantidad: producto.cantidad - 1 }
          : producto
      )
    );
  };

  const total = productos.reduce((sum, producto) => sum + (producto.precio * producto.cantidad), 0);

  return (
    <View className="flex-1 p-4" style={{ backgroundColor: style.BgInterface }}>
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
        <TouchableOpacity 
          className="absolute right-2 top-2 bg-blue-500 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "#1e88e5" }}
          onPress={() => router.push("/waiter/MenuPlatillos")}
        >
          <Text className="text-white text-xl">+</Text>
          </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 mb-4">
  {productosFiltrados.map((producto) => (
    <View key={producto.id} className="relative p-3 mb-3 rounded-lg" style={{ backgroundColor: style.BgCard || "#ffffff" }}>
      
      {/* Precio en la esquina superior derecha */}
      <Text className="absolute top-2 right-2 text-base font-semibold" style={{ color: style.H2 || "#333" }}>
        ${producto.precio.toFixed(2)}
      </Text>

      <View className="flex-row justify-between items-center">
        <Image source={{ uri: producto.imagen }} className="w-16 h-16 rounded-lg mr-3" />
        <View className="flex-1">
          <Text className="text-lg font-semibold" style={{ color: style.H2 || "#333" }}>{producto.nombre}</Text>
          <Text className="text-sm" style={{ color: style.H3 || "#666" }}>{producto.descripcion}</Text>

          <View className="flex-row items-center justify-between mt-1">
            <Text className="text-sm" style={{ color: style.H3 || "#666" }}>{producto.cantidad} platos</Text>
            <View className="flex-row">
              <TouchableOpacity 
                onPress={() => disminuirCantidad(producto.id)} 
                style={{ backgroundColor: "#ff4d4d", paddingVertical: 5, paddingHorizontal: 8, borderRadius: 4, marginRight: 5 }}
              >
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>−</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => aumentarCantidad(producto.id)} 
                style={{ backgroundColor: "#4CAF50", paddingVertical: 5, paddingHorizontal: 8, borderRadius: 4 }}
              >
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
      
    </View>
  ))}
</ScrollView>

      <View className="mb-4 p-3 rounded-lg" style={{ backgroundColor: style.BgCard || "#ffffff" }}>
        <Text className="text-lg font-bold" style={{ color: style.H2 || "#333" }}>Total: ${total.toFixed(2)}</Text>
      </View>

      <TouchableOpacity
  className="p-3 rounded-lg items-center"
  style={{ backgroundColor: "#1e88e5" }}
  onPress={() => {
    Alert.alert("Cuenta creada", "La cuenta se ha creado exitosamente.", [
      { text: "OK", onPress: () => router.back() }
    ]);
  }}
>
  <Text className="font-semibold text-white">Terminar</Text>
</TouchableOpacity>

    </View>
  );
}
