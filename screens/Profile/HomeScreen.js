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
} from "firebase/firestore";
import { firestore, auth } from "../../services/databaseService/firebaseConfig";
import { format } from "date-fns";
const { width } = Dimensions.get("window");

const HomeScreen = ({ navigation }) => {
  const [userReports, setUserReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    if (!auth.currentUser) return;

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

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: { color: "#FF6B35", text: "En recherche", icon: "search" },
      found: { color: "#10B981", text: "Retrouvé", icon: "checkmark-circle" },
      matched: { color: "#3B82F6", text: "Match trouvé", icon: "link" },
      closed: { color: "#6B7280", text: "Fermé", icon: "close-circle" },
    };
    return statusMap[status] || statusMap.pending;
  };

  const StatCard = ({ icon, count, label, onPress }) => (
    <TouchableOpacity style={styles.statCard} onPress={onPress}>
      <View style={styles.statIcon}>
        <Ionicons name={icon} size={24} color="#D80000" />
      </View>
      <Text style={styles.statCount}>{count}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const ReportCard = ({ report, onPress }) => {
    const isAutre = report.type?.toLowerCase() === "autre";
    const title = isAutre ? report.description : report.type;
    const subtitle = report.description;

    // Format date
    let createdAtFormatted = "Date inconnue";
    try {
      let dateObj;
      if (report.createdAt?.toDate) {
        dateObj = report.createdAt.toDate();
      } else if (
        typeof report.createdAt === "string" ||
        typeof report.createdAt === "number"
      ) {
        dateObj = new Date(report.createdAt);
      }
      if (dateObj instanceof Date && !isNaN(dateObj)) {
        createdAtFormatted = format(dateObj, "dd/MM/yyyy HH:mm");
      }
    } catch (error) {}

    // Style/type d'objet
    const getStatusStyle = (status) => {
      switch (status) {
        case "lost":
          return { color: "#d9534f", label: "Perdu", icon: "search" };
        case "found":
          return { color: "#5cb85c", label: "Trouvé", icon: "flag" };
        case "matched":
          return { color: "#0275d8", label: "Matché", icon: "compare-arrows" };
        default:
          return { color: "#999", label: "Autre", icon: "info" };
      }
    };

    const status = getStatusStyle(report.status);

    return (
      <TouchableOpacity onPress={onPress} style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
            <Icon
              name={status.icon}
              size={14}
              color="#fff"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.statusText}>{status.label}</Text>
          </View>
        </View>

        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        <Text style={styles.date}>Déclaré le {createdAtFormatted}</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D80000" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  const activeReports = userReports.filter(
    (r) => r.status === "pending"
  ).length;
  const foundReports = userReports.filter((r) => r.status === "found").length;
  const totalReports = userReports.length;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
      <LinearGradient
        colors={["#D80000", "#B71C1C"]}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Bonjour,</Text>
            <Text style={styles.userNameText}>
              {auth.currentUser?.displayName || "Voyageur"}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("ReportLost")}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.addButtonText}>Déclarer</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard
            icon="document-text"
            count={totalReports}
            label="Déclarations"
          />
          <StatCard icon="hourglass" count={activeReports} label="En cours" />
          <StatCard
            icon="checkmark-done"
            count={foundReports}
            label="Retrouvés"
          />
        </View>
      </LinearGradient>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Activité récente</Text>
            {userReports.length > 3 && (
              <TouchableOpacity>
                <Text style={styles.seeAllText}>Voir tout</Text>
              </TouchableOpacity>
            )}
          </View>

          {userReports.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="briefcase-outline" size={48} color="#D1D5DB" />
              </View>
              <Text style={styles.emptyTitle}>Aucune déclaration</Text>
              <Text style={styles.emptySubtitle}>
                Commencez par déclarer votre premier objet perdu
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => navigation.navigate("ReportLost")}
              >
                <Text style={styles.emptyButtonText}>Déclarer maintenant</Text>
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

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionTile}
              onPress={() => navigation.navigate("Notifications")}
            >
              <LinearGradient
                colors={["#FF6B35", "#F7931E"]}
                style={styles.actionGradient}
              >
                <Ionicons name="notifications" size={24} color="white" />
              </LinearGradient>
              <Text style={styles.actionLabel}>Notifications</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionTile}>
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                style={styles.actionGradient}
              >
                <Ionicons name="search" size={24} color="white" />
              </LinearGradient>
              <Text style={styles.actionLabel}>Rechercher</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionTile}>
              <LinearGradient
                colors={["#f093fb", "#f5576c"]}
                style={styles.actionGradient}
              >
                <Ionicons name="analytics" size={24} color="white" />
              </LinearGradient>
              <Text style={styles.actionLabel}>Statistiques</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionTile}>
              <LinearGradient
                colors={["#4facfe", "#00f2fe"]}
                style={styles.actionGradient}
              >
                <Ionicons name="help-circle" size={24} color="white" />
              </LinearGradient>
              <Text style={styles.actionLabel}>Support</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tips Card */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={20} color="#F59E0B" />
            <Text style={styles.tipsTitle}>Conseil du jour</Text>
          </View>
          <Text style={styles.tipsText}>
            Ajoutez des photos et une description détaillée pour augmenter vos
            chances de retrouver votre objet.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
  },
  userNameText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginTop: 4,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  addButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  statIcon: {
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
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  seeAllText: {
    fontSize: 14,
    color: "#D80000",
    fontWeight: "500",
  },
  emptyState: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: "#D80000",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  emptyButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  reportsContainer: {
    gap: 12,
  },
  reportCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reportHeader: {
    marginBottom: 12,
  },
  reportTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
  },
  statusBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  reportSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  reportFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reportDate: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionTile: {
    width: (width - 56) / 2,
    alignItems: "center",
  },
  actionGradient: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
  },
  tipsCard: {
    backgroundColor: "#FFFBEB",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#92400E",
    marginLeft: 8,
  },
  tipsText: {
    fontSize: 14,
    color: "#78350F",
    lineHeight: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: "#999",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default HomeScreen;
