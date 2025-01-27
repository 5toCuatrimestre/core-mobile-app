import React from "react";
import { registerRootComponent } from "expo"; 
import { StyleContextProvider } from "../core/StyleContext"; 
import AuthScreen from "../pages/auth/auth"; 
export default function App() {
  return (
    <StyleContextProvider>
      <AuthScreen />
    </StyleContextProvider>
  );
}

registerRootComponent(App);
