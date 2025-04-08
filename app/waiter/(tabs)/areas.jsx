import React, { useState, useRef, useEffect, useContext } from "react";
import { View, StyleSheet, Text, ActivityIndicator, Dimensions, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { getWaiterAssignedAreas } from "../../../api/services/forWaiter";
import { useFocusEffect } from "expo-router";
import { StyleContext } from "../../../utils/StyleContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Constantes para el sistema de coordenadas
const GRID_SIZE = 100; // Tamaño de la cuadrícula virtual (100x100)

export default function Areas() {
  const [assignedAreas, setAssignedAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const { style } = useContext(StyleContext);
  
  const canvasRef = useRef(null);
  const canvasDimensions = useRef({ width: 0, height: 0 });
  const router = useRouter();

  // Obtener el ID del usuario actual
  useEffect(() => {
    const getUserData = async () => {
      try {
        console.log("Intentando obtener datos del usuario desde AsyncStorage");
        
        // Intentar obtener el ID del usuario directamente
        const userId = await AsyncStorage.getItem("user_id");
        console.log("ID del usuario obtenido directamente:", userId);
        
        if (userId) {
          console.log("ID del usuario encontrado:", userId);
          setUserId(parseInt(userId));
          return;
        }
        
        // Si no se encuentra el ID directamente, intentar obtener los datos completos
        const userDataString = await AsyncStorage.getItem("userData");
        console.log("Datos del usuario obtenidos:", userDataString);
        
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          console.log("Datos del usuario parseados:", userData);
          
          if (userData.userId) {
            console.log("ID del usuario encontrado en userData:", userData.userId);
            setUserId(userData.userId);
          } else if (userData.id) {
            console.log("ID del usuario encontrado (alternativo):", userData.id);
            setUserId(userData.id);
          } else {
            console.error("No se encontró el ID del usuario en los datos");
          }
        } else {
          console.error("No se encontraron datos del usuario en AsyncStorage");
        }
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
      }
    };
    
    getUserData();
  }, []);

  // Función para convertir coordenadas de la cuadrícula virtual a píxeles
  const gridToPixels = (gridX, gridY) => {
    return {
      x: (gridX / GRID_SIZE) * canvasDimensions.current.width,
      y: (gridY / GRID_SIZE) * canvasDimensions.current.height
    };
  };

  // Función para cargar las áreas asignadas al mesero
  const loadAssignedAreas = async () => {
    if (!userId) {
      console.log("No hay ID de usuario disponible, no se puede cargar las áreas asignadas");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log("Iniciando petición para obtener áreas asignadas al usuario:", userId);
      const response = await getWaiterAssignedAreas(userId);
      console.log("Respuesta completa del servicio getWaiterAssignedAreas:", JSON.stringify(response, null, 2));
      
      // Verificar diferentes formatos de respuesta
      let areasData = [];
      
      if (response && response.type === "SUCCESS" && response.data) {
        // Formato esperado: { type: "SUCCESS", data: [...] }
        areasData = response.data;
        console.log("Datos procesados en formato SUCCESS:", JSON.stringify(areasData, null, 2));
      } else if (response && response.result) {
        // Formato alternativo: { result: [...] }
        areasData = response.result;
        console.log("Datos procesados en formato result:", JSON.stringify(areasData, null, 2));
      } else if (Array.isArray(response)) {
        // Formato alternativo: [...]
        areasData = response;
        console.log("Datos procesados como array:", JSON.stringify(areasData, null, 2));
      }
      
      console.log("Datos de áreas asignadas procesados:", JSON.stringify(areasData, null, 2));
      
      if (areasData.length > 0) {
        setAssignedAreas(areasData);
        console.log("Áreas asignadas al mesero:", areasData);
      } else {
        console.log("No se encontraron áreas asignadas para el mesero");
        setAssignedAreas([]);
      }
    } catch (error) {
      console.error("Error al cargar las áreas asignadas:", error);
      setError("Error al cargar las áreas asignadas. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Cargamos las áreas asignadas al montar el componente
  useEffect(() => {
    loadAssignedAreas();
  }, [userId]);

  // Recargamos las áreas cada vez que el usuario regresa a esta pantalla
  useFocusEffect(
    React.useCallback(() => {
      console.log("Pantalla de áreas enfocada, recargando áreas...");
      loadAssignedAreas();
    }, [userId])
  );

  // Actualizamos las dimensiones del canvas cuando cambia el tamaño de la pantalla
  useEffect(() => {
    const updateCanvasDimensions = () => {
      if (canvasRef.current) {
        canvasRef.current.measure((fx, fy, width, height, px, py) => {
          canvasDimensions.current = { width, height };
        });
      }
    };

    // Actualizamos las dimensiones inicialmente
    updateCanvasDimensions();

    // Suscribimos a cambios en el tamaño de la ventana
    const subscription = Dimensions.addEventListener('change', updateCanvasDimensions);

    // Limpiamos la suscripción al desmontar
    return () => {
      subscription.remove();
    };
  }, []);

  // Función para manejar el doble clic en una mesa
  const handleDoubleClick = (item) => {
    console.log("Navegando a CreateCount con posición:", item.positionSiteId);
    router.push({
      pathname: "/waiter/CreateCount",
      params: {
        id: item.positionSiteId,
        x: item.xlocation ? item.xlocation.toFixed(1) : "0.5",
        y: item.ylocation ? item.ylocation.toFixed(1) : "0.5",
        chairs: item.capacity || 4
      }
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: style.BgInterface }]}>
      <View ref={canvasRef} style={[styles.canvas, { backgroundColor: style.BgCard }]}>
        {/* Indicador de carga */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={style.H1} />
            <Text style={[styles.loadingText, { color: style.P }]}>Cargando áreas asignadas...</Text>
          </View>
        )}

        {/* Mensaje de error */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: style.H1 }]}>{error}</Text>
            <TouchableOpacity onPress={loadAssignedAreas}>
              <Text style={[styles.retryText, { color: style.H1 }]}>
                Reintentar
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Mesas asignadas en el lienzo */}
        {assignedAreas.map((item) => {
          console.log(`Mesa ${item.positionSiteId}: x=${item.xlocation}, y=${item.ylocation}, capacidad=${item.capacity}`);
          
          // Convertir las coordenadas a píxeles
          const pixelCoords = gridToPixels(
            item.xlocation * GRID_SIZE, 
            item.ylocation * GRID_SIZE
          );
          
          console.log(`Coordenadas en píxeles: x=${pixelCoords.x}, y=${pixelCoords.y}`);
          
          return (
            <View
              key={item.positionSiteId}
              style={[
                styles.iconWrapper, 
                { 
                  left: pixelCoords.x, 
                  top: pixelCoords.y 
                }
              ]}
              onTouchEnd={() => handleDoubleClick(item)}
            >
              <View style={[
                styles.table, 
                styles.activeTable,
                { backgroundColor: style.BgButton }
              ]}>
                <Icon name="table-restaurant" size={30} style={{ color: style.P }} />
                <View style={{ alignItems: "center", width: "100%" }}>
                  <Text style={styles.chairsText}>{item.capacity || 4}</Text>
                  {/* Mostrar nombre del mesero si está asignado */}
                  {item.waiterName && (
                    <Text style={styles.waiterText}>{item.waiterName}</Text>
                  )}
                </View>
              </View>
            </View>
          );
        })}

        {/* Mensaje cuando no hay áreas asignadas */}
        {!loading && !error && assignedAreas.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: style.P }]}>
              No tienes áreas asignadas en este momento.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  canvas: {
    flex: 1,
    position: "relative",
    borderRadius: 20,
    margin: 10,
    borderWidth: 2,
  },
  iconWrapper: {
    position: "absolute",
    alignItems: "center",
  },
  chairsText: {
    fontSize: 12, 
    color: "white",
    fontWeight: "bold",
    position: "absolute",
    bottom: -35, 
    alignSelf: "center", 
    backgroundColor: "rgba(0, 0, 0, 0.7)", 
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
    minWidth: 28, 
    textAlign: "center", 
  },
  waiterText: {
    fontSize: 11,
    color: "white", 
    fontWeight: "bold",
    position: "absolute",
    top: -60,
    alignSelf: "center",
    textAlign: "center",
    minWidth: 60,
    paddingHorizontal: 5,
    letterSpacing: 0.5,
  },
  table: {
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    width: 50,
    height: 50,
  },
  activeTable: {
    // Color para mesas activas
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    zIndex: 10,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    zIndex: 10,
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  retryText: {
    fontSize: 14,
    textDecorationLine: "underline",
  },
  emptyContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
});

