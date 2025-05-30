import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { getAuth } from "firebase/auth";
const API_URL = "http://10.0.2.2:5000/user_matches";

export default function NotificationsScreen({ userId }) {
  const [matches, setMatches] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMatches = useCallback(async () => {
    try {
      console.log("userId utilisé pour la requête :", userId);
      const res = await axios.get(`${API_URL}?userId=${userId}`);

      setMatches(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement des notifications", err);
    }
  }, [userId]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMatches();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / (3600000 * 24));
    if (hours < 24) return `Il y a ${hours} heures`;
    if (days === 1) return "Hier";
    if (days < 7) return `Il y a ${days} jours`;
    return date.toLocaleDateString("fr-FR");
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.notification}>
      <View style={styles.iconContainer}>
        <Ionicons name="link" size={24} color="#2196F3" />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Nouvelle correspondance détectée</Text>
        <Text style={styles.description}>
          Score de similarité : {item.similarityScore.toFixed(2)}
        </Text>
        <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off-outline" size={60} color="#ccc" />
      <Text style={styles.emptyText}>Aucune correspondance pour l'instant</Text>
    </View>
  );

  return (
    <FlatList
      data={matches}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={
        matches.length === 0 ? styles.emptyList : styles.list
      }
      ListEmptyComponent={EmptyState}
    />
  );
}

const styles = StyleSheet.create({
  notification: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    backgroundColor: "#E3F2FD",
    borderRadius: 30,
    padding: 10,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontWeight: "bold",
    color: "#1A1A1A",
    fontSize: 16,
  },
  description: {
    color: "#6C757D",
    fontSize: 14,
    marginTop: 4,
  },
  date: {
    fontSize: 12,
    color: "#8E8E93",
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
  list: {
    paddingTop: 16,
  },
  emptyList: {
    flex: 1,
    justifyContent: "center",
  },
});
