import React, { useContext } from "react";
import { View, Modal, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import { createTable } from "../api/services/tableService";
import { StyleContext } from "../utils/StyleContext"; // Importamos el contexto de estilos

const ChairsModal = ({ visible, chairs, setChairs, onCancel, positionSiteId, gridX, gridY, onTableCreated }) => {
  const [isCreating, setIsCreating] = React.useState(false);
  const { style } = useContext(StyleContext); // Obtenemos los estilos globales

  const handleConfirm = async () => {
    if (!chairs || chairs.trim() === '') {
      Alert.alert("Error", "Por favor ingresa un número de sillas");
      return;
    }

    // Verificar si contiene comas o puntos decimales
    if (chairs.includes(',') || chairs.includes('.')) {
      Alert.alert("Error", "El número de sillas debe ser un número entero");
      return;
    }

    const numChairs = parseInt(chairs, 10);
    if (numChairs <= 0) {
      Alert.alert("Error", "El número de sillas debe ser mayor que cero");
      return;
    }

    if (numChairs > 20) {
      Alert.alert("Error", "El número máximo de sillas permitido es 20");
      return;
    }

    setIsCreating(true);
    try {
      // Convertimos las coordenadas de la cuadrícula a decimales (0-1) para el servidor
      const xlocation = Math.max(0, Math.min(1, gridX / 100));
      const ylocation = Math.max(0, Math.min(1, gridY / 100));
      
      console.log("ChairsModal: Creando mesa con datos", { 
        name: `Mesa ${positionSiteId}`,
        capacity: numChairs,
        xlocation,
        ylocation,
        positionSiteId
      });
      
      // Creamos la mesa en el servidor
      const response = await createTable({
        name: `Mesa ${positionSiteId}`,
        capacity: numChairs,
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
        <View style={[styles.modalContent, { backgroundColor: style.BgCard }]}>
          <Text style={[styles.modalTitle, { color: style.H1 }]}>Ingresa la cantidad de sillas</Text>
          <TextInput
            style={[styles.input, { 
              borderColor: style.H3,
              color: style.H1,
              backgroundColor: style.BgInterface
            }]}
            placeholder="Número de sillas"
            placeholderTextColor={style.H3}
            keyboardType="number-pad"
            value={chairs}
            onChangeText={(text) => {
              // Solo permitir números enteros
              const filteredText = text.replace(/[^0-9]/g, '');
              setChairs(filteredText);
            }}
            editable={!isCreating}
          />
          {isCreating ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={style.H1} />
              <Text style={[styles.loadingText, { color: style.H1 }]}>Creando mesa...</Text>
            </View>
          ) : (
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton, { backgroundColor: "#FF0000" }]} 
                onPress={onCancel}
              >
                <Text style={[styles.buttonText, { color: style.H1 }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.confirmButton, { backgroundColor: "#3B82F6" }]} 
                onPress={handleConfirm}
              >
                <Text style={[styles.buttonText, { color: style.H1 }]}>Confirmar</Text>
              </TouchableOpacity>
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
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
    paddingHorizontal: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    minWidth: 120,
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default ChairsModal;
