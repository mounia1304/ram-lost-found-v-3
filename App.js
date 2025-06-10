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

// VOTRE NAVIGATOR
import AuthNavigator from "./navigations/testNavigato";

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

  const testNotification = async () => {
    await notificationService.sendTestNotification();
    Alert.alert("✅ Succès", "Notification test envoyée !");
  };

  const toggleDebug = () => {
    setShowDebug(!showDebug);
  };

  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#C20831" />

      {/* VOTRE NAVIGATOR PRINCIPAL */}
      <AuthNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  // Debug overlay (coin de l'écran)
  debugToggle: {
    position: "absolute",
    bottom: 50,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    zIndex: 9999,
  },
  debugToggleText: {
    color: "white",
    fontSize: 11,
    fontWeight: "600",
  },

  // Debug panel
  debugPanel: {
    position: "absolute",
    bottom: 100,
    right: 10,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 9999,
    minWidth: 200,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#C20831",
    marginBottom: 10,
    textAlign: "center",
  },
  debugText: {
    fontSize: 12,
    color: "#333",
    marginBottom: 5,
  },
  debugButton: {
    backgroundColor: "#C20831",
    padding: 8,
    borderRadius: 5,
    marginTop: 10,
    marginBottom: 5,
  },
  debugButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: "#666",
    padding: 6,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
    fontSize: 10,
    textAlign: "center",
  },
});
