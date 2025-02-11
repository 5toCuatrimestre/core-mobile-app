import React from "react";
import { View, Modal, Text, TextInput, Button, StyleSheet } from "react-native";

const ChairsModal = ({ visible, chairs, setChairs, confirmTable }) => {
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
          />
          <Button title="Confirmar" onPress={confirmTable} />
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
});

export default ChairsModal;
