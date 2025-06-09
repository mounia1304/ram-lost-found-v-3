// services/notificationService.js - VERSION CORRIGÉE
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import {
  doc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { firestore, auth } from "../services/databaseService/firebaseConfig";

// Configuration corrigée
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, // Corrigé: plus shouldShowAlert
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.token = null;
  }

  async initialize() {
    try {
      console.log("🔄 Initialisation des notifications...");

      // 1. Vérifier si on est sur un vrai téléphone
      if (!Device.isDevice) {
        console.log(
          "❌ Les notifications ne marchent que sur un vrai téléphone"
        );
        return false;
      }

      // 2. Demander la permission
      const { status } = await Notifications.getPermissionsAsync();
      let finalStatus = status;

      if (status !== "granted") {
        const { status: newStatus } =
          await Notifications.requestPermissionsAsync();
        finalStatus = newStatus;
      }

      if (finalStatus !== "granted") {
        console.log("❌ Permission refusée");
        return false;
      }

      // 3. Obtenir le token - VERSION SIMPLIFIÉE
      const tokenData = await Notifications.getExpoPushTokenAsync();

      this.token = tokenData.data;
      console.log("✅ Token obtenu:", this.token.substring(0, 20) + "...");

      // 4. Sauvegarder dans Firebase
      await this.saveTokenToFirebase();

      // 5. Écouter les notifications
      this.setupListeners();

      console.log("✅ Notifications initialisées avec succès !");
      return true;
    } catch (error) {
      console.log("❌ Erreur:", error.message);

      // Si erreur de token, essayer quand même de setup les notifications locales
      console.log("🔄 Tentative avec notifications locales uniquement...");
      this.setupListeners();
      return true; // Retourner true pour permettre les notifications locales
    }
  }

  async saveTokenToFirebase() {
    try {
      if (!auth.currentUser?.email || !this.token) {
        console.log("⚠️ Pas d'utilisateur connecté ou pas de token");
        return;
      }

      const usersQuery = query(
        collection(firestore, "ownersData"),
        where("email", "==", auth.currentUser.email)
      );

      const querySnapshot = await getDocs(usersQuery);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userRef = doc(firestore, "ownersData", userDoc.id);

        await updateDoc(userRef, {
          notificationToken: this.token,
          tokenUpdatedAt: new Date(),
        });

        console.log("✅ Token sauvegardé dans Firebase");
      } else {
        console.log("⚠️ Utilisateur non trouvé dans ownersData");
      }
    } catch (error) {
      console.log("❌ Erreur sauvegarde token:", error.message);
    }
  }

  setupListeners() {
    // Quand une notification arrive
    Notifications.addNotificationReceivedListener((notification) => {
      console.log("📩 Notification reçue:", notification.request.content.title);
    });

    // Quand l'utilisateur clique sur une notification
    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("👆 Notification cliquée");
    });
  }

  // Notification test - MARCHE TOUJOURS
  async sendTestNotification() {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "✅ Test RAM Lost & Found",
          body: "Les notifications locales fonctionnent !",
          data: { test: true },
        },
        trigger: null,
      });
      console.log("✅ Notification test envoyée");
      return true;
    } catch (error) {
      console.log("❌ Erreur notification test:", error.message);
      return false;
    }
  }

  getToken() {
    return this.token;
  }
}

const notificationService = new NotificationService();
export default notificationService;
