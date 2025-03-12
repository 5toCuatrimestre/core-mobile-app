import React, { useContext } from "react";
import { Tabs } from "expo-router";
import { StyleContext } from "../../../utils/StyleContext";
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
        name="areas"
        options={{
          title: "Areas",
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons name="table-restaurant" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
