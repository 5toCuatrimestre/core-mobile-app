import React from "react";
import { View, Modal, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { createTable } from "../api/services/tableService";

const ChairsModal = ({ visible, chairs, setChairs, onCancel, positionSiteId, gridX, gridY, onTableCreated }) => {
  const [isCreating, setIsCreating] = React.useState(false);

  const handleConfirm = async () => {
    if (!chairs || chairs.trim() === '') {
      Alert.alert("Error", "Por favor ingresa un número de sillas");
      return;
    }

    setIsCreating(true);
    try {
      // Convertimos las coordenadas de la cuadrícula a decimales (0-1) para el servidor
      const xlocation = Math.max(0, Math.min(1, gridX / 100));
      const ylocation = Math.max(0, Math.min(1, gridY / 100));
      
      console.log("ChairsModal: Creando mesa con datos", { 
        name: `Mesa ${positionSiteId}`,
        capacity: parseInt(chairs, 10),
        xlocation,
        ylocation,
        positionSiteId
      });
      
      // Creamos la mesa en el servidor
      const response = await createTable({
        name: `Mesa ${positionSiteId}`,
        capacity: parseInt(chairs, 10),
        xlocation,
        ylocation,
        positionSiteId
      });
      
      console.log("ChairsModal: Respuesta del servidor", response);
      
      // Si la creación fue exitosa, notificamos al componente padre
      if (response && response.result) {
        console.log("ChairsModal: Mesa creada exitosamente", response.result);
        
        // Notificamos al componente padre que se creó una mesa
        if (onTableCreated) {
          onTableCreated({
            id: response.result.positionSiteId,
            gridX: gridX,
            gridY: gridY,
            chairs: parseInt(chairs, 10),
            waiter: null,
            status: true
          });
        }
        
        Alert.alert("Éxito", "Mesa creada correctamente");
        onCancel(); // Cerramos el modal
      } else {
        console.error("ChairsModal: Error en la respuesta del servidor", response);
        throw new Error("Error al crear la mesa en el servidor");
      }
    } catch (error) {
      console.error("ChairsModal: Error al crear la mesa", error);
      Alert.alert("Error", `Error al crear la mesa: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Modal transparent={true} visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Ingresa la cantidad de sillas</Text>
          <TextInput
            style={styles.input}
            placeholder="Número de sillas"
            keyboardType="numeric"
            value={chairs}
            onChangeText={setChairs}
            editable={!isCreating}
          />
          {isCreating ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#FF6363" />
              <Text style={styles.loadingText}>Creando mesa...</Text>
            </View>
          ) : (
            <View style={styles.buttonContainer}>
              <Button title="Confirmar" onPress={handleConfirm} />
              <Button title="Cancelar" onPress={onCancel} color="red" />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    textAlign: "center",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
});

export default ChairsModal;
