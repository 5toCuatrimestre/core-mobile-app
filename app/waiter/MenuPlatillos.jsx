import React, { useState, useContext, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { StyleContext } from "../../utils/StyleContext";
import { getMenu } from "../../api/services/menuService";

export default function MenuPlatillos({ onAgregarPlatillo }) {
  const router = useRouter();
  const { style } = useContext(StyleContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [platillos, setPlatillos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarMenu = async () => {
      try {
        setLoading(true);
        const response = await getMenu(1); // Obtener el menú con ID 1
        
        if (response && response.result && response.result.products) {
          // Transformar los productos del menú al formato esperado
          const productosFormateados = response.result.products.map(producto => ({
            id: producto.productId.toString(),
            nombre: producto.name,
            precio: producto.price,
            descripcion: producto.description,
            imagen: producto.multimedia && producto.multimedia.length > 0 
              ? producto.multimedia[0].url 
              : "https://cdn-icons-png.flaticon.com/512/1046/1046784.png" // Imagen por defecto
          }));
          
          setPlatillos(productosFormateados);
          console.log("Productos cargados:", productosFormateados.length);
        } else {
          console.error("Formato de respuesta inesperado:", response);
          setError("No se pudieron cargar los platillos");
        }
      } catch (err) {
        console.error("Error al cargar el menú:", err);
        setError("Error al cargar el menú");
      } finally {
        setLoading(false);
      }
    };

    cargarMenu();
  }, []);

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

      {/* Estado de carga o error */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#1e88e5" />
          <Text className="mt-2" style={{ color: style.H3 || "#666" }}>Cargando platillos...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center">
          <Text style={{ color: "red" }}>{error}</Text>
          <TouchableOpacity
            className="mt-4 p-2 rounded-lg"
            style={{ backgroundColor: "#1e88e5" }}
            onPress={() => window.location.reload()}
          >
            <Text className="text-white">Intentar de nuevo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Lista de platillos disponibles */
        <ScrollView className="flex-1 mb-4">
          {platillosFiltrados.length > 0 ? (
            platillosFiltrados.map((platillo) => (
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
            ))
          ) : (
            <Text className="text-center my-4" style={{ color: style.H3 || "#666" }}>
              No se encontraron platillos que coincidan con la búsqueda
            </Text>
          )}
        </ScrollView>
      )}

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