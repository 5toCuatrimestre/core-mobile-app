import React, { useRef, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  PanResponder,
  Text,
  Alert,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import ChairsModal from "../../../components/ChairsModal"; // 🔹 Importamos el modal externo
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { getAllTables, createTable, updateTable, getTableUser, getUserDetails } from "../../../api/services/tableService"; // Importamos el servicio de mesas
import { useFocusEffect } from "expo-router";

// Constantes para el sistema de coordenadas
const GRID_SIZE = 100; // Tamaño de la cuadrícula virtual (100x100)
const ALIGNMENT_THRESHOLD = 5; // Umbral de alineación en píxeles

export default function Space() {
  const [droppedItems, setDroppedItems] = useState([]);
  const [draggingItem, setDraggingItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [chairs, setChairs] = useState("");
  const [assignedWaiter, setAssignedWaiter] = useState(null); // Nuevo estado para mesero asignado
  const [loading, setLoading] = useState(true); // Estado para controlar la carga
  const [error, setError] = useState(null); // Estado para manejar errores
  const [isCreating, setIsCreating] = useState(false); // Estado para controlar la creación de mesas
  const [isUpdating, setIsUpdating] = useState(false); // Estado para controlar la actualización de mesas
  const canvasRef = useRef(null);
  const idCounterRef = useRef(1);
  const ALIGNMENT_THRESHOLD = 5;
  const router = useRouter();
  const [lastTap, setLastTap] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [longPressTimer, setLongPressTimer] = useState(null);
  const [isDoubleTapMode, setIsDoubleTapMode] = useState(false);
  const lastUpdateTime = useRef(0);
  const canvasDimensions = useRef({ width: 0, height: 0 });
  const params = useLocalSearchParams();
  const [tableUsers, setTableUsers] = useState({});
  const [userDetails, setUserDetails] = useState({});
  const [showChairsModal, setShowChairsModal] = useState(false);
  const [tempCoords, setTempCoords] = useState({ gridX: 0, gridY: 0 });

  // Función para convertir coordenadas de la cuadrícula virtual a píxeles
  const gridToPixels = (gridX, gridY) => {
    return {
      x: (gridX / GRID_SIZE) * canvasDimensions.current.width,
      y: (gridY / GRID_SIZE) * canvasDimensions.current.height
    };
  };

  // Función para convertir coordenadas de píxeles a la cuadrícula virtual
  const pixelsToGrid = (pixelX, pixelY) => {
    return {
      x: Math.round((pixelX / canvasDimensions.current.width) * GRID_SIZE),
      y: Math.round((pixelY / canvasDimensions.current.height) * GRID_SIZE)
    };
  };

  // Función para normalizar coordenadas negativas
  const normalizeCoordinates = (gridX, gridY) => {
    let normalizedX = gridX;
    let normalizedY = gridY;
    
    // Ajustamos coordenadas negativas
    if (normalizedX < 0) {
      normalizedX = 10; // Posición inicial en el lado izquierdo
    }
    if (normalizedY < 0) {
      normalizedY = 10; // Posición inicial en la parte superior
    }
    
    // Aseguramos que las coordenadas no excedan el tamaño de la cuadrícula
    normalizedX = Math.min(normalizedX, GRID_SIZE - 10);
    normalizedY = Math.min(normalizedY, GRID_SIZE - 10);
    
    return { x: normalizedX, y: normalizedY };
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
        const serverTables = response.result.map((table, index) => {
          // Convertimos de decimal a coordenadas de cuadrícula
          // No normalizamos aquí para mantener las coordenadas exactas del servidor
          const gridX = table.xlocation * GRID_SIZE;
          const gridY = table.ylocation * GRID_SIZE;
          
          // Si las coordenadas originales son negativas, distribuimos las mesas en el canvas
          if (table.xlocation < 0 || table.ylocation < 0) {
            // Distribuimos las mesas en una cuadrícula 2x2
            const row = Math.floor(index / 2);
            const col = index % 2;
            return {
              id: table.positionSiteId,
              gridX: 20 + (col * 30), // 20, 50
              gridY: 20 + (row * 30), // 20, 50
              chairs: table.capacity,
              waiter: table.waiter || null, // Si existe un mesero asignado
              waiterEmail: table.waiterEmail || null, // Si existe un email de mesero asignado
              status: table.status
            };
          }
          
          return {
            id: table.positionSiteId,
            gridX: gridX,
            gridY: gridY,
            chairs: table.capacity,
            waiter: table.waiter || null, // Si existe un mesero asignado
            waiterEmail: table.waiterEmail || null, // Si existe un email de mesero asignado
            status: table.status
          };
        });
        
        // Actualizamos el contador de IDs para que no haya conflictos
        if (serverTables.length > 0) {
          idCounterRef.current = Math.max(...serverTables.map(t => t.id)) + 1;
        }
        
        setDroppedItems(serverTables);
        
        // Cargar usuarios asignados a las mesas
        await loadTableUsers(serverTables);
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

  // Función para cargar los usuarios asignados a las mesas
  const loadTableUsers = async (tables) => {
    try {
      const tableUsersData = {};
      const userDetailsData = {};
      
      for (const table of tables) {
        try {
          const tableUserResponse = await getTableUser(table.id);
          if (tableUserResponse && tableUserResponse.result && tableUserResponse.result.length > 0) {
            const tableUser = tableUserResponse.result[0];
            tableUsersData[table.id] = tableUser;
            
            // Obtener detalles del usuario
            const userDetailsResponse = await getUserDetails(tableUser.userId);
            if (userDetailsResponse && userDetailsResponse.result) {
              userDetailsData[tableUser.userId] = userDetailsResponse.result;
            }
          }
        } catch (error) {
          console.error(`Error al cargar usuario para la mesa ${table.id}:`, error);
        }
      }
      
      setTableUsers(tableUsersData);
      setUserDetails(userDetailsData);
    } catch (error) {
      console.error("Error al cargar usuarios de las mesas:", error);
    }
  };

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

  const handleSingleTap = (item) => {
    const now = Date.now();
    if (now - lastTap < 300) {
      // Doble clic detectado - activamos el modo de movimiento
      setIsDoubleTapMode(true);
      setLastTap(0); // Reiniciamos para el siguiente ciclo
    } else {
      // Clic simple - abrimos la pantalla de asignación
      router.push({
        pathname: "/leader/AssignWaiter",
        params: {
          tableId: item.id,
          x: item.gridX.toFixed(1),
          y: item.gridY.toFixed(1),
          chairs: item.chairs,
          currentWaiter: item.waiter,
          previousScreen: "/leader/(tabs)/space"
        }
      });
    }
    setLastTap(now);
  };

  const handlePressIn = (item) => {
    // Iniciamos un temporizador para detectar un clic mantenido
    const timer = setTimeout(() => {
      handleLongPress(item);
    }, 500); // 500ms para considerar un clic mantenido
    
    setLongPressTimer(timer);
  };

  const handlePressOut = () => {
    // Cancelamos el temporizador si el usuario suelta antes de los 500ms
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const assignWaiter = (waiterName, tableId) => {
    setDroppedItems((prevItems) => 
      prevItems.map((item) =>
        item.id === tableId ? { ...item, waiter: waiterName } : item
      )
    );
  };

  const addTableWithChairs = async (gridX, gridY) => {
    console.log("Space: addTableWithChairs llamado con coordenadas", { gridX, gridY });
    
    // Guardamos las coordenadas para usarlas cuando se confirme la mesa
    setTempCoords({ gridX, gridY });
    console.log("Space: Coordenadas temporales guardadas", { gridX, gridY });
    
    // Mostramos el modal para ingresar el número de sillas
    console.log("Space: Mostrando modal de sillas");
    setShowChairsModal(true);
  };

  const handleCancelChairsModal = () => {
    console.log("Space: Cancelando modal de sillas");
    setShowChairsModal(false);
    setChairs("");
  };

  const handleTableCreated = (newTable) => {
    console.log("Space: Mesa creada, actualizando estado", newTable);
    setDroppedItems((prevItems) => [...prevItems, newTable]);
  };

  // Función para actualizar la posición de una mesa en el servidor
  const updateTablePosition = async (tableId, gridX, gridY, chairs) => {
    try {
      setIsUpdating(true);
      
      // Convertimos las coordenadas de la cuadrícula a decimales (0-1) para el servidor
      // Aseguramos que las coordenadas estén dentro del rango 0-1
      const xlocation = Math.max(0, Math.min(1, gridX / GRID_SIZE));
      const ylocation = Math.max(0, Math.min(1, gridY / GRID_SIZE));
      
      console.log(`Actualizando mesa ${tableId} a coordenadas: (${xlocation}, ${ylocation})`);
      
      const response = await updateTable(tableId, {
        capacity: chairs,
        xlocation,
        ylocation
      });
      
      // Si la actualización fue exitosa, actualizamos el estado local
      if (response && response.result) {
        console.log(`Mesa ${tableId} actualizada en el servidor`);
        return true;
      } else {
        throw new Error("Error al actualizar la mesa en el servidor");
      }
    } catch (error) {
      console.error("Error al actualizar la mesa:", error);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        canvasRef.current.measure((fx, fy, width, height, px, py) => {
          // Convertimos las coordenadas de píxeles a la cuadrícula virtual
          const gridCoords = pixelsToGrid(gesture.moveX - px, gesture.moveY - py);
          setDraggingItem({ gridX: gridCoords.x, gridY: gridCoords.y });
        });
      },
      onPanResponderRelease: (_, gesture) => {
        canvasRef.current.measure((fx, fy, width, height, px, py) => {
          // Convertimos las coordenadas de píxeles a la cuadrícula virtual
          const gridCoords = pixelsToGrid(gesture.moveX - px, gesture.moveY - py);
          
          // Aseguramos que las coordenadas estén dentro del rango de la cuadrícula
          const normalizedCoords = normalizeCoordinates(gridCoords.x, gridCoords.y);
          
          addTableWithChairs(normalizedCoords.x, normalizedCoords.y);
        });

        setDraggingItem(null);
      },
    })
  ).current;

  const handleTableSelect = (item) => {
    setSelectedTableId(item.id);
  };

  const handleDetailsPress = (item) => {
    router.push({
      pathname: "/leader/AssignWaiter",
      params: {
        tableId: item.id,
        x: item.gridX.toFixed(1),
        y: item.gridY.toFixed(1),
        chairs: item.chairs,
        currentWaiter: item.waiter,
        previousScreen: "/leader/(tabs)/space"
      }
    });
  };

  const getItemPanResponder = (item) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => selectedTableId === item.id,
      onMoveShouldSetPanResponder: () => selectedTableId === item.id,
      onPanResponderGrant: () => {
        setIsMoving(true);
      },
      onPanResponderMove: (_, gesture) => {
        if (selectedTableId !== item.id) return;
        
        canvasRef.current.measure((fx, fy, width, height, px, py) => {
          // Convertimos las coordenadas de píxeles a la cuadrícula virtual
          const gridCoords = pixelsToGrid(gesture.moveX - px, gesture.moveY - py);
          
          // Aseguramos que las coordenadas estén dentro del rango de la cuadrícula
          const normalizedCoords = normalizeCoordinates(gridCoords.x, gridCoords.y);
          
          const alignedPosition = getAlignedPosition(
            { gridX: normalizedCoords.x, gridY: normalizedCoords.y },
            item.id
          );
          
          setDroppedItems((prevItems) =>
            prevItems.map((prevItem) =>
              prevItem.id === item.id
                ? {
                    ...prevItem,
                    gridX: alignedPosition.gridX,
                    gridY: alignedPosition.gridY,
                  }
                : prevItem
            )
          );
        });
      },
      onPanResponderRelease: (_, gesture) => {
        if (selectedTableId !== item.id) return;
        
        // Obtenemos la posición final de la mesa
        canvasRef.current.measure((fx, fy, width, height, px, py) => {
          // Convertimos las coordenadas de píxeles a la cuadrícula virtual
          const gridCoords = pixelsToGrid(gesture.moveX - px, gesture.moveY - py);
          
          // Aseguramos que las coordenadas estén dentro del rango de la cuadrícula
          const normalizedCoords = normalizeCoordinates(gridCoords.x, gridCoords.y);
          
          const alignedPosition = getAlignedPosition(
            { gridX: normalizedCoords.x, gridY: normalizedCoords.y },
            item.id
          );
          
          // Actualizamos la mesa en el servidor
          const now = Date.now();
          // Limitamos la frecuencia de actualizaciones a una cada 500ms
          if (now - lastUpdateTime.current > 500) {
            lastUpdateTime.current = now;
            console.log(`Guardando mesa ${item.id} en coordenadas: (${alignedPosition.gridX}, ${alignedPosition.gridY})`);
            updateTablePosition(item.id, alignedPosition.gridX, alignedPosition.gridY, item.chairs);
          }
        });
        
        // Desactivamos el modo de movimiento después de soltar
        setTimeout(() => {
          setIsMoving(false);
        }, 300);
      },
    });

  const getAlignedPosition = (current, movingId = null) => {
    let alignedGridX = current.gridX;
    let alignedGridY = current.gridY;

    droppedItems.forEach((item) => {
      if (movingId !== null && item.id === movingId) return;

      if (Math.abs(item.gridY - current.gridY) <= ALIGNMENT_THRESHOLD) {
        alignedGridY = item.gridY;
      }

      if (Math.abs(item.gridX - current.gridX) <= ALIGNMENT_THRESHOLD) {
        alignedGridX = item.gridX;
      }
    });

    return { gridX: alignedGridX, gridY: alignedGridY };
  };

  // Recargamos las mesas cada vez que el usuario regresa a esta pantalla
  useFocusEffect(
    React.useCallback(() => {
      console.log("Pantalla de espacio enfocada, recargando mesas...");
      loadTablesFromServer();
    }, [])
  );

  // Actualizamos el estado local cuando se asigna un mesero
  useEffect(() => {
    if (params.waiter && params.tableId) {
      setDroppedItems(prevItems => 
        prevItems.map(item => 
          item.id === parseInt(params.tableId) 
            ? { 
                ...item, 
                waiter: params.waiter,
                waiterEmail: params.waiterEmail
              } 
            : item
        )
      );
    }
  }, [params.waiter, params.tableId]);

  // Función para obtener el nombre del usuario asignado a una mesa
  const getUserNameForTable = (tableId) => {
    const tableUser = tableUsers[tableId];
    if (tableUser && userDetails[tableUser.userId]) {
      const user = userDetails[tableUser.userId];
      return `${user.name}`;
    }
    return null;
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

        {/* Ícono de mesa mientras se arrastra dentro del lienzo */}
        {draggingItem && (
          <View
            style={[ 
              styles.iconWrapper,
              {
                left: gridToPixels(draggingItem.gridX, draggingItem.gridY).x,
                top: gridToPixels(draggingItem.gridX, draggingItem.gridY).y,
              },
            ]}>
            <Icon name="table-restaurant" size={30} color="gray" />
          </View>
        )}

        {/* Ícono de mesa principal */}
        <View {...panResponder.panHandlers} style={styles.draggable}>
          <View style={styles.draggableContainer}>
            <Icon name="table-restaurant" size={30} color="white" />
          </View>
        </View>

        {/* Mesas en el lienzo */}
        {droppedItems.map((item) => (
          <View
            key={item.id}
            {...getItemPanResponder(item).panHandlers}
            style={[
              styles.iconWrapper, 
              { 
                left: gridToPixels(item.gridX, item.gridY).x, 
                top: gridToPixels(item.gridX, item.gridY).y 
              }
            ]}
            onTouchEnd={() => handleTableSelect(item)}
          >
            <View style={[
              styles.table, 
              item.status ? styles.activeTable : styles.inactiveTable,
              selectedTableId === item.id && styles.selectedTable
            ]}>
              <Icon name="table-restaurant" size={30} color="white" />
              <View style={{ alignItems: "center", width: "100%" }}>
                <Text style={styles.chairsText}>{item.chairs}</Text>
                {/* Mostrar nombre del mesero si está asignado */}
                {item.waiter && (
                  <Text style={styles.waiterText}>{item.waiter}</Text>
                )}
                {/* Mostrar nombre del usuario si está asignado */}
                {getUserNameForTable(item.id) && (
                  <Text style={styles.userText}>{getUserNameForTable(item.id)}</Text>
                )}
              </View>
            </View>
            
            {/* Botón de detalles */}
            {selectedTableId === item.id && (
              <TouchableOpacity 
                style={styles.detailsButton}
                onPress={() => handleDetailsPress(item)}
              >
                <Icon name="info" size={20} color="white" />
                <Text style={styles.detailsButtonText}>Detalles</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      {/* Modal para ingresar la cantidad de sillas */}
      <ChairsModal
        visible={showChairsModal}
        chairs={chairs}
        setChairs={setChairs}
        onCancel={handleCancelChairsModal}
        positionSiteId={params.spaceId}
        gridX={tempCoords.gridX}
        gridY={tempCoords.gridY}
        onTableCreated={handleTableCreated}
      />
    </View>
  );
}

// 🎨 **Estilos Mejorados**
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
    fontSize: 11, // Tamaño más pequeño
    color: "#ff", // Color dorado
    fontWeight: "bold",
    position: "absolute",
    top: -60, // Ubicación sobre la mesa
    alignSelf: "center",
    textAlign: "center",
    minWidth: 60,
    paddingHorizontal: 5,
    letterSpacing: 0.5,
  },
  userText: {
    fontSize: 11,
    color: "#0049ff",
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
  draggable: {
    position: "absolute",
    bottom: 20,
    left: "50%",
    marginLeft: -20,
  },
  draggableContainer: {
    backgroundColor: "#3B82F6",
    padding: 10,
    borderRadius: 10,
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
  selectedTable: {
    borderWidth: 3,
    borderColor: "#3B82F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  detailsButton: {
    position: "absolute",
    top: -50,
    backgroundColor: "#3B82F6",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    minWidth: 100,
    left: -25,
  },
  detailsButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 5,
    fontSize: 14,
  },
});
