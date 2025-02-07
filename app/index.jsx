import React, { useState } from "react";
import { View, Text } from "react-native";
import { TextInput, Checkbox, Button } from "react-native-paper";
import { useRouter } from "expo-router";

export default function AuthScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const handleLogin = () => {
    console.log("Email:", email, "Password:", password, "Remember:", remember);
    router.push("/dashboard"); // Redirige tras login
  };

  return (
    <View className="flex-1 items-center justify-center bg-gray-900 px-6">
      <View className="w-full max-w-sm bg-gray-800 p-6 rounded-2xl shadow-lg gap-5">
        <Text className="text-white text-xl font-semibold text-center mb-6">
          Iniciar Sesión
        </Text>

        {/* Campo de Email */}
        <TextInput
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          left={<TextInput.Icon icon="email" />}
          className="text-white"
        />

        {/* Campo de Contraseña */}
        <TextInput
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry
          left={<TextInput.Icon icon="lock" />}
          className="text-white"
        />

        {/* Recordar Sesión y Olvidar Contraseña */}
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center">
            <Checkbox
              status={remember ? "checked" : "unchecked"}
              onPress={() => setRemember(!remember)}
              color="#4F46E5"
            />
            <Text className="text-white ml-2">Recordarme</Text>
          </View>
          <Text className="text-indigo-400">Olvidé mi contraseña</Text>
        </View>

        {/* Botón de Login */}
        <Button
          mode="contained"
          onPress={handleLogin}
          className="bg-indigo-600 py-2 rounded-md"
        >
          Iniciar Sesión
        </Button>
      </View>
    </View>
  );
}
