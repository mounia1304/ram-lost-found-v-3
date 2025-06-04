import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  Animated,
  Dimensions,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const COLORS = {
  primary: "#c2002f",
  primaryDark: "#a4001f",
  secondary: "#003366",
  gold: "#d4af37",
  light: "#ffffff",
  background: "#f8f9fa",
  text: "#333333",
  textLight: "#767676",
  border: "#e0e0e0",
  success: "#28a745",
  card: "#ffffff",
};

const ramLogo = {
  uri: "https://www.royalairmaroc.com/content/dam/royal-air-maroc/Static/logo_ram_arabic-english.png",
};
const headerBg = {
  uri: "https://images.unsplash.com/photo-1587019158091-1a103c5dd17f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
};

const HomeScreen = ({ navigation }) => {
  const [isAtlasVisible, setIsAtlasVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("lost");
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("FR");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [140, 80],
    extrapolate: "clamp",
  });

  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [40, 80],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const headerContentOpacity = scrollY.interpolate({
    inputRange: [0, 40],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const atlasAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(atlasAnimation, {
      toValue: isAtlasVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isAtlasVisible]);

  const atlasTransform = {
    transform: [
      {
        translateY: atlasAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [300, 0],
        }),
      },
    ],
    opacity: atlasAnimation,
  };

  const handleAuthenticatedNavigation = (screen) => {
    if (!isAuthenticated) {
      navigation.navigate("Login", {
        returnTo: screen,
        message: "Veuillez vous connecter pour continuer",
      });
    } else {
      handleNavigate(screen);
    }
  };

  const toggleAtlas = () => {
    setIsAtlasVisible(!isAtlasVisible);
  };

  const toggleMenu = () => {
    setIsMenuVisible(!isMenuVisible);
  };

  const handleNavigate = (screen) => {
    console.log(`Navigating to ${screen}`);
    if (navigation) {
      navigation.navigate(screen);
    }
  };

  const changeLanguage = (lang) => {
    setSelectedLanguage(lang);
    setIsMenuVisible(false);
  };

  const renderLanguageMenu = () => {
    return (
      <Modal
        transparent={true}
        visible={isMenuVisible}
        animationType="fade"
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Langue / Language</Text>
              <TouchableOpacity onPress={() => setIsMenuVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.menuItem,
                selectedLanguage === "FR" && styles.menuItemSelected,
              ]}
              onPress={() => changeLanguage("FR")}
            >
              <Text style={styles.menuItemText}>Français</Text>
              {selectedLanguage === "FR" && (
                <Ionicons name="checkmark" size={20} color={COLORS.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.menuItem,
                selectedLanguage === "EN" && styles.menuItemSelected,
              ]}
              onPress={() => changeLanguage("EN")}
            >
              <Text style={styles.menuItemText}>English</Text>
              {selectedLanguage === "EN" && (
                <Ionicons name="checkmark" size={20} color={COLORS.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.menuItem,
                selectedLanguage === "AR" && styles.menuItemSelected,
              ]}
              onPress={() => changeLanguage("AR")}
            >
              <Text style={styles.menuItemText}>العربية</Text>
              {selectedLanguage === "AR" && (
                <Ionicons name="checkmark" size={20} color={COLORS.primary} />
              )}
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setIsMenuVisible(false);
                handleAuthenticatedNavigation("profileTabs");
              }}
            >
              <Ionicons
                name="person-outline"
                size={20}
                color={COLORS.text}
                style={styles.menuItemIcon}
              />
              <Text style={styles.menuItemText}>Mon Profil</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setIsMenuVisible(false);
                handleNavigate("Settings");
              }}
            >
              <Ionicons
                name="settings-outline"
                size={20}
                color={COLORS.text}
                style={styles.menuItemIcon}
              />
              <Text style={styles.menuItemText}>Paramètres</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  const getTabSubtitle = () => {
    if (activeTab === "lost") {
      return "Retrouvez vos objets personnels perdus dans les aéroports ou pendant vos vols";
    } else {
      return "Signalez un objet que vous avez trouvé pour aider son propriétaire à le récupérer";
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <Image source={headerBg} style={styles.headerBg} />
        <View style={styles.headerOverlay} />

        <View style={styles.headerContent}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
              <Ionicons name="menu" size={24} color="white" />
            </TouchableOpacity>
            <Image source={ramLogo} style={styles.logo} resizeMode="contain" />
            <View style={{ width: 24 }} />
          </View>

          <Animated.View
            style={[
              styles.headerTitleContainer,
              { opacity: headerTitleOpacity },
            ]}
          >
            <Text style={styles.headerTitle}>RAM Lost & Found</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.headerMainContent,
              { opacity: headerContentOpacity },
            ]}
          >
            <Text style={styles.welcomeText}>Bienvenue dans</Text>
            <Text style={styles.appTitle}>RAM Lost & Found</Text>
            <Text style={styles.appSubtitle}>
              Retrouvez vos objets en quelques clics
            </Text>
          </Animated.View>
        </View>
      </Animated.View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "lost" && styles.activeTab]}
          onPress={() => setActiveTab("lost")}
        >
          <Ionicons
            name="search"
            size={20}
            color={activeTab === "lost" ? COLORS.primary : COLORS.textLight}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "lost" && styles.activeTabText,
            ]}
          >
            Objets perdus
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "found" && styles.activeTab]}
          onPress={() => setActiveTab("found")}
        >
          <Ionicons
            name="flag"
            size={20}
            color={activeTab === "found" ? COLORS.primary : COLORS.textLight}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "found" && styles.activeTabText,
            ]}
          >
            Objets trouvés
          </Text>
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.serviceDescriptionContainer}>
          <Text style={styles.serviceDescription}>{getTabSubtitle()}</Text>
        </View>

        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={styles.mainActionButton}
            onPress={() => {
              if (activeTab === "lost") {
                handleAuthenticatedNavigation("ReportLost");
              } else {
                handleNavigate("FoundChoice");
              }
            }}
          >
            <View style={styles.actionButtonGradient}>
              <Ionicons name="add-circle-outline" size={24} color="white" />
              <Text style={styles.actionButtonText}>
                {activeTab === "lost"
                  ? "Déclarer un objet perdu"
                  : "Déclarer un objet trouvé"}
              </Text>
            </View>
          </TouchableOpacity>
          <View style={styles.smallActionsRow}>
            <TouchableOpacity
              style={styles.smallActionButton}
              onPress={() => handleAuthenticatedNavigation("profileTabs")}
            >
              <View style={styles.smallActionIconContainer}>
                <Ionicons name="list" size={22} color={COLORS.primary} />
              </View>
              <Text style={styles.smallActionText}>Mes déclarations</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.smallActionButton}
              onPress={() => handleNavigate("SearchDoc")}
            >
              <View style={styles.smallActionIconContainer}>
                <Ionicons name="locate" size={22} color={COLORS.primary} />
              </View>
              <Text style={styles.smallActionText}>Suivi de dossier</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.howItWorksContainer}>
          <Text style={styles.sectionTitle}>Comment ça marche ?</Text>

          <View style={styles.stepsContainer}>
            <View style={styles.stepItem}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Déclaration</Text>
                <Text style={styles.stepDescription}>
                  Déclarez votre objet perdu ou trouvé avec une description
                  détaillée
                </Text>
              </View>
            </View>

            <View style={styles.stepConnector} />

            <View style={styles.stepItem}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Recherche</Text>
                <Text style={styles.stepDescription}>
                  Notre équipe recherche l'objet dans nos centres de collecte
                </Text>
              </View>
            </View>

            <View style={styles.stepConnector} />

            <View style={styles.stepItem}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Récupération</Text>
                <Text style={styles.stepDescription}>
                  Récupérez l'objet dans l'un de nos centres ou par livraison
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.tipsContainer}>
          <Text style={styles.sectionTitle}>Conseils utiles</Text>

          <View style={styles.tipCard}>
            <View style={styles.tipIconContainer}>
              <Ionicons name="time-outline" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Délai de conservation</Text>
              <Text style={styles.tipDescription}>
                Les objets trouvés sont conservés pendant 90 jours dans nos
                centres avant d'être remis aux autorités.
              </Text>
            </View>
          </View>

          <View style={styles.tipCard}>
            <View style={styles.tipIconContainer}>
              <Ionicons
                name="document-text-outline"
                size={24}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Documents nécessaires</Text>
              <Text style={styles.tipDescription}>
                Pour récupérer un objet, vous devrez présenter une pièce
                d'identité et le numéro de référence de votre déclaration.
              </Text>
            </View>
          </View>

          <View style={styles.tipCard}>
            <View style={styles.tipIconContainer}>
              <Ionicons
                name="camera-outline"
                size={24}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Photos</Text>
              <Text style={styles.tipDescription}>
                Ajouter une photo à votre déclaration augmente les chances de
                retrouver votre objet de 65%.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Nos performances</Text>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View
                style={[styles.statCircle, { borderColor: COLORS.success }]}
              >
                <Text style={[styles.statValue, { color: COLORS.success }]}>
                  95%
                </Text>
              </View>
              <Text style={styles.statLabel}>Taux de récupération</Text>
            </View>

            <View style={styles.statCard}>
              <View
                style={[styles.statCircle, { borderColor: COLORS.primary }]}
              >
                <Text style={[styles.statValue, { color: COLORS.primary }]}>
                  24h
                </Text>
              </View>
              <Text style={styles.statLabel}>Délai de réponse</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statCircle, { borderColor: COLORS.gold }]}>
                <Text style={[styles.statValue, { color: COLORS.gold }]}>
                  90j
                </Text>
              </View>
              <Text style={styles.statLabel}>Conservation</Text>
            </View>
          </View>
        </View>

        <View style={styles.contactContainer}>
          <View style={styles.contactContent}>
            <Text style={styles.contactTitle}>Besoin d'aide ?</Text>
            <Text style={styles.contactDescription}>
              Notre service client est disponible pour vous aider à retrouver
              vos objets perdus.
            </Text>

            <View style={styles.contactButtonsRow}>
              <TouchableOpacity style={styles.contactButton}>
                <Ionicons
                  name="call-outline"
                  size={20}
                  color={COLORS.secondary}
                />
                <Text style={styles.contactButtonText}>Appeler</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.contactButton}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={COLORS.secondary}
                />
                <Text style={styles.contactButtonText}>Email</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.contactInfoRow}>
              <View style={styles.contactInfoItem}>
                <Ionicons
                  name="time-outline"
                  size={18}
                  color="rgba(255,255,255,0.8)"
                />
                <Text style={styles.contactInfoText}>Lun-Ven: 8h-18h</Text>
              </View>

              <View style={styles.contactInfoItem}>
                <Ionicons
                  name="globe-outline"
                  size={18}
                  color="rgba(255,255,255,0.8)"
                />
                <Text style={styles.contactInfoText}>
                  Assistance multilingue
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </Animated.ScrollView>

      {renderLanguageMenu()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: "hidden",
  },
  headerBg: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  headerOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(194, 0, 47, 0.8)",
  },
  headerContent: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  menuButton: {
    padding: 5,
  },
  logo: {
    height: 30,
    width: 120,
  },
  headerTitleContainer: {
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    marginBottom: 0,
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  headerMainContent: {
    marginBottom: 15,
    alignItems: "center",
  },
  welcomeText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 16,
    marginBottom: 5,
  },
  appTitle: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 5,
  },
  appSubtitle: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    marginHorizontal: 20,
    marginTop: 150,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 20,
    marginTop: 115,
    marginBottom: 0,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.textLight,
    fontWeight: "500",
    marginLeft: 8,
    marginTop: 0,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
    marginTop: 10,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 30,
  },
  serviceDescriptionContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  serviceDescription: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
    textAlign: "center",
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  mainActionButton: {
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 15,
  },
  actionButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    backgroundColor: COLORS.primary,
  },
  actionButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 10,
  },
  smallActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  smallActionButton: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  smallActionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(194, 0, 47, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  smallActionText: {
    color: COLORS.text,
    fontWeight: "500",
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 15,
  },
  howItWorksContainer: {
    backgroundColor: "white",
    margin: 20,
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  stepsContainer: {
    marginTop: 10,
  },
  stepItem: {
    flexDirection: "row",
    marginBottom: 15,
  },
  stepNumberBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  stepNumber: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  stepConnector: {
    width: 2,
    height: 20,
    backgroundColor: "#e0e0e0",
    marginLeft: 18,
    marginBottom: 15,
  },
  tipsContainer: {
    backgroundColor: "white",
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tipCard: {
    flexDirection: "row",
    marginBottom: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 15,
  },
  tipIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(194, 0, 47, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 13,
    color: COLORS.textLight,
    lineHeight: 18,
  },
  statsContainer: {
    backgroundColor: "white",
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  statCard: {
    alignItems: "center",
    width: "30%",
  },
  statCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: "center",
  },
  contactContainer: {
    margin: 20,
    marginTop: 0,
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    backgroundColor: COLORS.secondary,
  },
  contactContent: {
    padding: 20,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  contactDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 20,
    marginBottom: 20,
  },
  contactButtonsRow: {
    flexDirection: "row",
    marginBottom: 15,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 10,
  },
  contactButtonText: {
    color: COLORS.secondary,
    fontWeight: "600",
    marginLeft: 8,
  },
  contactInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  contactInfoItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  contactInfoText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginLeft: 5,
  },
  bottomSpace: {
    height: 80,
  },
  Button: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuContainer: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  menuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuItemSelected: {
    backgroundColor: "#f9f9f9",
  },
  menuItemText: {
    fontSize: 16,
    color: COLORS.text,
  },
  menuItemIcon: {
    marginRight: 10,
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 12,
  },
});

export default HomeScreen;
