import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { firestore } from "../../services/databaseService/firebaseConfig";
import { useRoute, useNavigation } from "@react-navigation/native";

const ObjectDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { foundId, matchId } = route.params;

  const [foundObject, setFoundObject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFoundObject = async () => {
      try {
        const docRef = doc(firestore, "foundObjects", foundId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setFoundObject(docSnap.data());
        } else {
          Alert.alert("Erreur", "Objet non trouvé.");
          navigation.goBack();
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'objet :", error);
        Alert.alert(
          "Erreur",
          "Impossible de récupérer les détails de l'objet."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFoundObject();
  }, [foundId]);

  const updateMatchStatus = async (status) => {
    try {
      const matchRef = doc(firestore, "matches", matchId);

      if (status === "rejected") {
        await deleteDoc(matchRef);
        Alert.alert(
          "Merci",
          "Vous avez indiqué que ce n'est pas votre objet. nous équipe vont continuer á rechercher votre objet."
        );
      } else {
        // 1. Mise à jour du statut du match
        await updateDoc(matchRef, { status });

        // 2. Récupérer le document match pour accéder au lostObjectId
        const matchSnap = await getDoc(matchRef);
        const matchData = matchSnap.data();
        const lostId = matchData?.lostId;

        // 3. Mettre à jour le statut de l’objet trouvé
        const foundRef = doc(firestore, "foundObjects", foundId);
        await updateDoc(foundRef, { status: "confirmed" });

        // 4. Mettre à jour le statut de l’objet perdu (si présent)

        const lostRef = doc(firestore, "lostObjects", lostId);
        await updateDoc(lostRef, { status: "confirmed" });
        Alert.alert(
          "Succès",
          "Nos équipes vous contacteront bientôt pour récupérer votre objet."
        );
      }

      navigation.goBack();
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour/suppression du statut :",
        error
      );
      Alert.alert("Erreur", "Une erreur est survenue lors du traitement.");
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#C20831" />
        <Text style={styles.loadingText}>Chargement des détails...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        {foundObject?.imageUrl && (
          <Image
            source={{ uri: foundObject.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        )}

        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>Informations sur l'objet</Text>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Type :</Text>
            <Text style={styles.detailValue}>
              {foundObject.type || "Non spécifié"}
            </Text>
          </View>

          {foundObject.description && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Description :</Text>
              <Text style={styles.detailValue}>{foundObject.description}</Text>
            </View>
          )}

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Lieu de découverte :</Text>
            <Text style={styles.detailValue}>
              {foundObject.location || "Non spécifié"}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Date de découverte :</Text>
            <Text style={styles.detailValue}>
              {foundObject.date
                ? new Date(foundObject.date.seconds * 1000).toLocaleDateString(
                    "fr-FR"
                  )
                : "Non spécifiée"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <Text style={styles.actionPrompt}>Cet objet vous appartient-il ?</Text>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.rejectButton]}
            onPress={() => updateMatchStatus("rejected")}
          >
            <Text style={styles.buttonText}>Ce n'est pas le mien</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.acceptButton]}
            onPress={() => updateMatchStatus("accepted")}
          >
            <Text style={styles.buttonText}>C'est mon objet</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default ObjectDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    marginTop: 25,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    margin: 16,
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 250,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  detailsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#C20831",
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#D8D7D4",
  },
  detailItem: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#A22032",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: "#595855",
    lineHeight: 22,
  },
  actionsContainer: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    margin: 16,
    borderRadius: 12,
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionPrompt: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1717",
    textAlign: "center",
    marginBottom: 20,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  acceptButton: {
    backgroundColor: "#00875D",
    marginLeft: 8,
  },
  rejectButton: {
    backgroundColor: "#A90044",
    marginRight: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  loadingText: {
    marginTop: 16,
    color: "#7B7A78",
    fontSize: 16,
  },
});
