// AboutScreen.js - Présentation du service RAM Lost & Found (UI Simple)
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
  shadow: "rgba(0, 0, 0, 0.1)",
};

const AboutScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>À propos</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Image
            source={require("../../assets/logoRam.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.logoTitle}>RAM Lost & Found</Text>
          <Text style={styles.logoSubtitle}>
            Service de gestion d'objets perdus
          </Text>
        </View>

        {/* Mission */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people-outline" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Notre Mission</Text>
          </View>
          <Text style={styles.text}>
            Offrir une meilleure expérience de voyage en éliminant le stress lié
            à la perte d'objets. Nous transformons un moment d'angoisse en
            tranquillité d'esprit grâce à notre technologie intelligente et
            notre équipe dédiée. Parce que voyager doit rimer avec sérénité,
            nous nous engageons à protéger ce qui vous est précieux, où que vous
            soyez.
          </Text>
        </View>

        {/* Statistiques */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="stats-chart-outline"
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.sectionTitle}>Nos Résultats</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>98%</Text>
              <Text style={styles.statLabel}>Satisfaction client</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>85%</Text>
              <Text style={styles.statLabel}>Objets retrouvés</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>24/7</Text>
              <Text style={styles.statLabel}>Support disponible</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>2j</Text>
              <Text style={styles.statLabel}>Temps de traitement</Text>
            </View>
          </View>
        </View>

        {/* Services */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cog-outline" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Nos Services</Text>
          </View>

          <View style={styles.serviceCard}>
            <Ionicons name="search-outline" size={24} color={COLORS.info} />
            <View style={styles.serviceContent}>
              <Text style={styles.serviceTitle}>Recherche Intelligente</Text>
              <Text style={styles.serviceText}>
                Intelligence artificielle pour identifier et retrouver vos
                objets rapidement
              </Text>
            </View>
          </View>

          <View style={styles.serviceCard}>
            <Ionicons name="people-outline" size={24} color={COLORS.success} />
            <View style={styles.serviceContent}>
              <Text style={styles.serviceTitle}>Agents Experts</Text>
              <Text style={styles.serviceText}>
                Équipes formées et disponible pour vous accompagner
                personnellement
              </Text>
            </View>
          </View>

          <View style={styles.serviceCard}>
            <Ionicons name="flash-outline" size={24} color={COLORS.caution} />
            <View style={styles.serviceContent}>
              <Text style={styles.serviceTitle}>Traitement Rapide</Text>
              <Text style={styles.serviceText}>
                Déclarations traitées instantanément avec notifications en temps
                réel
              </Text>
            </View>
          </View>
        </View>

        {/* Comment ça marche */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="help-circle-outline"
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.sectionTitle}>Comment ça marche</Text>
          </View>

          <View style={styles.processContainer}>
            <View style={styles.processStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Faites votre déclaration</Text>
                <Text style={styles.stepText}>
                  Décrivez votre objet avec des photos et détails
                </Text>
              </View>
            </View>

            <View style={styles.processStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Recherche automatique</Text>
                <Text style={styles.stepText}>
                  Notre IA recherche dans nos bases de données
                </Text>
              </View>
            </View>

            <View style={styles.processStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Notification</Text>
                <Text style={styles.stepText}>
                  Vous êtes alerté dès qu'une correspondance est trouvée
                </Text>
              </View>
            </View>

            <View style={styles.processStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Récupération</Text>
                <Text style={styles.stepText}>
                  Récupérez votre objet dans nos centres
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="call-outline" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Contact</Text>
          </View>

          <View style={styles.contactCard}>
            <Text style={styles.contactTitle}>Service Client 24h/7j</Text>
            <Text style={styles.contactText}>📞 +212 522 48 97 97</Text>
            <Text style={styles.contactText}>
              📧lostandfound@royalairmaroc.com
            </Text>
            <Text style={styles.contactText}>🌐 www.royalairmaroc.com</Text>
          </View>
        </View>

        {/* CTA */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Objet perdu ?</Text>
          <Text style={styles.ctaText}>
            Déclarez-le maintenant et laissez notre technologie vous aider
          </Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => navigation.navigate("whereLost")}
          >
            <Text style={styles.ctaButtonText}>Faire une déclaration</Text>
            <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
          </TouchableOpacity>
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

  // Header
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
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

  // Logo Section
  logoSection: {
    backgroundColor: COLORS.surface,
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  logo: {
    width: 120,
    height: 80,
    marginBottom: 16,
  },
  logoTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  logoSubtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: "center",
  },

  // Sections
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginLeft: 8,
  },
  text: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },

  // Stats
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    width: "48%",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: "center",
  },

  // Services
  serviceCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  serviceContent: {
    flex: 1,
    marginLeft: 12,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  serviceText: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
  },

  // Process
  processContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  processStep: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.white,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  stepText: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
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
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },

  // CTA
  ctaSection: {
    margin: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  ctaText: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  ctaButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.white,
    marginRight: 8,
  },

  bottomSpace: {
    height: 20,
  },
});

export default AboutScreen;
