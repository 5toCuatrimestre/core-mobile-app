import React, { useState } from "react";
import { View, Text, Button } from "react-native";
import { useRouter } from "expo-router";
import { Routes } from "../utils/routes";
import SumComponent from "./SumComponent";  // Importa el componente de suma

export default function DashboardScreen() {
  const router = useRouter();
  const [sumResult, setSumResult] = useState(0);  // Estado para guardar el resultado de la suma

  const handleSumChange = (newSum) => {
    setSumResult(newSum);  // Actualiza el resultado de la suma cuando cambian los valores
  };

  return (
    <View className="p-4">
      <Text className="text-2xl">Hello world</Text>
      
      {/* Aquí pasamos los valores iniciales y la función para actualizar el resultado */}
      <SumComponent value1={10} value2={20} onSumChange={handleSumChange} />

      {/* Mostrar el resultado de la suma */}
      <Text className="mt-4 text-xl">Resultado de la suma: {sumResult}</Text>

      <Button title="Ir a espacios" onPress={() => router.push(Routes.space)} />
    </View>
  );
}
