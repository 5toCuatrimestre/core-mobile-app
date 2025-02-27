import React, { createContext, useState, useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const StyleContext = createContext();

export function StyleContextProvider({ children }) {
  const [style, setStyle] = useState(null);

  const handleColorChange = async (newColors) => {
    const newStyle = {
      H1: newColors.H1,
      H2: newColors.H2,
      H3: newColors.H3,
      P: newColors.P,
      BgCard: newColors.BgCard,
      BgInterface: newColors.BgInterface,
      BgButton: newColors.BgButton,
      status: true,
    };

    setStyle(newStyle);
    await AsyncStorage.setItem("style", JSON.stringify(newStyle));
  };

  useEffect(() => {
    const loadStyle = async () => {
      try {
        const savedStyle = await AsyncStorage.getItem("style");
        if (savedStyle) {
          setStyle(JSON.parse(savedStyle));
        } else {
          const defaultStyle = {
            H1: "#ffffff",
            H2: "#cccccc",
            H3: "#aaaaaa",
            P: "#000000",
            BgCard: "#222222",
            BgInterface: "#111111",
            BgButton: "#c7c7c7",
          }
          setStyle(defaultStyle);
          await AsyncStorage.setItem("style", JSON.stringify(defaultStyle));
        }
      } catch (error) {
        console.error("Error al cargar estilos:", error);
      }
    };

    loadStyle();
  }, []);

  if (!style) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#1f24ab" />
      </View>
    );
  }

  return (
    <StyleContext.Provider value={{ style, handleColorChange }}>
      {children}
    </StyleContext.Provider>
  );
}
