import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { firestore, auth } from "../../services/databaseService/firebaseConfig";
import { format } from "date-fns";

const { width } = Dimensions.get("window");

// Charte graphique RAM simplifiée
const COLORS = {
  primary: "#C20831",
  secondary: "#A22032",
  tertiary: "#B49360",
  white: "#FFFFFF",
  background: "#FAFAFA",
  surface: "#FFFFFF",
  text: "#333231",
  textLight: "#7B7A78",
  textMuted: "#999999",
  border: "#EBEAE8",
  success: "#00875D",
  warning: "#B7501F",
  error: "#A90044",
  info: "#2790F1",
  shadow: "rgba(0, 0, 0, 0.1)",
};

const HomeScreen = ({ navigation }) => {
  const [userReports, setUserReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userFirstName, setUserFirstName] = useState("");

  useEffect(() => {
    if (!auth.currentUser) return;

    // Récupérer le prénom de l'utilisateur
    fetchUserName();

    // Récupérer les rapports
    const reportsQuery = query(
      collection(firestore, "lostObjects"),
      where("userId", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc"),
      limit(4)
    );

    const unsubscribe = onSnapshot(reportsQuery, (snapshot) => {
      const reports = [];
      snapshot.forEach((doc) => {
        reports.push({ id: doc.id, ...doc.data() });
      });
      setUserReports(reports);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchUserName = async () => {
    try {
      if (!auth.currentUser?.email) return;

      // Chercher par email
      const ownersQuery = query(
        collection(firestore, "ownersData"),
        where("email", "==", auth.currentUser.email)
      );

      const querySnapshot = await getDocs(ownersQuery);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        setUserFirstName(userData.firstName || "");
      } else {
        // Fallback sur le displayName de Firebase Auth
        const displayName = auth.currentUser?.displayName;
        if (displayName) {
          setUserFirstName(displayName.split(" ")[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching user name:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserName();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: { color: COLORS.warning, text: "En recherche", icon: "search" },
      found: { color: COLORS.success, text: "Retrouvé", icon: "check-circle" },
      matched: { color: COLORS.info, text: "Match trouvé", icon: "link" },
      recovered: { color: COLORS.success, text: "Récupéré", icon: "done-all" },
      closed: { color: COLORS.textMuted, text: "Fermé", icon: "close" },
    };
    return statusMap[status] || statusMap.pending;
  };

  const StatCard = ({ icon, count, label }) => (
    <View style={styles.statCard}>
      <View style={styles.statIconContainer}>
        <Ionicons name={icon} size={20} color={COLORS.primary} />
      </View>
      <Text style={styles.statCount}>{count}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const ReportCard = ({ report }) => {
    const title = report.type === "autre" ? report.description : report.type;

    // Format date
    let dateFormatted = "Date inconnue";
    try {
      if (report.createdAt?.toDate) {
        dateFormatted = format(report.createdAt.toDate(), "dd/MM/yyyy");
      }
    } catch (error) {
      console.log("Date formatting error:", error);
    }

    const statusInfo = getStatusInfo(report.status);

    return (
      <TouchableOpacity
        style={styles.reportCard}
        onPress={() =>
          navigation.navigate("ReportDetails", { reportId: report.id })
        }
      >
        <View style={styles.reportHeader}>
          <Text style={styles.reportTitle} numberOfLines={1}>
            {title}
          </Text>
          <View
            style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}
          >
            <Text style={styles.statusText}>{statusInfo.text}</Text>
          </View>
        </View>

        {report.description && report.type !== "autre" && (
          <Text style={styles.reportDescription} numberOfLines={2}>
            {report.description}
          </Text>
        )}

        <View style={styles.reportFooter}>
          <Text style={styles.reportDate}>{dateFormatted}</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
        </View>
      </TouchableOpacity>
    );
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

  const activeReports = userReports.filter(
    (r) => r.status === "pending"
  ).length;
  const foundReports = userReports.filter(
    (r) => r.status === "recovered"
  ).length;
  const totalReports = userReports.length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header simple */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Bonjour</Text>
              <Text style={styles.userName}>{userFirstName || "Voyageur"}</Text>
            </View>

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate("ReportLost")}
            >
              <Ionicons name="add" size={20} color={COLORS.white} />
              <Text style={styles.addButtonText}>Déclarer</Text>
            </TouchableOpacity>
          </View>

          {/* Stats simples */}
          <View style={styles.statsContainer}>
            <StatCard
              icon="document-text-outline"
              count={totalReports}
              label="Total"
            />
            <StatCard
              icon="time-outline"
              count={activeReports}
              label="En cours"
            />
            <StatCard
              icon="checkmark-circle-outline"
              count={foundReports}
              label="Retrouvés"
            />
          </View>
        </LinearGradient>

        {/* Contenu principal */}
        <View style={styles.content}>
          {/* Actions rapides */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Actions rapides</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate("Search")}
              >
                <Ionicons name="search-outline" size={24} color={COLORS.info} />
                <Text style={styles.actionText}>Rechercher</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate("FoundChoice")}
              >
                <Ionicons
                  name="flag-outline"
                  size={24}
                  color={COLORS.success}
                />
                <Text style={styles.actionText}>Objet trouvé</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate("Profile")}
              >
                <Ionicons
                  name="person-outline"
                  size={24}
                  color={COLORS.tertiary}
                />
                <Text style={styles.actionText}>Profil</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate("Help")}
              >
                <Ionicons
                  name="help-circle-outline"
                  size={24}
                  color={COLORS.warning}
                />
                <Text style={styles.actionText}>Aide</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Mes déclarations */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Mes déclarations</Text>
              {userReports.length > 0 && (
                <TouchableOpacity
                  onPress={() => navigation.navigate("AllReports")}
                >
                  <Text style={styles.seeAllText}>Voir tout</Text>
                </TouchableOpacity>
              )}
            </View>

            {userReports.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="document-outline"
                  size={48}
                  color={COLORS.textMuted}
                />
                <Text style={styles.emptyTitle}>Aucune déclaration</Text>
                <Text style={styles.emptyDescription}>
                  Commencez par déclarer votre premier objet perdu
                </Text>
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => navigation.navigate("ReportLost")}
                >
                  <Text style={styles.emptyButtonText}>
                    Déclarer maintenant
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.reportsContainer}>
                {userReports.map((report) => (
                  <ReportCard key={report.id} report={report} />
                ))}
              </View>
            )}
          </View>

          {/* Conseil */}
          <View style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <Ionicons name="bulb-outline" size={20} color={COLORS.warning} />
              <Text style={styles.tipTitle}>Conseil</Text>
            </View>
            <Text style={styles.tipText}>
              Ajoutez des photos et une description précise pour augmenter vos
              chances de retrouver votre objet.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#7B7A78",
  },

  // Header
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  greeting: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 4,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  // Stats
  statsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statCount: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },

  // Content
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333231",
  },
  seeAllText: {
    fontSize: 14,
    color: "#C20831",
    fontWeight: "500",
  },

  // Actions
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    width: (width - 56) / 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#EBEAE8",
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333231",
    marginTop: 8,
    textAlign: "center",
  },

  // Reports
  reportsContainer: {
    gap: 12,
  },
  reportCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#EBEAE8",
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333231",
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  reportDescription: {
    fontSize: 14,
    color: "#7B7A78",
    marginBottom: 12,
    lineHeight: 18,
  },
  reportFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reportDate: {
    fontSize: 12,
    color: "#999999",
  },

  // Empty State
  emptyState: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#EBEAE8",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333231",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#7B7A78",
    textAlign: "center",
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: "#C20831",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  // Tip Card
  tipCard: {
    backgroundColor: "#FEF0E3",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#B7501F",
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#B7501F",
    marginLeft: 8,
  },
  tipText: {
    fontSize: 14,
    color: "#333231",
    lineHeight: 18,
  },
});

export default HomeScreen;
