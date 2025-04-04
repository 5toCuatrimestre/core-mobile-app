import React, { useRef, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  PanResponder,
  Text,
  Alert,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import ChairsModal from "../../../components/ChairsModal"; // 🔹 Importamos el modal externo
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { getAllTables, createTable, updateTable } from "../../../api/services/tableService"; // Importamos el servicio de mesas

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
  let lastTap = 0;
  let lastUpdateTime = 0; // Para controlar la frecuencia de actualizaciones

  // Función para cargar las mesas desde el servidor
  const loadTablesFromServer = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllTables();
      
      // Verificamos si la respuesta tiene el formato esperado
      if (response && response.result && Array.isArray(response.result)) {
        // Transformamos los datos del servidor al formato que espera nuestro componente
        const serverTables = response.result.map(table => ({
          id: table.positionSiteId,
          xPercent: table.xlocation * 100, // Convertimos de decimal a porcentaje
          yPercent: table.ylocation * 100, // Convertimos de decimal a porcentaje
          chairs: table.capacity,
          waiter: table.waiter || null, // Si existe un mesero asignado
          status: table.status
        }));
        
        // Actualizamos el contador de IDs para que no haya conflictos
        if (serverTables.length > 0) {
          idCounterRef.current = Math.max(...serverTables.map(t => t.id)) + 1;
        }
        
        setDroppedItems(serverTables);
      } else {
        throw new Error("Formato de respuesta inválido");
      }
    } catch (error) {
      console.error("Error al cargar las mesas:", error);
      setError("No se pudieron cargar las mesas. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Cargamos las mesas al montar el componente
  useEffect(() => {
    loadTablesFromServer();
  }, []);

  const handleDoubleClick = (item) => {
    const now = Date.now();
    if (now - lastTap < 300) {
        router.push({
            pathname: "/leader/AssignWaiter",
            params: {
                id: item.id,
                x: item.xPercent.toFixed(1),
                y: item.yPercent.toFixed(1),
                chairs: item.chairs
            }
        });
    }
    lastTap = now;
};

  const assignWaiter = (waiterName, tableId) => {
    setDroppedItems((prevItems) => 
      prevItems.map((item) =>
        item.id === tableId ? { ...item, waiter: waiterName } : item
      )
    );
  };

  const addTableWithChairs = (xPercent, yPercent) => {
    setCurrentItem({ id: idCounterRef.current, xPercent, yPercent });
    setShowModal(true);
  };

  const confirmTable = async () => {
    if (!chairs || isNaN(chairs) || chairs <= 0) {
      Alert.alert("Error", "Ingresa una cantidad válida de sillas.");
      return;
    }

    try {
      setIsCreating(true);
      
      // Convertimos las coordenadas de porcentaje a decimal (0-1)
      const xlocation = currentItem.xPercent / 100;
      const ylocation = currentItem.yPercent / 100;
      
      // Creamos la mesa en el servidor
      const response = await createTable({
        capacity: parseInt(chairs),
        xlocation,
        ylocation
      });
      
      // Si la creación fue exitosa, actualizamos el estado local
      if (response && response.result) {
        const newTable = {
          id: response.result.positionSiteId,
          xPercent: currentItem.xPercent,
          yPercent: currentItem.yPercent,
          chairs: parseInt(chairs),
          status: response.result.status
        };
        
        setDroppedItems((prevItems) => [...prevItems, newTable]);
        
        // Actualizamos el contador de IDs
        idCounterRef.current = Math.max(idCounterRef.current, response.result.positionSiteId) + 1;
        
        // Cerramos el modal y limpiamos el estado
        setShowModal(false);
        setChairs("");
      } else {
        throw new Error("Error al crear la mesa en el servidor");
      }
    } catch (error) {
      console.error("Error al crear la mesa:", error);
      Alert.alert("Error", "No se pudo crear la mesa. Por favor, inténtalo de nuevo.");
    } finally {
      setIsCreating(false);
    }
  };

  // Función para actualizar la posición de una mesa en el servidor
  const updateTablePosition = async (tableId, xPercent, yPercent, chairs) => {
    try {
      // Convertimos las coordenadas de porcentaje a decimal (0-1)
      const xlocation = xPercent / 100;
      const ylocation = yPercent / 100;
      
      // Actualizamos la mesa en el servidor
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
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        canvasRef.current.measure((fx, fy, width, height, px, py) => {
          const xPercent = ((gesture.moveX - px) / width) * 100;
          const yPercent = ((gesture.moveY - py) / height) * 100;
          setDraggingItem({ xPercent, yPercent });
        });
      },
      onPanResponderRelease: (_, gesture) => {
        canvasRef.current.measure((fx, fy, width, height, px, py) => {
          let xPercent = ((gesture.moveX - px) / width) * 100;
          let yPercent = ((gesture.moveY - py) / height) * 100;

          if (
            xPercent >= 0 &&
            xPercent <= 100 &&
            yPercent >= 0 &&
            yPercent <= 100
          ) {
            addTableWithChairs(xPercent, yPercent);
          }
        });

        setDraggingItem(null);
      },
    })
  ).current;

  const getItemPanResponder = (item) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        canvasRef.current.measure((fx, fy, width, height, px, py) => {
          let xPercent = ((gesture.moveX - px) / width) * 100;
          let yPercent = ((gesture.moveY - py) / height) * 100;
          const alignedPosition = getAlignedPosition(
            { xPercent, yPercent },
            item.id
          );
          setDroppedItems((prevItems) =>
            prevItems.map((prevItem) =>
              prevItem.id === item.id
                ? {
                    ...prevItem,
                    xPercent: alignedPosition.x,
                    yPercent: alignedPosition.y,
                  }
                : prevItem
            )
          );
        });
      },
      onPanResponderRelease: (_, gesture) => {
        // Obtenemos la posición final de la mesa
        canvasRef.current.measure((fx, fy, width, height, px, py) => {
          let xPercent = ((gesture.moveX - px) / width) * 100;
          let yPercent = ((gesture.moveY - py) / height) * 100;
          const alignedPosition = getAlignedPosition(
            { xPercent, yPercent },
            item.id
          );
          
          // Actualizamos la mesa en el servidor
          const now = Date.now();
          // Limitamos la frecuencia de actualizaciones a una cada 500ms
          if (now - lastUpdateTime > 500) {
            lastUpdateTime = now;
            updateTablePosition(item.id, alignedPosition.x, alignedPosition.y, item.chairs);
          }
        });
        
        // Manejamos el doble clic para asignar mesero
        handleDoubleClick(item);
      },
    });

  const getAlignedPosition = (current, movingId = null) => {
    let alignedX = current.xPercent;
    let alignedY = current.yPercent;

    droppedItems.forEach((item) => {
      if (movingId !== null && item.id === movingId) return;

      if (Math.abs(item.yPercent - current.yPercent) <= ALIGNMENT_THRESHOLD) {
        alignedY = item.yPercent;
      }

      if (Math.abs(item.xPercent - current.xPercent) <= ALIGNMENT_THRESHOLD) {
        alignedX = item.xPercent;
      }
    });

    return { x: alignedX, y: alignedY };
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
                left: `${draggingItem.xPercent}%`,
                top: `${draggingItem.yPercent}%`,
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
            style={[styles.iconWrapper, { left: `${item.xPercent}%`, top: `${item.yPercent}%` }]}>
            <View style={[styles.table, item.status ? styles.activeTable : styles.inactiveTable]}>
              <Icon name="table-restaurant" size={30} color="white" />
              <View style={{ alignItems: "center", width: "100%" }}>
                <Text style={styles.chairsText}>{item.chairs}</Text>
                {/* Mostrar nombre del mesero sin sombreado y por encima de la mesa */}
                {item.waiter && (
                  <Text style={styles.waiterText}>{item.waiter}</Text>
                )}
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Modal para ingresar la cantidad de sillas */}
      <ChairsModal
        visible={showModal}
        chairs={chairs}
        setChairs={setChairs}
        confirmTable={confirmTable}
        isCreating={isCreating}
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
});
