import React, { useState, useEffect, useLayoutEffect, useContext } from "react";
import { 
  View, 
  Text, 
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  FlatList,   
  RefreshControl,
  ToastAndroid
} from "react-native";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons";
import { getAvailableWaiters, assignWaiterToTable } from "../../api/services/waiterService";
import { getTableUser, getUserDetails, assignUserToTable, updateTableUser } from "../../api/services/tableService";
import { StyleContext } from "../../utils/StyleContext";

export default function AssignWaiter() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { tableId, chairs, x, y, currentWaiter, previousScreen } = params;
  const { style } = useContext(StyleContext);

  // Configurar el título del header
  useLayoutEffect(() => {
    router.setParams({ title: "Asignar mesero" });
  }, []);

  const [waiters, setWaiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [tableUser, setTableUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Cargar meseros disponibles y verificar si hay un usuario asignado
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar meseros disponibles
      const waitersResponse = await getAvailableWaiters();
      if (waitersResponse && waitersResponse.result) {
        setWaiters(waitersResponse.result);
      } else {
        throw new Error("No se pudieron cargar los meseros disponibles");
      }
      
      // Verificar si hay un usuario asignado a la mesa
      try {
        const tableUserResponse = await getTableUser(params.tableId);
        if (tableUserResponse && tableUserResponse.result && tableUserResponse.result.length > 0) {
          // Guardar el objeto completo de la asignación, incluyendo el ID
          setTableUser(tableUserResponse.result[0]);
          console.log("Usuario asignado a la mesa:", tableUserResponse.result[0]);
          
          // Obtener detalles del usuario
          const userDetailsResponse = await getUserDetails(tableUserResponse.result[0].userId);
          if (userDetailsResponse && userDetailsResponse.result) {
            setUserDetails(userDetailsResponse.result);
          }
        } else {
          // No hay usuario asignado, establecer tableUser como null
          setTableUser(null);
          setUserDetails(null);
        }
      } catch (error) {
        console.log("No hay usuario asignado a esta mesa:", error);
        // No es un error, simplemente no hay usuario asignado
        setTableUser(null);
        setUserDetails(null);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setError("Error al cargar los datos. Por favor, inténtalo de nuevo.");
      ToastAndroid.show("Error al cargar los datos", ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [params.tableId]);

  // Función para actualizar los datos
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Filtrar meseros según la búsqueda
  const filteredWaiters = waiters.filter((waiter) =>
    waiter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    waiter.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Asignar mesero a la mesa
  const handleAssignWaiter = async (waiter) => {
    try {
      setIsAssigning(true);
      
      // Usar el userId del mesero en lugar de id
      const userId = waiter.userId;
      
      if (!userId) {
        throw new Error("El mesero seleccionado no tiene un ID válido");
      }
      
      console.log(`Asignando mesero con ID ${userId} a la mesa ${params.tableId}`);
      
      // Si ya hay un usuario asignado, actualizar en lugar de crear uno nuevo
      if (tableUser && tableUser.id) {
        console.log(`Actualizando asignación existente con ID ${tableUser.id}`);
        const response = await updateTableUser(tableUser.id, 1, params.tableId, userId);
        
        if (response && response.type === "SUCCESS") {
          ToastAndroid.show(`Mesero ${waiter.name} asignado correctamente`, ToastAndroid.SHORT);
          router.back();
        } else {
          throw new Error("Error al actualizar el mesero asignado a la mesa");
        }
      } else {
        // Asignar mesero a la mesa (crear nueva asignación)
        const response = await assignWaiterToTable(params.tableId, userId);
        
        if (response && response.type === "SUCCESS") {
          ToastAndroid.show(`Mesero ${waiter.name} asignado correctamente`, ToastAndroid.SHORT);
          router.back();
        } else {
          throw new Error("Error al asignar el mesero a la mesa");
        }
      }
    } catch (error) {
      console.error("Error al asignar mesero:", error);
      ToastAndroid.show("No se pudo asignar el mesero a la mesa", ToastAndroid.SHORT);
    } finally {
      setIsAssigning(false);
    }
  };

  // Asignar usuario a la mesa
  const handleAssignUser = async (waiter) => {
    try {
      setIsAssigning(true);
      
      // Usar el userId del usuario en lugar de id
      const userId = waiter.userId;
      
      if (!userId) {
        throw new Error("El usuario seleccionado no tiene un ID válido");
      }
      
      console.log(`Asignando usuario con ID ${userId} a la mesa ${params.tableId}`);
      
      // Si ya hay un usuario asignado, actualizar en lugar de crear uno nuevo
      if (tableUser && tableUser.id) {
        console.log(`Actualizando asignación existente con ID ${tableUser.id}`);
        const response = await updateTableUser(tableUser.id, 1, params.tableId, userId);
        
        if (response && response.type === "SUCCESS") {
          ToastAndroid.show(`Usuario ${waiter.name} asignado correctamente`, ToastAndroid.SHORT);
          router.back();
        } else {
          throw new Error("Error al actualizar el usuario asignado a la mesa");
        }
      } else {
        // Asignar usuario a la mesa (usando routeId=1 como ejemplo)
        const response = await assignUserToTable(1, params.tableId, userId);
        
        if (response && response.type === "SUCCESS") {
          ToastAndroid.show(`Usuario ${waiter.name} asignado correctamente`, ToastAndroid.SHORT);
          router.back();
        } else {
          throw new Error("Error al asignar el usuario a la mesa");
        }
      }
    } catch (error) {
      console.error("Error al asignar usuario:", error);
      ToastAndroid.show("No se pudo asignar el usuario a la mesa", ToastAndroid.SHORT);
    } finally {
      setIsAssigning(false);
    }
  };

  // Renderizar un elemento de mesero
  const renderWaiterItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.waiterItem, { backgroundColor: style.BgCard, borderColor: style.H3 }]}
      onPress={() => handleAssignWaiter(item)}
      disabled={isAssigning}
    >
      <View style={styles.waiterInfo}>
        <Text style={[styles.waiterName, { color: style.H1 }]}>
          {item.name}
        </Text>
        <Text style={[styles.waiterEmail, { color: style.H3 }]}>{item.email}</Text>
      </View>
      <Icon name="person-add" size={24} color={style.H1} />
    </TouchableOpacity>
  );

  // Renderizar un mensaje cuando no hay resultados
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Icon name="search-off" size={48} color={style.H3} />
      <Text style={[styles.emptyText, { color: style.H3 }]}>
        No se encontraron meseros con ese nombre.
      </Text>
    </View>
  );

  return (
    <>
      <Stack.Screen 
        options={{
          title: "Asignar mesero",
          headerTitleStyle: { fontWeight: "bold" }
        }}
      />
      <View style={[styles.container, { backgroundColor: style.BgInterface }]}>
        <View style={[styles.tableInfo, { backgroundColor: style.BgCard }]}>
          <Text style={[styles.tableInfoText, { color: style.H1 }]}>
            Mesa #{params.tableId} - {params.chairs} sillas
          </Text>
          <Text style={[styles.coordinatesText, { color: style.H3 }]}>
            Posición: ({params.x}, {params.y})
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={[styles.loadingText, { color: style.H1 }]}>Cargando meseros disponibles...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: style.H1 }]}>{error}</Text>
            <TouchableOpacity 
              style={[styles.retryButton, { backgroundColor: style.H1 }]}
              onPress={() => router.back()}
            >
              <Text style={[styles.retryButtonText, { color: style.H1 }]}>Volver</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Información del usuario asignado */}
            {tableUser ? (
              <View style={[styles.userInfoContainer, { backgroundColor: style.BgCard }]}>
                <Text style={[styles.userInfoTitle, { color: style.H1 }]}>Usuario Asignado</Text>
                <View style={[styles.userInfoCard, { backgroundColor: style.BgInterface }]}>
                  <Text style={[styles.userName, { color: style.H1 }]}>
                    {userDetails ? userDetails.name : "Cargando..."}
                  </Text>
                  <Text style={[styles.userEmail, { color: style.H3 }]}>
                    {userDetails ? userDetails.email : ""}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={[styles.userInfoContainer, { backgroundColor: style.BgCard }]}>
                <Text style={[styles.userInfoTitle, { color: style.H1 }]}>Asignar Usuario</Text>
                <View style={[styles.userInfoCard, { backgroundColor: style.BgInterface }]}>
                  <Text style={[styles.noUserText, { color: style.H3 }]}>
                    No hay usuario asignado a esta mesa.
                  </Text>
                </View>
              </View>
            )}

            {/* Buscador */}
            <View className="mt-5" style={[styles.searchContainer, { backgroundColor: style.BgCard, borderColor: style.H3 }]}>
              <Icon name="search" size={20} color={style.H3} style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, { color: style.P }]}
                placeholder="Buscar mesero..."
                placeholderTextColor={style.H3}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Lista de meseros */}
            <View className="mt-2 mb-2"  style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, { color: style.H1 }]}>Meseros Disponibles</Text>
              {waiters.length > 0 ? (
                <FlatList
                  data={filteredWaiters}
                  renderItem={renderWaiterItem}
                  keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
                  ListEmptyComponent={renderEmptyList}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                      colors={[style.H1]}
                    />
                  }
                  contentContainerStyle={styles.listContent}
                />
              ) : (
                <View style={styles.emptyContainer}>
                  <Icon name="people" size={48} color={style.H3} />
                  <Text style={[styles.emptyText, { color: style.H3 }]}>
                    No hay meseros disponibles en este momento.
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
        
        {isAssigning && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  tableInfo: {
    padding: 16,
    marginBottom: 8,
  },
  tableInfoText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  coordinatesText: {
    fontSize: 14,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  sectionContainer: {
    flex: 1,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  waiterItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  waiterInfo: {
    flex: 1,
  },
  waiterName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  waiterEmail: {
    fontSize: 14,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
  },
  userInfoContainer: {
    padding: 16,
    marginBottom: 8,
  },
  userInfoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  userInfoCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  userEmail: {
    fontSize: 14,
    marginTop: 4,
  },
  noUserText: {
    fontSize: 16,
    marginBottom: 16,
  },
  changeUserButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 16,
    alignSelf: "flex-start",
  },
  changeUserButtonText: {
    fontWeight: "bold",
  },
});