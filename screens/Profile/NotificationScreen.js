import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../../services/databaseService/firebaseConfig";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const NotificationScreen = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatchesWithDetails = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          console.log("Utilisateur non connecté.");
          return;
        }

        const response = await axios.get(
          `http://10.0.2.2:5000/user_matches?userId=${user.uid}`
        );
        const rawMatches = response.data;

        const enrichedMatches = await Promise.all(
          rawMatches.map(async (match) => {
            const foundRef = doc(firestore, "foundObjects", match.foundId);
            const foundSnap = await getDoc(foundRef);

            if (foundSnap.exists()) {
              return {
                ...match,
                foundObject: foundSnap.data(),
              };
            } else {
              return match;
            }
          })
        );

        setNotifications(enrichedMatches);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des notifications :",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMatchesWithDetails();
  }, []);

  const handleConfirm = async (matchId) => {
    try {
      await axios.put(`http://10.0.2.2:5000/match/${matchId}`, {
        status: "accepted",
      });
      console.log("Match confirmé !");
    } catch (error) {
      console.error("Erreur lors de la confirmation :", error);
    }
  };

  const renderCard = ({ item }) => {
    const found = item.foundObject;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("ObjectDetailsScreen", { objet })}
      >
        <Image source={{ uri: found?.imageUrl }} style={styles.photo} />
        <View style={styles.infos}>
          <Text style={styles.modele}>{found?.type || "Objet trouvé"}</Text>
          <Text style={styles.details}>{found?.description}</Text>

          <View style={styles.location}>
            <MaterialIcons
              name={
                found?.location?.includes("Aéroport")
                  ? "airport-shuttle"
                  : "location-on"
              }
              size={16}
              color="#ED1C24"
            />
            <Text style={styles.lieu}>{found?.location || "Lieu inconnu"}</Text>
          </View>

          <Text style={styles.date}>{found?.date || "Date inconnue"}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ED1C24" />
        <Text>Chargement des notifications...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={notifications}
      keyExtractor={(item, index) => item.matchId || index.toString()}
      renderItem={renderCard}
      contentContainerStyle={styles.list}
      ListEmptyComponent={
        <Text style={styles.empty}>Aucune notification pour le moment.</Text>
      }
    />
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  infos: {
    flex: 1,
    justifyContent: "center",
  },
  modele: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  details: {
    fontSize: 13,
    color: "#555",
    marginBottom: 6,
    fontStyle: "italic",
  },
  location: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  lieu: {
    fontSize: 13,
    color: "#333",
    marginLeft: 6,
  },
  date: {
    fontSize: 12,
    color: "#ED1C24",
    fontWeight: "500",
  },
  score: {
    fontSize: 12,
    color: "#00796B",
    marginTop: 4,
    marginBottom: 6,
  },
  button: {
    backgroundColor: "#ED1C24",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  buttonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  empty: {
    textAlign: "center",
    marginTop: 32,
    color: "#777",
  },
});
