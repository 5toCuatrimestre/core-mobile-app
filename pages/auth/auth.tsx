import React, { useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { StyleContext } from "../../core/StyleContext";

export default function AuthScreen() {
  const styleContext = useContext(StyleContext);

  if (!styleContext) {
    console.warn("StyleContext no está disponible aún.");
    return <Text>Loading styles...</Text>;
  }
  const style = styleContext.style;
  const handleLogin = () => {
    Alert.alert("Logged in", "You have successfully logged in.");
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: style?.lightBackgroundColor || "#f5f5f5" },
      ]}
    >
      <Text style={[styles.title, { color: "white" }]}>
        Welcome
      </Text>
      <Text style={[styles.subtitle, { color: "white" }]}>
        Please log in to continue
      </Text>

      {/* Email Input */}
      <TextInput
        style={[
          styles.input,
          { backgroundColor: style?.darkBackgroundColor || "#ffffff", color: "#000000" },
        ]}
        placeholder="Email"
        placeholderTextColor="white"
      />

      {/* Password Input */}
      <TextInput
        style={[
          styles.input,
          { backgroundColor: style?.darkBackgroundColor || "#ffffff", color: "#000000" },
        ]}
        placeholder="Password"
        placeholderTextColor="white"
        secureTextEntry
      />

      {/* Login Button */}
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: style?.baseColor || "#007bff" },
        ]}
        onPress={handleLogin}
      >
        <Text style={[styles.buttonText, { color: "#ffffff" }]}>Log in</Text>
      </TouchableOpacity>
      <Text className="text-4xl">
        Hola con nativewind
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
  },
  input: {
    width: "80%",
    height: 50,
    marginVertical: 10,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#cccccc",
  },
  button: {
    width: "80%",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
