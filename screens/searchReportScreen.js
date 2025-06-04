import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  TouchableOpacity,
  Image,
} from "react-native";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Feather, Ionicons } from "@expo/vector-icons";
import { firestore } from "../services/databaseService/firebaseConfig";

// Couleurs RAM basées sur la palette fournie
const COLORS = {
  primary: "#C20831",
  secondary: "#A22032",
  tertiary: "#B49360",
  neutral0: "#FFFFFF",
  neutral100: "#FAFAFA",
  neutral200: "#EBEAE8",
  neutral500: "#C2C1BE",
  neutral700: "#7B7A78",
  neutral900: "#333231",
  textDefault: "#595855",
  textInverse: "#FFFFFF",
  textLight: "#999999",
  textDark: "#1A1717",
  backgroundDefault: "#FFFFFF",
  backgroundAlternative: "#F7F7F7",
  backgroundAccent1: "#F0DDDD",
  backgroundAccent2: "#F6F2ED",
  borderDefault: "#D8D7D4",
  borderDark: "#929292",
  iconDefault: "#C20831",
  positive: "#00875D",
  negative: "#A90044",
  caution: "#B7501F",
  informative: "#2790F1",
};

export default function ClaimLookupScreen({ navigation }) {
  const [ref, setRef] = useState("");
  const [loading, setLoading] = useState(false);
  const [objectData, setObjectData] = useState(null);

  const searchByRef = async () => {
    if (!ref.trim())
      return Alert.alert("Erreur", "Veuillez entrer une référence valide.");

    setLoading(true);
    setObjectData(null);

    try {
      const q = query(
        collection(firestore, "lostObjects"),
        where("ref", "==", ref.trim())
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        setObjectData({ id: doc.id, ...doc.data() });
      } else {
        Alert.alert("Introuvable", "Aucun objet trouvé avec cette référence.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Erreur", "Une erreur est survenue lors de la recherche.");
    } finally {
      setLoading(false);
    }
  };

  const renderStatusBlock = () => {
    if (!objectData?.status) return null;

    const status = objectData.status;
    const contactBlock = (
      <View style={styles.contactBox}>
        <Text style={styles.contactTitle}>
          <Ionicons name="call" size={16} color={COLORS.primary} /> Contactez le
          Service Objets Trouvés
        </Text>
        <Text style={styles.contactText}>
          <Ionicons name="mail" size={14} color={COLORS.secondary} />{" "}
          lostfound@royalairmaroc.com
        </Text>
        <Text style={styles.contactText}>
          <Ionicons name="phone-portrait" size={14} color={COLORS.secondary} />{" "}
          +212 522 48 97 97
        </Text>
      </View>
    );

    switch (status) {
      case "lost":
        return (
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusIcon,
                { backgroundColor: COLORS.backgroundSemanticInformative },
              ]}
            >
              <Ionicons name="time" size={20} color={COLORS.informative} />
            </View>
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusTitle}>Déclaration enregistrée</Text>
              <Text style={styles.statusDescription}>
                Votre déclaration est en cours d'analyse par notre équipe.
              </Text>
            </View>
          </View>
        );
      case "matched":
        return (
          <View>
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusIcon,
                  { backgroundColor: COLORS.backgroundSemanticPositive },
                ]}
              >
                <Ionicons name="search" size={20} color={COLORS.positive} />
              </View>
              <View style={styles.statusTextContainer}>
                <Text style={styles.statusTitle}>Correspondance trouvée !</Text>
                <Text style={styles.statusDescription}>
                  Nous avons trouvé un objet correspondant à votre description.
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() => navigation.navigate("profileTabs")}
            >
              <Text style={styles.detailsButtonText}>Voir les détails</Text>
              <Ionicons
                name="arrow-forward"
                size={16}
                color={COLORS.textInverse}
              />
            </TouchableOpacity>
          </View>
        );
      case "confirmed":
        return (
          <View>
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusIcon,
                  { backgroundColor: COLORS.backgroundSemanticPositive },
                ]}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={COLORS.positive}
                />
              </View>
              <View style={styles.statusTextContainer}>
                <Text style={styles.statusTitle}>Objet identifié</Text>
                <Text style={styles.statusDescription}>
                  Notre service vous contactera sous peu pour organiser la
                  restitution.
                </Text>
              </View>
            </View>
            {contactBlock}
          </View>
        );
      case "returned":
        return (
          <View>
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusIcon,
                  { backgroundColor: COLORS.backgroundSemanticPositive },
                ]}
              >
                <Ionicons
                  name="checkmark-done"
                  size={20}
                  color={COLORS.positive}
                />
              </View>
              <View style={styles.statusTextContainer}>
                <Text style={styles.statusTitle}>Objet restitué</Text>
                <Text style={styles.statusDescription}>
                  Cet objet a déjà été récupéré par son propriétaire.
                </Text>
              </View>
            </View>
            {contactBlock}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* En-tête RAM */}
          <View style={styles.header}>
            <Image
              source={require("../assets/logoRam.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.headerTitle}>Suivi des Objets Trouvés</Text>
            <Text style={styles.headerSubtitle}>Royal Air Maroc</Text>
          </View>

          {/* Carte de recherche */}
          <View style={styles.card}>
            <Text style={styles.title}>Rechercher une déclaration</Text>
            <Text style={styles.subtitle}>
              Entrez votre numéro de référence pour suivre l'avancement
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                placeholder="LST0000"
                placeholderTextColor={COLORS.textLight}
                value={ref}
                onChangeText={setRef}
                style={styles.input}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={styles.searchIcon}
                onPress={searchByRef}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.primary} />
                ) : (
                  <Ionicons name="search" size={24} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Résultats */}
          {objectData && (
            <View style={[styles.card, styles.resultCard]}>
              <View style={styles.refContainer}>
                <Text style={styles.refLabel}>Référence:</Text>
                <Text style={styles.ref}>
                  {objectData.ref || objectData.id}
                </Text>
              </View>

              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <Feather name="box" size={18} color={COLORS.tertiary} />
                  </View>
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailLabel}>Type d'objet</Text>
                    <Text style={styles.detailValue}>{objectData.type}</Text>
                  </View>
                </View>

                {objectData.description && (
                  <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                      <Feather
                        name="file-text"
                        size={18}
                        color={COLORS.tertiary}
                      />
                    </View>
                    <View style={styles.detailTextContainer}>
                      <Text style={styles.detailLabel}>Description</Text>
                      <Text style={styles.detailValue}>
                        {objectData.additionalDetails}
                      </Text>
                    </View>
                  </View>
                )}

                <View style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <Feather name="map-pin" size={18} color={COLORS.tertiary} />
                  </View>
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailLabel}>Lieu</Text>
                    <Text style={styles.detailValue}>
                      {objectData.location}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <Feather
                      name="calendar"
                      size={18}
                      color={COLORS.tertiary}
                    />
                  </View>
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailLabel}>Date</Text>
                    <Text style={styles.detailValue}>
                      {new Date(
                        objectData.createdAt?.seconds * 1000
                      ).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.statusWrapper}>{renderStatusBlock()}</View>
            </View>
          )}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: COLORS.neutral100,
    flexGrow: 1,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  logo: {
    width: 120,
    height: 60,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: COLORS.primary,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.textDefault,
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.neutral0,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  resultCard: {
    borderTopWidth: 4,
    borderTopColor: COLORS.primary,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textDark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.borderDefault,
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: COLORS.neutral0,
  },
  input: {
    flex: 1,
    height: 48,
    color: COLORS.textDark,
    fontSize: 16,
  },
  searchIcon: {
    padding: 8,
  },
  refContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderDefault,
  },
  refLabel: {
    fontWeight: "500",
    color: COLORS.textDefault,
    fontSize: 16,
    marginRight: 8,
  },
  ref: {
    fontWeight: "600",
    color: COLORS.primary,
    fontSize: 16,
  },
  detailsContainer: {
    marginVertical: 8,
  },
  detailRow: {
    flexDirection: "row",
    marginVertical: 12,
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.backgroundAccent2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.textDark,
    fontWeight: "500",
  },
  statusWrapper: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderDefault,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textDark,
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 14,
    color: COLORS.textDefault,
    lineHeight: 20,
  },
  contactBox: {
    backgroundColor: COLORS.backgroundAccent2,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.tertiary,
    marginTop: 12,
  },
  contactTitle: {
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 8,
    fontSize: 15,
  },
  contactText: {
    fontSize: 14,
    color: COLORS.textDefault,
    marginBottom: 6,
    marginLeft: 4,
  },
  detailsButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 12,
  },
  detailsButtonText: {
    color: COLORS.textInverse,
    fontWeight: "600",
    fontSize: 15,
    marginRight: 8,
  },
});
