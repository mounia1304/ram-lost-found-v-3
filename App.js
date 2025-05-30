import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AuthNavigator from "./navigations/testNavigato";
import { LogBox } from "react-native";
export default function App() {
  LogBox.ignoreAllLogs(false);
  return (
    <NavigationContainer>
      <AuthNavigator />
    </NavigationContainer>
  );
}
