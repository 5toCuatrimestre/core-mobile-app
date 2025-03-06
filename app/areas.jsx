import React, { useRef, useState } from "react";
import {
  View,
  StyleSheet,
  PanResponder,
  Text,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";

export default function areas() {
  // Simulando mesas predefinidas (en un caso real vendrían de una API o base de datos)
  const [droppedItems, setDroppedItems] = useState([
    { id: 1, xPercent: 20, yPercent: 30, chairs: 4 },
    { id: 2, xPercent: 60, yPercent: 30, chairs: 6 },
    { id: 3, xPercent: 40, yPercent: 70, chairs: 2 },
    // Puedes agregar más mesas predefinidas según sea necesario
  ]);
  
  const canvasRef = useRef(null);
  const router = useRouter();
  let lastTap = 0;

  const handleDoubleClick = (item) => {
    const now = Date.now();
    if (now - lastTap < 300) {
      Alert.alert(
        "Información de la Mesa",
        `🆔 ID: ${item.id}\n📍 X: ${item.xPercent.toFixed(1)}% | Y: ${item.yPercent.toFixed(1)}%\n💺 Lugares: ${item.chairs}`,
        [
          { text: "Cancelar", style: "cancel" },
          { 
            text: "Crear Cuenta", 
            onPress: () => router.push("/CreateCount") // Navega a la vista CreateCount
          },
        ]
      );
    }
    lastTap = now;
  };

  const getItemPanResponder = (item) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // No hacemos nada al iniciar el toque, solo detectamos para el doble clic
      },
      onPanResponderMove: () => {
        // Las mesas ya no se pueden mover, así que no hacemos nada aquí
      },
      onPanResponderRelease: () => {
        handleDoubleClick(item);
      },
    });

  return (
    <View style={styles.container}>
      <View ref={canvasRef} style={styles.canvas}>
        {/* Mesas en el lienzo (ahora solo visualización) */}
        {droppedItems.map((item) => (
          <View
            key={item.id}
            {...getItemPanResponder(item).panHandlers}
            style={[
              styles.iconWrapper,
              { left: `${item.xPercent}%`, top: `${item.yPercent}%` },
            ]}
          >
            <View style={styles.table}>
              <Icon name="table-restaurant" size={30} color="white" />
              <View style={{ alignItems: "center", width: "100%" }}>
                <Text style={styles.chairsText}>{item.chairs}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// Estilos
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
    bottom: -32, 
    alignSelf: "center", 
    backgroundColor: "rgba(0, 0, 0, 0.6)", 
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
    minWidth: 28, 
    textAlign: "center", 
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
});