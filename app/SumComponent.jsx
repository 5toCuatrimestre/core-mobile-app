import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button } from "react-native";

const SumComponent = ({ value1, value2, onSumChange }) => {
  const [num1, setNum1] = useState(value1);
  const [num2, setNum2] = useState(value2);
  const [sum, setSum] = useState(0);

  // Calculamos la suma cuando los valores cambian
  useEffect(() => {
    const newSum = Number(num1) + Number(num2);
    setSum(newSum);
    // Llamamos a la función onSumChange para notificar al componente padre
    onSumChange(newSum);
  }, [num1, num2]);

  return (
    <View>
      <Text className="text-xl">Componente de Sumar</Text>

      {/* Inputs para los números */}
      <TextInput
        value={String(num1)}
        onChangeText={(text) => setNum1(text)}
        keyboardType="numeric"
        placeholder="Ingresa un número"
        className="bg-gray-200 p-2 m-2"
      />
      <TextInput
        value={String(num2)}
        onChangeText={(text) => setNum2(text)}
        keyboardType="numeric"
        placeholder="Ingresa otro número"
        className="bg-gray-200 p-2 m-2"
      />

      {/* Resultado */}
      <Text className="text-lg">Resultado: {sum}</Text>
    </View>
  );
};

export default SumComponent;
