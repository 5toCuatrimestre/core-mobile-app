import React from "react";
import { View, Modal, Text, TextInput, Button, StyleSheet, ActivityIndicator } from "react-native";

const ChairsModal = ({ visible, chairs, setChairs, confirmTable, isCreating = false }) => {
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
            <Button title="Confirmar" onPress={confirmTable} />
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
});

export default ChairsModal;
