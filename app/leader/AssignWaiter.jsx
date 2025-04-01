import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function AssignWaiter() {
    const router = useRouter();
    const { tableId, previousScreen } = useLocalSearchParams();

    const [waiters, setWaiters] = useState([
        { id: 1, name: "Juan" },
        { id: 2, name: "Maria" },
        { id: 3, name: "Carlos" },
        { id: 4, name: "Ana" },
    ]);

    const [selectedWaiter, setSelectedWaiter] = useState(null);

    const handleAssign = (waiter) => {
        setSelectedWaiter(waiter);

        router.replace({
            pathname: previousScreen || "/leader/Space",
            params: { tableId, waiter: waiter.name }
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Selecciona un Mesero</Text>
            
            {selectedWaiter && (
                <View style={styles.overlay}>
                    <Text style={styles.overlayText}>Mesero: {selectedWaiter.name}</Text>
                </View>
            )}

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
    overlay: {
        position: "absolute",
        top: 10,
        left: "50%",
        transform: [{ translateX: -50 }],
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        padding: 10,
        borderRadius: 10,
    },
    overlayText: { color: "white", fontSize: 16, fontWeight: "bold" }
});
