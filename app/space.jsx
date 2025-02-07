import React, { useRef, useState } from "react";
import { View, StyleSheet, Animated, PanResponder, Text, Dimensions } from "react-native";

export default function Space() {
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;
  const [droppedItems, setDroppedItems] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef(null);

  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsDragging(true);
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gesture) => {
        canvasRef.current.measure((fx, fy, width, height, px, py) => {
          // Convertimos las coordenadas a porcentaje del tamaño del lienzo
          const percentX = ((gesture.moveX - px) / width) * 100;
          const percentY = ((gesture.moveY - py) / height) * 100;

          // Validamos que el objeto quede dentro del lienzo
          if (percentX >= 0 && percentX <= 100 && percentY >= 0 && percentY <= 100) {
            setDroppedItems((prevItems) => [
              ...prevItems,
              { xPercent: percentX, yPercent: percentY, id: Date.now() },
            ]);
          }

          pan.setValue({ x: 0, y: 0 });
          setIsDragging(false);
        });
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      {/* Header con instrucciones */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Arrastra y suelta los objetos en el lienzo</Text>

        {/* Cuadrado Azul Centrado */}
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.draggable,
            { transform: pan.getTranslateTransform(), zIndex: isDragging ? 1000 : 1 },
          ]}
        />
      </View>

      {/* Lienzo */}
      <View ref={canvasRef} style={styles.canvas}>
        {droppedItems.map((item) => (
          <View
            key={item.id}
            style={[
              styles.square,
              { left: `${item.xPercent}%`, top: `${item.yPercent}%` },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

// 🎨 Estilos con el cuadrado azul centrado
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 120,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: 20,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10, // Espacio para el cuadrado azul
  },
  canvas: {
    flex: 1,
    backgroundColor: "#ddd",
    position: "relative",
    borderWidth: 2,
    borderColor: "gray",
  },
  square: {
    width: 50,
    height: 50,
    backgroundColor: "red",
    position: "absolute",
    borderRadius: 5,
  },
  draggable: {
    width: 50,
    height: 50,
    backgroundColor: "blue",
    position: "absolute",
    top: 80, // 📌 Lo colocamos debajo del texto
    left: "50%", // 📌 Lo centramos horizontalmente
    marginLeft: -25, // 📌 Ajuste para centrarlo bien
    borderRadius: 5,
  },
});
