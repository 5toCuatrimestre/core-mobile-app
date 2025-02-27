import React, { useContext } from "react";
import { Tabs } from "expo-router";
import { StyleContext } from "../../utils/StyleContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function TabLayout() {
  const { style } = useContext(StyleContext);
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: style.H3,
        headerStyle: {
          backgroundColor: style.BgButton,
        },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: "#25292e",
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Solicitudes",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home-sharp" : "home-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="space"
        options={{
          title: "Espacio",
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons name="table-restaurant" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
