import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
} from "react-native";
import notificationService from "./services/NotificationService";
import { useStatusWatcher } from "./hooks/usestatusWatcher";

import AppNavigator from "./navigations/appNavigator";

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  // Surveillance des notifications
  const watcherStatus = useStatusWatcher();

  useEffect(() => {
    initNotifications();
  }, []);

  const initNotifications = async () => {
    console.log("🚀 Démarrage de l'app...");
    const success = await notificationService.initialize();
    setIsReady(success);

    if (success) {
      console.log("🎉 App prête avec notifications !");
    }
  };

  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#C20831" />

      <AppNavigator />
    </NavigationContainer>
  );
}
