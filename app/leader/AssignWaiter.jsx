import React, { useState, useEffect, useLayoutEffect } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Modal,
  ActivityIndicator,
  Alert
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { getWaiters, assignWaiterToTable } from "../../api/services/waiterService";

export default function AssignWaiter() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({ title: "Asignar mesero" });
  }, []); 
  
  const { tableId, chairs, x, y, currentWaiter, previousScreen } = params;
  
  const [waiters, setWaiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWaiter, setSelectedWaiter] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [assigning, setAssigning] = useState(false);

  // Cargar meseros disponibles
  useEffect(() => {
    loadWaiters();
  }, []);

  const loadWaiters = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getWaiters();
      
      if (response && response.type === "SUCCESS" && Array.isArray(response.result)) {
        setWaiters(response.result);
      } else {
        throw new Error("Formato de respuesta inválido");
      }
    } catch (error) {
      console.error("Error al cargar meseros:", error);
      setError("Error al cargar meseros. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (waiter) => {
    try {
      setAssigning(true);
      setSelectedWaiter(waiter);
      
      // Asignar mesero a la mesa
      const response = await assignWaiterToTable(tableId, waiter.userId);
      
      if (response && response.type === "SUCCESS") {
        setModalVisible(true);
        
        // Esperar 2 segundos antes de volver a la pantalla anterior
        setTimeout(() => {
          setModalVisible(false);
          router.replace({
            pathname: previousScreen || "/leader/(tabs)/space",
            params: { 
              tableId, 
              waiter: waiter.name,
              waiterEmail: waiter.email
            }
          });
        }, 2000);
      } else {
        throw new Error("Error al asignar mesero");
      }
    } catch (error) {
      console.error("Error al asignar mesero:", error);
      Alert.alert(
        "Error",
        "No se pudo asignar el mesero. Por favor, inténtalo de nuevo.",
        [{ text: "OK" }]
      );
    } finally {
      setAssigning(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecciona un Mesero</Text>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6363" />
          <Text style={styles.loadingText}>Cargando meseros...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadWaiters}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={waiters}
          keyExtractor={(item) => item.userId.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.item, selectedWaiter?.userId === item.userId && styles.selectedItem]}
              onPress={() => handleAssign(item)}
              disabled={assigning}
            >
              <View style={styles.waiterInfo}>
                <Text style={styles.waiterName}>{item.name} {item.lastName}</Text>
                <Text style={styles.waiterEmail}>{item.email}</Text>
              </View>
              {assigning && selectedWaiter?.userId === item.userId && (
                <ActivityIndicator size="small" color="white" />
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay meseros disponibles</Text>
          }
        />
      )}

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>Volver</Text>
      </TouchableOpacity>

      {/* Modal de Notificación */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Icon name="check-circle" size={50} color="#27AE60" />
            <Text style={styles.modalText}>Mesero asignado: {selectedWaiter?.name}</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: "#fff" 
  },
  title: { 
    fontSize: 22, 
    fontWeight: "bold", 
    textAlign: "center", 
    marginBottom: 20 
  },
  item: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: "#FF6363",
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  selectedItem: { 
    backgroundColor: "#27AE60" 
  },
  waiterInfo: {
    flex: 1
  },
  waiterName: { 
    fontSize: 18, 
    color: "white", 
    fontWeight: "bold" 
  },
  waiterEmail: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2
  },
  backButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#555",
    borderRadius: 10,
    alignItems: "center"
  },
  backText: { 
    color: "white", 
    fontSize: 16 
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)"
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    width: "80%"
  },
  modalText: { 
    fontSize: 18, 
    fontWeight: "bold", 
    color: "black",
    marginTop: 10,
    textAlign: "center"
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333"
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20
  },
  errorText: {
    fontSize: 16,
    color: "#FF0000",
    textAlign: "center",
    marginBottom: 10
  },
  retryButton: {
    padding: 10,
    backgroundColor: "#3B82F6",
    borderRadius: 5
  },
  retryText: {
    color: "white",
    fontSize: 14
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 20
  }
});