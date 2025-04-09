import React, { useState, useContext, useEffect, useLayoutEffect } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, ScrollView, StyleSheet, ActivityIndicator, ToastAndroid, Alert, Linking } from "react-native";
import { useRouter, useLocalSearchParams, useNavigation, useFocusEffect } from "expo-router";
import { StyleContext } from "../../utils/StyleContext";
import { findPositionSell, createPositionSell, getSellDetails, updateSellDetail, cancelSell } from "../../api/services/forWaiter";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { webUrl } from "../../api/authApi";

// URL para la aplicación web

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [sellCreated, setSellCreated] = useState(false);

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
        
        const storedUserId = await AsyncStorage.getItem("user_id");
        if (!storedUserId) {
          throw new Error("No se encontró el ID del usuario");
        }
        
        const currentUserId = parseInt(storedUserId);
        setUserId(currentUserId);
        console.log("ID del usuario obtenido:", currentUserId);
        
        if (!params.id) {
          throw new Error("No se proporcionó el ID de la posición");
        }
        
        const currentPositionSiteId = parseInt(params.id);
        setPositionSiteId(currentPositionSiteId);
        console.log("ID de la posición obtenido:", currentPositionSiteId);
        
        const sellResponse = await findPositionSell(currentPositionSiteId);
        console.log("Respuesta de búsqueda de cuenta por posición:", sellResponse);
        
        if (sellResponse.type === "SUCCESS" && sellResponse.result && sellResponse.result.length > 0) {
          const existingSell = sellResponse.result[0];
          setSellId(existingSell.sellId);
          setSellCreated(true);
          console.log("Cuenta existente encontrada:", existingSell);
        } else {
          setSellCreated(false);
          console.log("No se encontró una cuenta existente para esta posición");
        }
        
        // Cargar los detalles de la venta
        if (sellId) {
          await cargarDetallesVenta(sellId);
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

  useFocusEffect(
    React.useCallback(() => {
      if (sellId) {
        setIsProcessing(true);
        cargarDetallesVenta(sellId).finally(() => {
          setIsProcessing(false);
        });
      }
    }, [sellId])
  );

  const productosFiltrados = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const aumentarCantidad = async (id) => {
    try {
      setIsProcessing(true);
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
        ToastAndroid.show("Cantidad aumentada exitosamente", ToastAndroid.SHORT);
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
    } finally {
      setIsProcessing(false);
    }
  };

  const disminuirCantidad = async (id) => {
    try {
      setIsProcessing(true);
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

      // Navegar a la vista de cancelación
      router.push({
        pathname: "/waiter/CancelProduct",
        params: {
          sellDetailId: producto.sellDetailId,
          positionSiteId: positionSiteId,
          name: producto.nombre,
          nameWaiter: "Isaac", // Aquí deberías obtener el nombre del mesero actual
          quantity: producto.cantidad, // Enviar la cantidad real del producto
          totalPlatillos: producto.cantidad, // Enviar el total de platillos
          productId: producto.id, // Enviar el ID del producto
          sellId: sellId // Enviar el ID de la venta
        }
      });
    } catch (error) {
      console.error("Error al procesar la cancelación:", error);
      ToastAndroid.show("Error al procesar la cancelación", ToastAndroid.SHORT);
    } finally {
      setIsProcessing(false);
    }
  };

  const total = productos.reduce((sum, producto) => sum + (producto.precio * producto.cantidad), 0);

  const handleCreateSell = async () => {
    try {
      setLoading(true);
      setError(null);
      const createResponse = await createPositionSell(userId, positionSiteId);
      if (createResponse.type === "SUCCESS" && createResponse.result) {
        setSellId(createResponse.result.sellId);
        setSellCreated(true);
        ToastAndroid.show("Cuenta creada exitosamente", ToastAndroid.SHORT);
      } else {
        throw new Error("No se pudo crear una nueva cuenta");
      }
    } catch (error) {
      setError("Error al crear la cuenta: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSell = async () => {
    try {
      if (!sellId) return;
      console.log("Total:", total);
      const cancelResponse = await cancelSell(sellId, total);
      if (cancelResponse.type === "SUCCESS") {
        ToastAndroid.show("Cuenta cerrada exitosamente", ToastAndroid.SHORT);
        
        // Redireccionar a la URL del ticket en el navegador
        const ticketUrl = `${webUrl}ticket/${sellId}`;
        console.log("Abriendo ticket en navegador:", ticketUrl);
        
        // Abrir la URL en el navegador del dispositivo
        const canOpen = await Linking.canOpenURL(ticketUrl);
        if (canOpen) {
          await Linking.openURL(ticketUrl);
        } else {
          ToastAndroid.show("No se pudo abrir el navegador", ToastAndroid.SHORT);
        }
        
        // Volver a la pantalla anterior
        router.back();
      } else {
        throw new Error("No se pudo cancelar la cuenta");
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo cancelar la cuenta: " + error.message);
    }
  };

  // Mostrar indicador de carga
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: style.BgInterface }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={style.H1} />
          <Text style={[styles.loadingText, { color: style.H1 }]}>
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
      {sellCreated && (
        <View className="mb-4 relative">
          <TextInput
            className="p-3 pl-10 border rounded-full"
            placeholder="Buscar platillos agregados"
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
            onPress={() => router.push({
              pathname: "/waiter/MenuPlatillos",
              params: { sellId: sellId }
            })}
          >
            <Text className="text-white text-xl">+</Text>
          </TouchableOpacity>
        </View>
      )}

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

      {sellCreated && (
        <View className="mb-4 p-3 rounded-lg" style={{ backgroundColor: style.BgCard || "#ffffff" }}>
          <Text className="text-lg font-bold" style={{ color: style.H2 || "#333" }}>Total: ${total.toFixed(2)}</Text>
        </View>
      )}

      {!sellCreated && (
        <TouchableOpacity
          className="p-3 rounded-lg items-center"
          style={{ backgroundColor: "#1e88e5" }}
          onPress={handleCreateSell}
        >
          <Text className="font-semibold text-white">Crear Cuenta</Text>
        </TouchableOpacity>
      )}

      {sellCreated && (
        <TouchableOpacity
          className="p-3 rounded-lg items-center"
          style={{ backgroundColor: "#e53935" }}
          onPress={() => {
            Alert.alert(
              "¿Estás seguro de cerrar la cuenta?",
              "Esta acción no se puede deshacer.",
              [
                {
                  text: "Cancelar",
                  style: "cancel"
                },
                {
                  text: "Cerrar cuenta",
                  onPress: handleCancelSell
                }
              ]
            );
          }}
        >
          <Text className="font-semibold text-white">Cerrar Cuenta</Text>
        </TouchableOpacity>
      )}

      {isProcessing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      )}

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
});
