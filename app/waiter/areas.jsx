import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, Text, ActivityIndicator, Dimensions } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { getAllTables } from "../../api/services/tableService";
import { useFocusEffect } from "expo-router";

// Constantes para el sistema de coordenadas
const GRID_SIZE = 100; // Tamaño de la cuadrícula virtual (100x100)

export default function Areas() {
  const [droppedItems, setDroppedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const canvasRef = useRef(null);
  const canvasDimensions = useRef({ width: 0, height: 0 });
  const router = useRouter();

  // Función para convertir coordenadas de la cuadrícula virtual a píxeles
  const gridToPixels = (gridX, gridY) => {
    return {
      x: (gridX / GRID_SIZE) * canvasDimensions.current.width,
      y: (gridY / GRID_SIZE) * canvasDimensions.current.height
    };
  };

  // Función para cargar las mesas desde el servidor
  const loadTablesFromServer = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllTables();
      
      // Verificamos si la respuesta tiene el formato esperado
      if (response && response.result && Array.isArray(response.result)) {
        // Transformamos los datos del servidor al formato que espera nuestro componente
        const serverTables = response.result.map((table) => {
          // Convertimos de decimal a coordenadas de cuadrícula
          const gridX = table.xlocation * GRID_SIZE;
          const gridY = table.ylocation * GRID_SIZE;
          
          // Si las coordenadas originales son negativas, las distribuimos en el canvas
          if (table.xlocation < 0 || table.ylocation < 0) {
            return {
              id: table.positionSiteId,
              gridX: 20, // Posición por defecto
              gridY: 20, // Posición por defecto
              chairs: table.capacity,
              waiter: table.waiter || null,
              status: table.status
            };
          }
          
          return {
            id: table.positionSiteId,
            gridX: gridX,
            gridY: gridY,
            chairs: table.capacity,
            waiter: table.waiter || null,
            status: table.status
          };
        });
        
        setDroppedItems(serverTables);
      } else {
        throw new Error("Formato de respuesta inválido");
      }
    } catch (error) {
      console.error("Error al cargar las mesas:", error);
      setError("Error al cargar las mesas. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Cargamos las mesas al montar el componente
  useEffect(() => {
    loadTablesFromServer();
  }, []);

  // Recargamos las mesas cada vez que el usuario regresa a esta pantalla
  useFocusEffect(
    React.useCallback(() => {
      console.log("Pantalla de áreas enfocada, recargando mesas...");
      loadTablesFromServer();
    }, [])
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
    router.push({
      pathname: "/waiter/CreateCount",
      params: {
        id: item.id,
        x: item.gridX.toFixed(1),
        y: item.gridY.toFixed(1),
        chairs: item.chairs
      }
    });
  };

  return (
    <View style={styles.container}>
      <View ref={canvasRef} style={styles.canvas}>
        {/* Indicador de carga */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6363" />
            <Text style={styles.loadingText}>Cargando mesas...</Text>
          </View>
        )}

        {/* Mensaje de error */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.retryText} onPress={loadTablesFromServer}>
              Reintentar
            </Text>
          </View>
        )}

        {/* Mesas en el lienzo */}
        {droppedItems.map((item) => (
          <View
            key={item.id}
            style={[
              styles.iconWrapper, 
              { 
                left: gridToPixels(item.gridX, item.gridY).x, 
                top: gridToPixels(item.gridX, item.gridY).y 
              }
            ]}
            onTouchEnd={() => handleDoubleClick(item)}
          >
            <View style={[styles.table, item.status ? styles.activeTable : styles.inactiveTable]}>
              <Icon name="table-restaurant" size={30} color="white" />
              <View style={{ alignItems: "center", width: "100%" }}>
                <Text style={styles.chairsText}>{item.chairs}</Text>
                {/* Mostrar nombre del mesero si está asignado */}
                {item.waiter && (
                  <Text style={styles.waiterText}>{item.waiter}</Text>
                )}
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EAEAEA",
  },
  canvas: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    position: "relative",
    borderRadius: 20,
    margin: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
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
    color: "#ff", 
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
    backgroundColor: "#FF6363",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    width: 50,
    height: 50,
  },
  activeTable: {
    backgroundColor: "#FF6363", // Color para mesas activas
  },
  inactiveTable: {
    backgroundColor: "#A0A0A0", // Color para mesas inactivas
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
    color: "#333",
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
    color: "#FF0000",
    textAlign: "center",
    marginBottom: 10,
  },
  retryText: {
    fontSize: 14,
    color: "#3B82F6",
    textDecorationLine: "underline",
  },
});

