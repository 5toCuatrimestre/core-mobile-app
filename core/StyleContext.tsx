import React, { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getActiveStyle } from "../services/styleService";

export interface Style {
  baseColor: string;
  lightBackgroundColor: string;
  mediumBackgroundColor: string;
  darkBackgroundColor: string;
}

interface StyleContextProps {
  style: Style | null;
}

export const StyleContext = createContext<StyleContextProps | undefined>(
  undefined
);

export const StyleContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [style, setStyle] = useState<Style | null>(null);

  const defaultStyle: Style = {
    baseColor: "#1677ff",
    lightBackgroundColor: "#5A9FFF",
    mediumBackgroundColor: "#3388FF",
    darkBackgroundColor: "#0A5FCC",
  };

  const loadStyles = async () => {
    try {
      console.log("Verificando si hay nuevos estilos en el servidor...");
      const fetchedStyle = await getActiveStyle(); 
      if (fetchedStyle) {
        console.log("Estilo obtenido del servidor:", fetchedStyle);
        setStyle(fetchedStyle);
        await AsyncStorage.setItem("style", JSON.stringify(fetchedStyle));
      } else {
        console.warn("No hay nuevos estilos en el servidor. Usando estilo local.");
        const savedStyle = await AsyncStorage.getItem("style");
        if (savedStyle) {
          console.log("Estilo cargado desde AsyncStorage:", JSON.parse(savedStyle));
          setStyle(JSON.parse(savedStyle));
        } else {
          console.warn("No se encontró estilo guardado. Aplicando estilo por defecto.");
          setStyle(defaultStyle);
          await AsyncStorage.setItem("style", JSON.stringify(defaultStyle));
        }
      }
    } catch (error) {
      console.error("Error cargando estilos:", error);
      console.warn("Aplicando estilo por defecto debido al error.");
      setStyle(defaultStyle);
    }
  };

  useEffect(() => {
    loadStyles();
  }, []);

  if (!style) {
    console.warn("Estilo aún no disponible.");
    return null;
  }

  return (
    <StyleContext.Provider value={{ style }}>
      {children}
    </StyleContext.Provider>
  );
};
