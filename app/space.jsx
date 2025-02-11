import React, { useRef, useState } from "react";
import {
  View,
  StyleSheet,
  PanResponder,
  Text,
  Animated,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import ChairsModal from "../components/ChairsModal"; // 🔹 Importamos el modal externo

export default function Space() {
  const [droppedItems, setDroppedItems] = useState([]);
  const [draggingItem, setDraggingItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [chairs, setChairs] = useState("");
  const canvasRef = useRef(null);
  const idCounterRef = useRef(1);
  const ALIGNMENT_THRESHOLD = 5;
  let lastTap = 0;

  const handleDoubleClick = (item) => {
    const now = Date.now();
    if (now - lastTap < 300) {
      Alert.alert(
        "Información de la Mesa",
        `🆔 ID: ${item.id}\n📍 X: ${item.xPercent.toFixed(
          1
        )}% | Y: ${item.yPercent.toFixed(1)}%\n💺 Lugares: ${item.chairs}`
      );
    }
    lastTap = now;
  };

  const addTableWithChairs = (xPercent, yPercent) => {
    setCurrentItem({ id: idCounterRef.current, xPercent, yPercent });
    setShowModal(true);
  };

  const confirmTable = () => {
    if (!chairs || isNaN(chairs) || chairs <= 0) {
      Alert.alert("Error", "Ingresa una cantidad válida de sillas.");
      return;
    }

    setDroppedItems((prevItems) => [
      ...prevItems,
      {
        ...currentItem,
        id: idCounterRef.current++,
        chairs: chairs,
      },
    ]);

    setShowModal(false);
    setChairs("");
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        canvasRef.current.measure((fx, fy, width, height, px, py) => {
          const xPercent = ((gesture.moveX - px) / width) * 100;
          const yPercent = ((gesture.moveY - py) / height) * 100;
          setDraggingItem({ xPercent, yPercent });
        });
      },
      onPanResponderRelease: (_, gesture) => {
        canvasRef.current.measure((fx, fy, width, height, px, py) => {
          let xPercent = ((gesture.moveX - px) / width) * 100;
          let yPercent = ((gesture.moveY - py) / height) * 100;

          if (
            xPercent >= 0 &&
            xPercent <= 100 &&
            yPercent >= 0 &&
            yPercent <= 100
          ) {
            addTableWithChairs(xPercent, yPercent);
          }
        });

        setDraggingItem(null);
      },
    })
  ).current;

  const getItemPanResponder = (item) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        canvasRef.current.measure((fx, fy, width, height, px, py) => {
          let xPercent = ((gesture.moveX - px) / width) * 100;
          let yPercent = ((gesture.moveY - py) / height) * 100;
          const alignedPosition = getAlignedPosition(
            { xPercent, yPercent },
            item.id
          );
          setDroppedItems((prevItems) =>
            prevItems.map((prevItem) =>
              prevItem.id === item.id
                ? {
                    ...prevItem,
                    xPercent: alignedPosition.x,
                    yPercent: alignedPosition.y,
                  }
                : prevItem
            )
          );
        });
      },
      onPanResponderRelease: () => {
        handleDoubleClick(item);
      },
    });

  const getAlignedPosition = (current, movingId = null) => {
    let alignedX = current.xPercent;
    let alignedY = current.yPercent;

    droppedItems.forEach((item) => {
      if (movingId !== null && item.id === movingId) return;

      if (Math.abs(item.yPercent - current.yPercent) <= ALIGNMENT_THRESHOLD) {
        alignedY = item.yPercent;
      }

      if (Math.abs(item.xPercent - current.xPercent) <= ALIGNMENT_THRESHOLD) {
        alignedX = item.xPercent;
      }
    });

    return { x: alignedX, y: alignedY };
  };

  return (
    <View style={styles.container}>
      <View ref={canvasRef} style={styles.canvas}>
        {/* Ícono de mesa mientras se arrastra dentro del lienzo */}
        {draggingItem && (
          <View
            style={[
              styles.iconWrapper,
              {
                left: `${draggingItem.xPercent}%`,
                top: `${draggingItem.yPercent}%`,
              },
            ]}
          >
            <Icon name="table-restaurant" size={30} color="gray" />
          </View>
        )}

        {/* Ícono de mesa principal */}
        <View {...panResponder.panHandlers} style={styles.draggable}>
          <View style={styles.draggableContainer}>
            <Icon name="table-restaurant" size={30} color="white" />
          </View>
        </View>

        {/* Mesas en el lienzo */}
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

      {/* Modal para ingresar la cantidad de sillas */}
      <ChairsModal
        visible={showModal}
        chairs={chairs}
        setChairs={setChairs}
        confirmTable={confirmTable}
      />
    </View>
  );
}

// 🎨 **Estilos Mejorados**
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
  draggable: {
    position: "absolute",
    bottom: 20,
    left: "50%",
    marginLeft: -20,
  },
  draggableContainer: {
    backgroundColor: "#3B82F6",
    padding: 10,
    borderRadius: 10,
  },
});
