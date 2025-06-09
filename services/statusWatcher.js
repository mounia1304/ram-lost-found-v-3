import { collection, query, where, onSnapshot } from "firebase/firestore";
import { firestore, auth } from "./databaseService/firebaseConfig";
import notificationService from "./NotificationService";
import * as Notifications from "expo-notifications";

class StatusWatcher {
  constructor() {
    this.unsubscribe = null;
    this.userDeclarations = new Map();
    this.isWatching = false;
  }

  startWatching() {
    if (!auth.currentUser || this.isWatching) {
      console.log("⚠️ Pas d'utilisateur connecté ou déjà en surveillance");
      return;
    }

    console.log("🔍 Début surveillance des déclarations...");

    const declarationsQuery = query(
      collection(firestore, "lostObjects"),
      where("userId", "==", auth.currentUser.uid)
    );

    this.unsubscribe = onSnapshot(
      declarationsQuery,
      (snapshot) => {
        console.log(`📊 ${snapshot.docs.length} déclarations surveillées`);

        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const data = change.doc.data();
            this.userDeclarations.set(change.doc.id, data.status);
            console.log(
              `➕ Nouvelle déclaration: ${change.doc.id} - statut: ${data.status}`
            );
          } else if (change.type === "modified") {
            this.handleStatusChange(change.doc);
          }
        });
      },
      (error) => {
        console.error("❌ Erreur surveillance:", error);
      }
    );

    this.isWatching = true;
    console.log("✅ Surveillance active !");
  }

  async handleStatusChange(doc) {
    const declarationId = doc.id;
    const newData = doc.data();
    const oldStatus = this.userDeclarations.get(declarationId);

    console.log(
      `🔄 Vérification ${declarationId}: ${oldStatus} → ${newData.status}`
    );

    if (oldStatus && oldStatus !== newData.status) {
      console.log(`🎯 CHANGEMENT DÉTECTÉ ! ${oldStatus} → ${newData.status}`);

      await this.sendStatusNotification(newData.status, newData, declarationId);
      this.userDeclarations.set(declarationId, newData.status);
    }
  }

  async sendStatusNotification(newStatus, declarationData, declarationId) {
    let title = "🔍 RAM Lost & Found";
    let body = "";

    switch (newStatus) {
      case "found":
        title = "🎉 Objet retrouvé !";
        body = `Excellente nouvelle ! Votre ${
          declarationData.type || "objet"
        } a été retrouvé.`;
        break;
      case "matched":
        title = "🔗 Correspondance trouvée";
        body = `Un objet correspondant à votre ${
          declarationData.type || "objet"
        } a été identifié.`;
        break;
      case "recovered":
        title = "✅ Objet récupéré";
        body = `Parfait ! Votre ${
          declarationData.type || "objet"
        } a été récupéré avec succès.`;
        break;
      default:
        title = "📋 Mise à jour";
        body = `Le statut de votre déclaration a été mis à jour.`;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: {
            type: "status_update",
            declarationId,
            newStatus,
          },
        },
        trigger: null,
      });

      console.log(`✅ Notification envoyée: ${title}`);
    } catch (error) {
      console.error("❌ Erreur envoi notification:", error);
    }
  }

  stopWatching() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
      this.isWatching = false;
      console.log("🛑 Surveillance arrêtée");
    }
  }

  getStatus() {
    return {
      isWatching: this.isWatching,
      declarationsCount: this.userDeclarations.size,
    };
  }
}

const statusWatcher = new StatusWatcher();
export default statusWatcher;
