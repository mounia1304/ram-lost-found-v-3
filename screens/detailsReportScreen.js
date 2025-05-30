import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Linking,
} from "react-native";
import { AntDesign, Feather, MaterialIcons } from "@expo/vector-icons";
import { getLostObjectByRef } from "../services/reportLostService";

export default function DetailsReportScreen({ route, navigation }) {
  const { refCode } = route.params;
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getLostObjectByRef(refCode);

      if (!data) {
        setError("Aucun rapport trouvé avec cette référence");
        return;
      }

      setReportData(data);
    } catch (err) {
      console.error("Erreur lors du chargement:", err);
      setError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Date inconnue";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "lost":
        return {
          label: "Objet perdu",
          color: "#ff6b6b",
          icon: "search",
          description:
            "Votre déclaration a été enregistrée. Nous recherchons activement votre objet.",
        };
      case "found":
        return {
          label: "Objet retrouvé",
          color: "#51cf66",
          icon: "check-circle",
          description:
            "Bonne nouvelle ! Votre objet a été retrouvé. Contactez-nous pour la récupération.",
        };
      case "returned":
        return {
          label: "Objet rendu",
          color: "#339af0",
          icon: "verified",
          description: "Votre objet vous a été restitué avec succès.",
        };
      default:
        return {
          label: "Statut inconnu",
          color: "#868e96",
          icon: "help-circle",
          description: "Statut en cours de vérification.",
        };
    }
  };

  const handleContactSupport = () => {
    Alert.alert(
      "Contacter le support",
      "Comment souhaitez-vous nous contacter ?",
      [
        {
          text: "Téléphone",
          onPress: () => Linking.openURL("tel:+212522000000"),
        },
        {
          text: "Email",
          onPress: () =>
            Linking.openURL(
              "mailto:support@ramlost.ma?subject=Référence: " + refCode
            ),
        },
        {
          text: "Annuler",
          style: "cancel",
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#7b001c" />
        <Text style={styles.loadingText}>Chargement des détails...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <MaterialIcons name="error-outline" size={64} color="#ff6b6b" />
        <Text style={styles.errorTitle}>Oups !</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadReportData}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusInfo = getStatusInfo(reportData.status);

  return (
    <ScrollView style={styles.container}>
      {/* Header avec référence */}
      <View style={styles.header}>
        <Text style={styles.title}>📋 Détails de votre déclaration</Text>
        <View style={styles.refContainer}>
          <Text style={styles.refCode}>{reportData.ref}</Text>
        </View>
      </View>

      {/* Statut principal */}
      <View style={[styles.statusCard, { borderColor: statusInfo.color }]}>
        <View style={styles.statusHeader}>
          <View
            style={[styles.statusIcon, { backgroundColor: statusInfo.color }]}
          >
            <Feather name={statusInfo.icon} size={24} color="#fff" />
          </View>
          <View style={styles.statusInfo}>
            <Text style={[styles.statusLabel, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
            <Text style={styles.statusDate}>
              Créé le {formatDate(reportData.createdAt)}
            </Text>
          </View>
        </View>
        <Text style={styles.statusDescription}>{statusInfo.description}</Text>
      </View>

      {/* Détails de l'objet */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎒 Détails de l'objet</Text>
        <View style={styles.card}>
          {reportData.imageUrl && (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: reportData.imageUrl }}
                style={styles.objectImage}
              />
            </View>
          )}

          <View style={styles.detailRow}>
            <Feather name="tag" size={16} color="#7b001c" />
            <Text style={styles.detailLabel}>Type :</Text>
            <Text style={styles.detailValue}>{reportData.type}</Text>
          </View>

          <View style={styles.detailRow}>
            <Feather name="file-text" size={16} color="#7b001c" />
            <Text style={styles.detailLabel}>Description :</Text>
            <Text style={styles.detailValue}>{reportData.description}</Text>
          </View>

          <View style={styles.detailRow}>
            <Feather name="map-pin" size={16} color="#7b001c" />
            <Text style={styles.detailLabel}>Lieu :</Text>
            <Text style={styles.detailValue}>{reportData.location}</Text>
          </View>

          {reportData.color && reportData.color.length > 0 && (
            <View style={styles.detailRow}>
              <Feather name="palette" size={16} color="#7b001c" />
              <Text style={styles.detailLabel}>Couleur(s) :</Text>
              <View style={styles.colorContainer}>
                {reportData.color.map((color, index) => (
                  <View key={index} style={styles.colorTag}>
                    <Text style={styles.colorText}>{color}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {reportData.additionalDetails && (
            <View style={styles.detailRow}>
              <Feather name="info" size={16} color="#7b001c" />
              <Text style={styles.detailLabel}>Détails supplémentaires :</Text>
              <Text style={styles.detailValue}>
                {reportData.additionalDetails}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Historique */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⏱️ Historique</Text>
        <View style={styles.timeline}>
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, styles.timelineDotActive]}>
              <AntDesign name="plus" size={12} color="#fff" />
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Déclaration créée</Text>
              <Text style={styles.timelineDate}>
                {formatDate(reportData.createdAt)}
              </Text>
            </View>
          </View>

          {reportData.updatedAt &&
            reportData.updatedAt !== reportData.createdAt && (
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, styles.timelineDotActive]}>
                  <AntDesign name="edit" size={12} color="#fff" />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Dernière mise à jour</Text>
                  <Text style={styles.timelineDate}>
                    {formatDate(reportData.updatedAt)}
                  </Text>
                </View>
              </View>
            )}

          {reportData.status === "found" && (
            <View style={styles.timelineItem}>
              <View
                style={[styles.timelineDot, { backgroundColor: "#51cf66" }]}
              >
                <AntDesign name="check" size={12} color="#fff" />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Objet retrouvé</Text>
                <Text style={styles.timelineDate}>
                  En attente de récupération
                </Text>
              </View>
            </View>
          )}

          {reportData.status === "returned" && (
            <View style={styles.timelineItem}>
              <View
                style={[styles.timelineDot, { backgroundColor: "#339af0" }]}
              >
                <AntDesign name="check" size={12} color="#fff" />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Objet restitué</Text>
                <Text style={styles.timelineDate}>Dossier clôturé</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.contactButton}
          onPress={handleContactSupport}
        >
          <Feather name="phone" size={20} color="#fff" />
          <Text style={styles.contactButtonText}>Contacter le support</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.refreshButton} onPress={loadReportData}>
          <Feather name="refresh-cw" size={20} color="#7b001c" />
          <Text style={styles.refreshButtonText}>Actualiser</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  header: {
    backgroundColor: "#fff",
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#7b001c",
    marginBottom: 12,
  },
  refContainer: {
    backgroundColor: "#7b001c",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  refCode: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  statusCard: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statusDate: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  statusDescription: {
    fontSize: 15,
    color: "#444",
    lineHeight: 22,
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#7b001c",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  objectImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
    marginRight: 8,
    minWidth: 80,
  },
  detailValue: {
    fontSize: 14,
    color: "#666",
    flex: 1,
    lineHeight: 20,
  },
  colorContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    flex: 1,
  },
  colorTag: {
    backgroundColor: "#7b001c",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  colorText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  timeline: {
    paddingLeft: 24,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    marginLeft: -12,
  },
  timelineDotActive: {
    backgroundColor: "#7b001c",
  },
  timelineContent: {
    flex: 1,
    paddingTop: 2,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  timelineDate: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  contactButton: {
    backgroundColor: "#7b001c",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  contactButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  refreshButton: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#7b001c",
  },
  refreshButtonText: {
    color: "#7b001c",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ff6b6b",
    marginBottom: 8,
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#7b001c",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
