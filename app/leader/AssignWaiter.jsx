import React, { useState, useEffect, useLayoutEffect } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Modal,
  ActivityIndicator
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";

export default function AssignWaiter() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({ title: "Asignar mesero" });
  }, []); 
  
  const { tableId, chairs, x, y, currentWaiter, previousScreen } = params;
  
  const [waiters, setWaiters] = useState([
        { id: 1, name: "Juan" },
        { id: 2, name: "Maria" },
        { id: 3, name: "Carlos" },
        { id: 4, name: "Ana" },
    ]);

    const [selectedWaiter, setSelectedWaiter] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const handleAssign = (waiter) => {
        setSelectedWaiter(waiter);
        setModalVisible(true);

        setTimeout(() => {
            setModalVisible(false);
            router.replace({
                pathname: previousScreen || "/leader/Space",
                params: { tableId, waiter: waiter.name }
            });
        }, 3000);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Selecciona un Mesero</Text>
            <FlatList
                data={waiters}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity 
                        style={[styles.item, selectedWaiter?.id === item.id && styles.selectedItem]}
                        onPress={() => handleAssign(item)}
                    >
                        <Text style={styles.waiterName}>{item.name}</Text>
                    </TouchableOpacity>
                )}
            />

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
                        <Text style={styles.modalText}>Mesero asignado: {selectedWaiter?.name}</Text>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#fff" },
    title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
    item: {
        padding: 15,
        marginVertical: 5,
        backgroundColor: "#FF6363",
        borderRadius: 10,
        alignItems: "center"
    },
    selectedItem: { backgroundColor: "#27AE60" },
    waiterName: { fontSize: 18, color: "white", fontWeight: "bold" },
    backButton: {
        marginTop: 20,
        padding: 10,
        backgroundColor: "#555",
        borderRadius: 10,
        alignItems: "center"
    },
    backText: { color: "white", fontSize: 16 },
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
        alignItems: "center"
    },
    modalText: { fontSize: 18, fontWeight: "bold", color: "black" }
});