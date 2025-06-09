import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import notificationService from "./services/NotificationService";
import { useStatusWatcher } from "./hooks/usestatusWatcher";

export default function App() {
  const [isReady, setIsReady] = useState(false);

  // UTILISATION CORRIGÉE
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>RAM Lost & Found</Text>

      <Text style={styles.status}>
        Notifications: {isReady ? "✅ Actives" : "❌ Inactives"}
      </Text>

      <Text style={styles.status}>
        Surveillance: {watcherStatus.isWatching ? "✅ Active" : "❌ Inactive"}
      </Text>

      <Text style={styles.status}>
        Déclarations: {watcherStatus.declarationsCount}
      </Text>

      <TouchableOpacity style={styles.button} onPress={testNotification}>
        <Text style={styles.buttonText}>📱 Test Notification</Text>
      </TouchableOpacity>

      {/* Votre navigation habituelle ici */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#C20831",
    marginBottom: 20,
  },
  status: {
    fontSize: 16,
    marginBottom: 10,
    color: "#333231",
  },
  button: {
    backgroundColor: "#C20831",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    width: "100%",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
