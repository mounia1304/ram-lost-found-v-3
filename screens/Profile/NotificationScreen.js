import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { getAuth } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";
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

        const matchesRef = collection(firestore, "matches");
        const q = query(
          matchesRef,
          where("userId", "==", user.uid),
          where("status", "==", "waiting"),
          orderBy("timestamp", "desc")
        );

        const querySnapshot = await getDocs(q);
        const rawMatches = querySnapshot.docs.map((doc) => ({
          matchId: doc.id,
          ...doc.data(),
        }));

        const enrichedMatches = await Promise.all(
          rawMatches.map(async (match) => {
            try {
              if (!match.foundId) return null;

              const foundRef = doc(firestore, "foundObjects", match.foundId);
              const foundSnap = await getDoc(foundRef);

              if (foundSnap.exists()) {
                return {
                  ...match,
                  foundObject: foundSnap.data(),
                };
              }
              return null;
            } catch (error) {
              console.error("Erreur sur un match:", error);
              return null;
            }
          })
        );

        setNotifications(
          enrichedMatches.filter((match) => match !== null && match.foundObject)
        );
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des notifications :",
          error
        );
        Alert.alert(
          "Erreur",
          "Impossible de charger les notifications. Veuillez réessayer."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMatchesWithDetails();
  }, []);

  const renderCard = ({ item }) => {
    const found = item.foundObject;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          navigation.navigate("ObjectDetails", {
            foundId: item.foundId,
            matchId: item.matchId,
            objectData: found,
          });
        }}
      >
        <Image
          source={{ uri: found?.imageUrl }}
          style={styles.photo}
          defaultSource={require("../../assets/placeholder-image.jpg")}
        />
        <View style={styles.infos}>
          <Text style={styles.modele}>{found?.type || "Objet trouvé"}</Text>
          <Text style={styles.details} numberOfLines={2}>
            {found?.description || "Aucune description disponible"}
          </Text>

          <View style={styles.location}>
            <MaterialIcons
              name={
                found?.location?.includes("Aéroport")
                  ? "airport-shuttle"
                  : "location-on"
              }
              size={16}
              color="#C20831"
            />
            <Text style={styles.lieu} numberOfLines={1}>
              {found?.location || "Lieu inconnu"}
            </Text>
          </View>

          <Text style={styles.date}>
            {found?.date
              ? new Date(found.date).toLocaleDateString()
              : "Date inconnue"}
          </Text>
        </View>

        <MaterialIcons
          name="chevron-right"
          size={24}
          color="#B49360"
          style={styles.chevron}
        />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#C20831" />
        <Text style={styles.loadingText}>Chargement des notifications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Vos notifications</Text>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.matchId}
        renderItem={renderCard}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="notifications-off" size={48} color="#A22032" />
            <Text style={styles.emptyText}>
              Aucune notification pour le moment
            </Text>
            <Text style={styles.emptySubText}>
              Vous serez notifié lorsqu'un objet correspondant à vos
              déclarations sera trouvé
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    marginTop: 25,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1A1717",
    padding: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EBEAE8",
  },
  list: {
    padding: 16,
    flexGrow: 1,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
    backgroundColor: "#F6F2ED",
  },
  infos: {
    flex: 1,
    justifyContent: "center",
  },
  modele: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333231",
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
    color: "#7B7A78",
    marginBottom: 8,
    lineHeight: 20,
  },
  location: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  lieu: {
    fontSize: 14,
    color: "#595855",
    marginLeft: 6,
    flex: 1,
  },
  date: {
    fontSize: 13,
    color: "#A22032",
    fontWeight: "500",
  },
  chevron: {
    marginLeft: 8,
  },
  loadingContainer: {
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 16,
    color: "#333231",
    fontSize: 18,
    fontWeight: "600",
  },
  emptySubText: {
    textAlign: "center",
    marginTop: 8,
    color: "#7B7A78",
    fontSize: 14,
    lineHeight: 20,
  },
});

export default NotificationScreen;
