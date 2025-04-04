import React, { useState, useEffect } from "react";
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
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons";
import { getAvailableWaiters, assignWaiterToTable } from "../../api/services/waiterService";
import { getTableUser, getUserDetails, assignUserToTable, updateTableUser } from "../../api/services/tableService";

export default function AssignWaiter() {
  const router = useRouter();
  const params = useLocalSearchParams();
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
          Alert.alert(
            "Éxito",
            `Mesero ${waiter.name} ${waiter.lastName} asignado a la mesa correctamente.`,
            [{ text: "OK", onPress: () => router.back() }]
          );
        } else {
          throw new Error("Error al actualizar el mesero asignado a la mesa");
        }
      } else {
        // Asignar mesero a la mesa (crear nueva asignación)
        const response = await assignWaiterToTable(params.tableId, userId);
        
        if (response && response.type === "SUCCESS") {
          Alert.alert(
            "Éxito",
            `Mesero ${waiter.name} ${waiter.lastName} asignado a la mesa correctamente.`,
            [{ text: "OK", onPress: () => router.back() }]
          );
        } else {
          throw new Error("Error al asignar el mesero a la mesa");
        }
      }
    } catch (error) {
      console.error("Error al asignar mesero:", error);
      Alert.alert("Error", "No se pudo asignar el mesero a la mesa. Por favor, inténtalo de nuevo.");
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
          Alert.alert(
            "Éxito",
            `Usuario ${waiter.name} ${waiter.lastName} asignado a la mesa correctamente.`,
            [{ text: "OK", onPress: () => router.back() }]
          );
        } else {
          throw new Error("Error al actualizar el usuario asignado a la mesa");
        }
      } else {
        // Asignar usuario a la mesa (usando routeId=1 como ejemplo)
        const response = await assignUserToTable(1, params.tableId, userId);
        
        if (response && response.type === "SUCCESS") {
          Alert.alert(
            "Éxito",
            `Usuario ${waiter.name} ${waiter.lastName} asignado a la mesa correctamente.`,
            [{ text: "OK", onPress: () => router.back() }]
          );
        } else {
          throw new Error("Error al asignar el usuario a la mesa");
        }
      }
    } catch (error) {
      console.error("Error al asignar usuario:", error);
      Alert.alert("Error", "No se pudo asignar el usuario a la mesa. Por favor, inténtalo de nuevo.");
    } finally {
      setIsAssigning(false);
    }
  };

  // Renderizar un elemento de mesero
  const renderWaiterItem = ({ item }) => (
    <TouchableOpacity
      style={styles.waiterItem}
      onPress={() => handleAssignWaiter(item)}
      disabled={isAssigning}
    >
      <View style={styles.waiterInfo}>
        <Text style={styles.waiterName}>
          {item.name} {item.lastName}
        </Text>
        <Text style={styles.waiterEmail}>{item.email}</Text>
      </View>
      <Icon name="person-add" size={24} color="#FF6363" />
    </TouchableOpacity>
  );

  // Renderizar un mensaje cuando no hay resultados
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Icon name="search-off" size={48} color="#ccc" />
      <Text style={styles.emptyText}>
        No se encontraron meseros con ese nombre.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>

      <View style={styles.tableInfo}>
        <Text style={styles.tableInfoText}>
          Mesa #{params.tableId} - {params.chairs} sillas
        </Text>
        <Text style={styles.coordinatesText}>
          Posición: ({params.x}, {params.y})
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6363" />
          <Text style={styles.loadingText}>Cargando meseros disponibles...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.retryButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Información del usuario asignado */}
          {tableUser ? (
            <View style={styles.userInfoContainer}>
              <Text style={styles.userInfoTitle}>Usuario Asignado</Text>
              <View style={styles.userInfoCard}>
                <Text style={styles.userName}>
                  {userDetails ? userDetails.name : "Cargando..."}
                </Text>
                <Text style={styles.userEmail}>
                  {userDetails ? userDetails.email : ""}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.userInfoContainer}>
              <Text style={styles.userInfoTitle}>Asignar Usuario</Text>
              <View style={styles.userInfoCard}>
                <Text style={styles.noUserText}>
                  No hay usuario asignado a esta mesa.
                </Text>
              </View>
            </View>
          )}

          {/* Buscador */}
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar mesero..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Lista de meseros */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Meseros Disponibles</Text>
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
                    colors={["#FF6363"]}
                  />
                }
                contentContainerStyle={styles.listContent}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Icon name="people" size={48} color="#ccc" />
                <Text style={styles.emptyText}>
                  No hay meseros disponibles en este momento.
                </Text>
              </View>
            )}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  tableInfo: {
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  tableInfoText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  coordinatesText: {
    fontSize: 14,
    color: "#666",
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
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#FF0000",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#FF6363",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
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
    color: "#333",
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
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  waiterInfo: {
    flex: 1,
  },
  waiterName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  waiterEmail: {
    fontSize: 14,
    color: "#666",
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
    color: "#666",
    textAlign: "center",
    marginTop: 16,
  },
  userInfoContainer: {
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  userInfoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  userInfoCard: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  noUserText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  changeUserButton: {
    backgroundColor: "#FF6363",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 16,
    alignSelf: "flex-start",
  },
  changeUserButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});