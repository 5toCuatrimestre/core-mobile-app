import React, { useState, useContext, useEffect, useLayoutEffect } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { StyleContext } from "../../utils/StyleContext";
import { Alert } from "react-native";
import { findPositionSell, createPositionSell, getSellDetails, updateSellDetail } from "../../api/services/forWaiter";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function CreateCount() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const { style } = useContext(StyleContext);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sellId, setSellId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [positionSiteId, setPositionSiteId] = useState(null);
  const [productos, setProductos] = useState([]);

  useLayoutEffect(() => {
    navigation.setOptions({ title: "Crear cuenta" });
  }, [navigation]);

  // Función para cargar los detalles de la venta
  const cargarDetallesVenta = async (currentSellId) => {
    try {
      const detailsResponse = await getSellDetails(currentSellId);
      console.log("Respuesta de detalles de venta:", detailsResponse);
      
      if (detailsResponse.type === "SUCCESS" && detailsResponse.result) {
        // Transformar los detalles al formato de productos
        const transformedProducts = detailsResponse.result.map(detail => {
          console.log("Detalle de venta:", detail);
          return {
            id: detail.productId.toString(),
            sellDetailId: detail.sellDetailId, // Ahora sí obtenemos el ID correcto
            nombre: detail.productName,
            precio: detail.unitPrice,
            descripcion: detail.description,
            cantidad: detail.quantity,
            imagen: detail.multimedia && detail.multimedia.length > 0 
              ? detail.multimedia[0].url 
              : "https://cdn-icons-png.flaticon.com/512/1046/1046784.png",
            categorias: detail.productCategories.map(cat => cat.name)
          };
        });
        
        setProductos(transformedProducts);
        console.log("Productos transformados:", transformedProducts);
      }
    } catch (error) {
      console.error("Error al cargar los detalles de la venta:", error);
      setError("Error al cargar los detalles de la venta: " + error.message);
    }
  };
  
  // Obtener el ID del usuario y buscar o crear una cuenta
  useEffect(() => {
    const initializeSell = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Obtener el ID del usuario
        const storedUserId = await AsyncStorage.getItem("user_id");
        if (!storedUserId) {
          throw new Error("No se encontró el ID del usuario");
        }
        
        const currentUserId = parseInt(storedUserId);
        setUserId(currentUserId);
        console.log("ID del usuario obtenido:", currentUserId);
        
        // Obtener el ID de la posición desde los parámetros
        if (!params.id) {
          throw new Error("No se proporcionó el ID de la posición");
        }
        
        const currentPositionSiteId = parseInt(params.id);
        setPositionSiteId(currentPositionSiteId);
        console.log("ID de la posición obtenido:", currentPositionSiteId);
        
        // Buscar una cuenta existente para esta posición
        const sellResponse = await findPositionSell(currentPositionSiteId);
        console.log("Respuesta de búsqueda de cuenta por posición:", sellResponse);
        
        let currentSellId;
        
        if (sellResponse.type === "SUCCESS" && sellResponse.result && sellResponse.result.length > 0) {
          // Usar la cuenta existente
          const existingSell = sellResponse.result[0];
          currentSellId = existingSell.sellId;
          setSellId(currentSellId);
          console.log("Cuenta existente encontrada:", existingSell);
        } else {
          // Crear una nueva cuenta para esta posición
          const createResponse = await createPositionSell(currentUserId, currentPositionSiteId);
          console.log("Respuesta de creación de cuenta por posición:", createResponse);
          
          if (createResponse.type === "SUCCESS" && createResponse.result) {
            currentSellId = createResponse.result.sellId;
            setSellId(currentSellId);
            console.log("Nueva cuenta creada:", createResponse.result);
          } else {
            throw new Error("No se pudo crear una nueva cuenta");
          }
        }
        
        // Cargar los detalles de la venta
        if (currentSellId) {
          await cargarDetallesVenta(currentSellId);
        }
      } catch (error) {
        console.error("Error al inicializar la cuenta:", error);
        setError("Error al inicializar la cuenta: " + error.message);
      } finally {
        setLoading(false);
      }
    };
    
    initializeSell();
  }, [params.id]);

  // Recargar detalles cuando se regresa de MenuPlatillos
  useEffect(() => {
    if (sellId && params.platilloId) {
      cargarDetallesVenta(sellId);
      // Limpiar los parámetros para evitar recargas innecesarias
      router.setParams({});
    }
  }, [params.platilloId]);

  const productosFiltrados = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const aumentarCantidad = async (id) => {
    try {
      const producto = productos.find(p => p.id === id);
      if (!producto) {
        console.error("Producto no encontrado:", id);
        return;
      }

      if (!producto.sellDetailId) {
        console.error("No se encontró el ID del detalle de venta para el producto:", id);
        return;
      }

      const nuevaCantidad = producto.cantidad + 1;
      console.log("Intentando aumentar cantidad:");
      console.log("- Producto:", producto);
      console.log("- sellDetailId:", producto.sellDetailId);
      console.log("- sellId:", sellId);
      console.log("- productId:", id);
      console.log("- nuevaCantidad:", nuevaCantidad);

      const response = await updateSellDetail(
        producto.sellDetailId,
        sellId,
        parseInt(id),
        nuevaCantidad
      );

      console.log("Respuesta de updateSellDetail:", response);

      if (response.type === "SUCCESS") {
        console.log("Actualización exitosa, recargando detalles...");
        await cargarDetallesVenta(sellId);
      } else {
        throw new Error(response.text || "Error al actualizar la cantidad");
      }
    } catch (error) {
      console.error("Error al aumentar cantidad:", error);
      Alert.alert(
        "Error",
        "No se pudo actualizar la cantidad: " + error.message
      );
    }
  };

  const disminuirCantidad = async (id) => {
    try {
      const producto = productos.find(p => p.id === id);
      if (!producto) {
        console.error("Producto no encontrado:", id);
        return;
      }

      if (!producto.sellDetailId) {
        console.error("No se encontró el ID del detalle de venta para el producto:", id);
        return;
      }

      if (producto.cantidad <= 0) {
        console.log("La cantidad ya es 0, no se puede disminuir más");
        return;
      }

      const nuevaCantidad = producto.cantidad - 1;
      console.log("Intentando disminuir cantidad:");
      console.log("- Producto:", producto);
      console.log("- sellDetailId:", producto.sellDetailId);
      console.log("- sellId:", sellId);
      console.log("- productId:", id);
      console.log("- nuevaCantidad:", nuevaCantidad);

      const response = await updateSellDetail(
        producto.sellDetailId,
        sellId,
        parseInt(id),
        nuevaCantidad
      );

      console.log("Respuesta de updateSellDetail:", response);

      if (response.type === "SUCCESS") {
        console.log("Actualización exitosa, recargando detalles...");
        await cargarDetallesVenta(sellId);
      } else {
        throw new Error(response.text || "Error al actualizar la cantidad");
      }
    } catch (error) {
      console.error("Error al disminuir cantidad:", error);
      Alert.alert(
        "Error",
        "No se pudo actualizar la cantidad: " + error.message
      );
    }
  };

  const total = productos.reduce((sum, producto) => sum + (producto.precio * producto.cantidad), 0);

  // Mostrar indicador de carga
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: style.BgInterface }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={style.H1} />
          <Text style={[styles.loadingText, { color: style.P }]}>
            Cargando cuenta...
          </Text>
        </View>
      </View>
    );
  }

  // Mostrar mensaje de error
  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: style.BgInterface }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: style.H1 }]}>{error}</Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: style.BgButton }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.retryText, { color: style.P }]}>Volver</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
          onPress={() => router.push({
            pathname: "/waiter/MenuPlatillos",
            params: { sellId: sellId }
          })}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    padding: 10,
    borderRadius: 5,
  },
  retryText: {
    fontSize: 16,
  },
});
