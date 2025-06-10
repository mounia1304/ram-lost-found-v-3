// ReportDetailsScreen.js - Détails d'une déclaration
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Image,
  Alert,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../../services/databaseService/firebaseConfig";

// Couleurs RAM selon la charte officielle
const COLORS = {
  primary: "#C20831",
  secondary: "#61374E",
  tertiary: "#B49360",
  white: "#FFFFFF",
  background: "#FAFAFA",
  surface: "#FFFFFF",
  text: "#333231",
  textSecondary: "#595855",
  textLight: "#7B7A78",
  border: "#D8D7D4",
  success: "#00875D",
  info: "#2790F1",
  caution: "#F99B43",
  warning: "#B7501F",
  error: "#A90044",
  backgroundSuccess: "#DBF0EB",
  backgroundInfo: "#DFEEFD",
  backgroundCaution: "#FEF0E3",
  backgroundError: "#F2D9E3",
  shadow: "rgba(0, 0, 0, 0.1)",
};

const ReportDetailsScreen = ({ route, navigation }) => {
  const { reportId } = route.params;
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportDetails();
  }, [reportId]);

  const fetchReportDetails = async () => {
    try {
      const docRef = doc(firestore, "lostObjects", reportId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setReport({ id: docSnap.id, ...docSnap.data() });
      } else {
        Alert.alert("Erreur", "Déclaration introuvable");
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error fetching report:", error);
      Alert.alert("Erreur", "Impossible de charger les détails");
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: {
        color: COLORS.caution,
        background: COLORS.backgroundCaution,
        text: "En recherche",
        icon: "search",
        description:
          "Votre déclaration est en cours d'analyse par notre équipe.",
      },
      found: {
        color: COLORS.success,
        background: COLORS.backgroundSuccess,
        text: "Retrouvé",
        icon: "checkmark-circle",
        description:
          "Votre objet a été retrouvé ! Nous vous contacterons bientôt.",
      },
      matched: {
        color: COLORS.info,
        background: COLORS.backgroundInfo,
        text: "Correspondance trouvée",
        icon: "link",
        description:
          "Nous avons trouvé un objet correspondant à votre description.",
      },
      recovered: {
        color: COLORS.success,
        background: COLORS.backgroundSuccess,
        text: "Récupéré",
        icon: "checkmark-done",
        description: "Votre objet a été récupéré avec succès.",
      },
      closed: {
        color: COLORS.textLight,
        background: COLORS.background,
        text: "Fermé",
        icon: "close-circle",
        description: "Cette déclaration a été fermée.",
      },
    };
    return statusMap[status] || statusMap.pending;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Date inconnue";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Date invalide";
    }
  };

  const callSupport = () => {
    const phoneNumber = "tel:+212522489797";
    Linking.openURL(phoneNumber).catch(() => {
      Alert.alert("Erreur", "Impossible d'ouvrir l'application téléphone");
    });
  };

  const sendEmail = () => {
    const email = "support.lostandfound@royalairmaroc.com";
    const subject = encodeURIComponent(
      `Support - Déclaration ${report?.ref || reportId}`
    );
    const body = encodeURIComponent(
      `Bonjour,\n\nJe vous contacte concernant ma déclaration :\nRéférence: ${
        report?.ref || reportId
      }\nType d'objet: ${report?.type}\n\nCordialement,`
    );

    const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;

    Linking.openURL(mailtoUrl).catch(() => {
      Alert.alert("Email", `Contactez-nous à :\n${email}`);
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </SafeAreaView>
    );
  }

  if (!report) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>Déclaration introuvable</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusInfo = getStatusInfo(report.status);
  const title = report.type === "autre" ? report.description : report.type;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBackButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails de la déclaration</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Statut */}
        <View style={styles.statusCard}>
          <LinearGradient
            colors={[statusInfo.color, statusInfo.color + "20"]}
            style={styles.statusGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.statusContent}>
              <View
                style={[
                  styles.statusIcon,
                  { backgroundColor: statusInfo.background },
                ]}
              >
                <Ionicons
                  name={statusInfo.icon}
                  size={24}
                  color={statusInfo.color}
                />
              </View>
              <View style={styles.statusTextContainer}>
                <Text style={styles.statusTitle}>{statusInfo.text}</Text>
                <Text style={styles.statusDescription}>
                  {statusInfo.description}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Informations principales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations de l'objet</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="pricetag" size={18} color={COLORS.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Référence</Text>
                <Text style={styles.infoValue}>{report.ref || reportId}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="cube" size={18} color={COLORS.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Type d'objet</Text>
                <Text style={styles.infoValue}>{title}</Text>
              </View>
            </View>

            {report.description && report.type !== "autre" && (
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Ionicons
                    name="document-text"
                    size={18}
                    color={COLORS.primary}
                  />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Description</Text>
                  <Text style={styles.infoValue}>{report.description}</Text>
                </View>
              </View>
            )}

            {report.additionalDetails && (
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Ionicons
                    name="information-circle"
                    size={18}
                    color={COLORS.primary}
                  />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Détails supplémentaires</Text>
                  <Text style={styles.infoValue}>
                    {report.additionalDetails}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="location" size={18} color={COLORS.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Lieu de perte</Text>
                <Text style={styles.infoValue}>
                  {report.location || "Non spécifié"}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="calendar" size={18} color={COLORS.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Date de déclaration</Text>
                <Text style={styles.infoValue}>
                  {formatDate(report.createdAt)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Photos */}
        {report.photos && report.photos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.photosContainer}
            >
              {report.photos.map((photo, index) => (
                <Image
                  key={index}
                  source={{ uri: photo }}
                  style={styles.photo}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Besoin d'aide ?</Text>

          <View style={styles.contactCard}>
            <Text style={styles.contactTitle}>
              Contactez notre service client
            </Text>
            <Text style={styles.contactSubtitle}>
              Notre équipe est disponible 24h/7j pour vous aider
            </Text>

            <View style={styles.contactButtons}>
              <TouchableOpacity
                style={styles.contactButton}
                onPress={callSupport}
              >
                <Ionicons name="call" size={20} color={COLORS.white} />
                <Text style={styles.contactButtonText}>Appeler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.contactButton, styles.contactButtonSecondary]}
                onPress={sendEmail}
              >
                <Ionicons name="mail" size={20} color={COLORS.primary} />
                <Text
                  style={[
                    styles.contactButtonText,
                    styles.contactButtonTextSecondary,
                  ]}
                >
                  Email
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textLight,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.error,
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },

  // Header
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.white,
  },
  placeholder: {
    width: 40,
  },

  // Content
  content: {
    flex: 1,
  },

  // Status
  statusCard: {
    margin: 20,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  statusGradient: {
    padding: 20,
  },
  statusContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
    lineHeight: 20,
  },

  // Sections
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 16,
  },

  // Info Card
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "500",
    lineHeight: 22,
  },

  // Photos
  photosContainer: {
    paddingLeft: 0,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: COLORS.background,
  },

  // Contact
  contactCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  contactSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 20,
    lineHeight: 20,
  },
  contactButtons: {
    flexDirection: "row",
    gap: 12,
  },
  contactButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  contactButtonSecondary: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.white,
  },
  contactButtonTextSecondary: {
    color: COLORS.primary,
  },

  bottomSpace: {
    height: 20,
  },
});

export default ReportDetailsScreen;
