import OneSignal from "react-native-onesignal";
import Constants from "expo-constants";
import {
  doc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { firestore, auth } from "./databaseService/firebaseConfig";

class OneSignalService {
  constructor() {
    this.isInitialized = false;
    this.userId = null;
  }

  async initialize() {
    try {
      console.log("🔔 Initialisation OneSignal...");

      const appId = Constants.expoConfig?.extra?.oneSignalAppId;
      if (!appId) {
        console.error("❌ APP_ID OneSignal manquant");
        return false;
      }

      OneSignal.setAppId(appId);

      // Demander permission
      OneSignal.promptForPushNotificationsWithUserResponse((response) => {
        console.log("🔔 Permission OneSignal:", response);
      });

      // Écouter les notifications
      OneSignal.setNotificationWillShowInForegroundHandler(
        (notificationReceivedEvent) => {
          console.log(
            "📩 Notification OneSignal reçue:",
            notificationReceivedEvent
          );
          const notification = notificationReceivedEvent.getNotification();
          notificationReceivedEvent.complete(notification);
        }
      );

      // Écouter les clics
      OneSignal.setNotificationOpenedHandler((notification) => {
        console.log("👆 Notification OneSignal cliquée:", notification);
      });

      // Écouter l'ID utilisateur
      OneSignal.setSubscriptionObserver((changes) => {
        console.log("🆔 OneSignal User ID:", changes.to.userId);
        this.userId = changes.to.userId;
        this.saveUserIdToFirestore(changes.to.userId);
      });

      this.isInitialized = true;
      console.log("✅ OneSignal initialisé !");
      return true;
    } catch (error) {
      console.error("❌ Erreur OneSignal:", error);
      return false;
    }
  }

  async saveUserIdToFirestore(oneSignalId) {
    try {
      if (!auth.currentUser?.email || !oneSignalId) return;

      const usersQuery = query(
        collection(firestore, "ownersData"),
        where("email", "==", auth.currentUser.email)
      );

      const querySnapshot = await getDocs(usersQuery);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userRef = doc(firestore, "ownersData", userDoc.id);

        await updateDoc(userRef, {
          oneSignalId: oneSignalId,
          oneSignalUpdatedAt: new Date(),
        });

        console.log("✅ OneSignal ID sauvegardé:", oneSignalId);
      }
    } catch (error) {
      console.error("❌ Erreur sauvegarde OneSignal ID:", error);
    }
  }

  getUserId() {
    return this.userId;
  }

  getStatus() {
    return {
      isInitialized: this.isInitialized,
      userId: this.userId,
    };
  }
}

export default new OneSignalService();
