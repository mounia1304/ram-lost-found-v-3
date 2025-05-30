import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig"; // adapte ce chemin si nécessaire

const ObjectDetailsScreen = ({ route, navigation }) => {
  const { foundId, matchId } = route.params;
  const [objectData, setObjectData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchObjectDetails = async () => {
      try {
        const docRef = doc(db, "foundObjects", foundId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setObjectData(docSnap.data());
        } else {
          Alert.alert("Erreur", "Objet introuvable");
        }
      } catch (error) {
        Alert.alert("Erreur", "Échec du chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchObjectDetails();
  }, [foundId]);

  const updateMatchStatus = async (status) => {
    if (!matchId) {
      Alert.alert("Erreur", "Identifiant de correspondance manquant");
      return;
    }

    try {
      await updateDoc(doc(db, "matches", matchId), {
        status: status,
        updatedAt: new Date(),
      });

      Alert.alert(
        "Merci pour votre réponse",
        `Statut mis à jour : ${
          status === "accepted" ? "Objet revendiqué" : "Objet rejeté"
        }`,
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert("Erreur", "Impossible de mettre à jour le statut");
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#a00" />
      </View>
    );
  }

  if (!objectData) {
    return (
      <View style={styles.centered}>
        <Text>Objet non trouvé.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {objectData.imageUrl ? (
        <Image source={{ uri: objectData.imageUrl }} style={styles.image} />
      ) : (
        <MaterialIcons name="photo" size={100} color="#ccc" />
      )}

      <Text style={styles.title}>{objectData.type}</Text>

      {objectData.description ? (
        <Text style={styles.description}>{objectData.description}</Text>
      ) : null}

      <View style={styles.infoBox}>
        <MaterialIcons name="place" size={20} color="#d00" />
        <Text style={styles.infoText}>
          {objectData.location || "Lieu non spécifié"}
        </Text>
      </View>

      <View style={styles.infoBox}>
        <MaterialIcons name="access-time" size={20} color="#d00" />
        <Text style={styles.infoText}>
          {objectData.date || "Date non spécifiée"}
        </Text>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.rejectButton}
          onPress={() => updateMatchStatus("rejected")}
        >
          <Text style={styles.buttonText}>Ce n’est pas le mien</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => updateMatchStatus("accepted")}
        >
          <Text style={styles.buttonText}>C’est mon objet</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ObjectDetailsScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 220,
    height: 220,
    borderRadius: 10,
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#444",
    textAlign: "center",
    marginBottom: 12,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 6,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    width: "100%",
  },
  rejectButton: {
    backgroundColor: "#ccc",
    padding: 12,
    borderRadius: 10,
    flex: 1,
    marginRight: 8,
  },
  acceptButton: {
    backgroundColor: "#d00",
    padding: 12,
    borderRadius: 10,
    flex: 1,
    marginLeft: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});
