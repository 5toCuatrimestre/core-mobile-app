import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { login } from "../api/authApi";

import { Checkbox } from "react-native-paper";
import { StyleContext } from "../utils/StyleContext";
import { Ionicons } from "@expo/vector-icons";

export default function AuthScreen() {
  const router = useRouter();
  const { style } = useContext(StyleContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const handleLogin = async () => {
    try {
      console.log("Email:", email, "Password:", password, "Remember:", remember);
      const credentials = { email, password }; // Las credenciales que se pasan al login
      const result = await login(credentials); // Llamas a la función login
      console.log("Login result:", result);
  
      if (email == "waiter") {
        router.push("/waiter"); // Redirige tras login
      } else if (email == "leader") {
        router.push("/leader"); // Redirige tras login
      }
    } catch (error) {
      console.log("Error al iniciar sesión:", error);
      // Maneja el error aquí, tal vez mostrando un mensaje de error al usuario
    }
  };

  return (
    <View
      className="flex-1 items-center justify-center"
      style={{ backgroundColor: style.BgInterface }}
    >
      <View
        className="w-full max-w-sm p-12 rounded-2xl shadow-lg gap-5"
        style={{ backgroundColor: style.BgCard }}
      >
        <Text
          className="text-xl font-semibold text-center mb-6"
          style={{ color: style.H2 }}
        >
          Iniciar sesión
        </Text>

        {/* Campo de Email */}
        <View
          className="flex-row items-center border rounded-md px-3 py-2"
          style={{ borderColor: style.H3 }}
        >
          <Ionicons
            name="mail-outline"
            size={20}
            color={style.H3}
            className="mr-2"
          />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Correo electrónico"
            placeholderTextColor={style.H3}
            className="flex-1 text-white"
          />
        </View>

        {/* Campo de Contraseña */}
        <View
          className="flex-row items-center border rounded-md px-3 py-2"
          style={{ borderColor: style.H3 }}
        >
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color={style.H3}
            className="mr-2"
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Contraseña"
            placeholderTextColor={style.H3}
            secureTextEntry
            className="flex-1 text-white"
          />
        </View>

        {/* Recordar Sesión y Olvidar Contraseña */}
        <View className="flex-row justify-between items-center mb-4">
          <TouchableOpacity
            onPress={() => setRemember(!remember)}
            className="flex-row items-center"
          >
            <Checkbox
              status={remember ? "checked" : "unchecked"}
              color={style.BgButton}
            />
            <Text className="ml-2" style={{ color: style.H3 }}>
              Recordarme
            </Text>
          </TouchableOpacity>
          <Text className="text-sm" style={{ color: style.H3 }}>
            ¿Olvidaste tu contraseña?
          </Text>
        </View>

        {/* Botón de Login */}
        <TouchableOpacity
          onPress={handleLogin}
          className="py-2 rounded-md"
          style={{ backgroundColor: style.BgButton }}
        >
          <Text
            className="text-center font-semibold"
            style={{ color: style.P }}
          >
            Iniciar sesión
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
