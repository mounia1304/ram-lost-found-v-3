// AllReportsScreen.js - Toutes les déclarations de l'utilisateur
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { firestore, auth } from "../../services/databaseService/firebaseConfig";

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
  shadow: "rgba(0, 0, 0, 0.1)",
};

const AllReportsScreen = ({ navigation }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all"); // all, pending, found, closed

  useEffect(() => {
    if (!auth.currentUser) {
      navigation.goBack();
      return;
    }

    const reportsQuery = query(
      collection(firestore, "lostObjects"),
      where("userId", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(reportsQuery, (snapshot) => {
      const reportsData = [];
      snapshot.forEach((doc) => {
        reportsData.push({ id: doc.id, ...doc.data() });
      });
      setReports(reportsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: { color: COLORS.caution, text: "En recherche", icon: "search" },
      found: {
        color: COLORS.success,
        text: "Retrouvé",
        icon: "checkmark-circle",
      },
      matched: { color: COLORS.info, text: "Correspondance", icon: "link" },
      recovered: {
        color: COLORS.success,
        text: "Récupéré",
        icon: "checkmark-done",
      },
      closed: { color: COLORS.textLight, text: "Fermé", icon: "close-circle" },
    };
    return statusMap[status] || statusMap.pending;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Date inconnue";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return "Date invalide";
    }
  };

  const getFilteredReports = () => {
    if (filter === "all") return reports;
    if (filter === "pending")
      return reports.filter((r) => r.status === "pending");
    if (filter === "found")
      return reports.filter((r) =>
        ["found", "matched", "recovered"].includes(r.status)
      );
    if (filter === "closed")
      return reports.filter((r) => r.status === "closed");
    return reports;
  };

  const getFilterCounts = () => {
    return {
      all: reports.length,
      pending: reports.filter((r) => r.status === "pending").length,
      found: reports.filter((r) =>
        ["found", "matched", "recovered"].includes(r.status)
      ).length,
      closed: reports.filter((r) => r.status === "closed").length,
    };
  };

  const FilterButton = ({ filterKey, label, count }) => {
    const isActive = filter === filterKey;
    return (
      <TouchableOpacity
        style={[styles.filterButton, isActive && styles.filterButtonActive]}
        onPress={() => setFilter(filterKey)}
      >
        <Text
          style={[
            styles.filterButtonText,
            isActive && styles.filterButtonTextActive,
          ]}
        >
          {label}
        </Text>
        {count > 0 && (
          <View
            style={[styles.filterBadge, isActive && styles.filterBadgeActive]}
          >
            <Text
              style={[
                styles.filterBadgeText,
                isActive && styles.filterBadgeTextActive,
              ]}
            >
              {count}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const ReportCard = ({ item }) => {
    const title = item.type === "autre" ? item.description : item.type;
    const statusInfo = getStatusInfo(item.status);

    return (
      <TouchableOpacity
        style={styles.reportCard}
        onPress={() =>
          navigation.navigate("ReportDetails", { reportId: item.id })
        }
      >
        <View style={styles.reportHeader}>
          <View style={styles.reportTitleContainer}>
            <Text style={styles.reportTitle} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.reportRef}>Réf: {item.ref || item.id}</Text>
          </View>
          <View
            style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}
          >
            <Ionicons name={statusInfo.icon} size={12} color={COLORS.white} />
            <Text style={styles.statusText}>{statusInfo.text}</Text>
          </View>
        </View>

        {item.description && item.type !== "autre" && (
          <Text style={styles.reportDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <View style={styles.reportFooter}>
          <View style={styles.reportMetadata}>
            <View style={styles.metadataItem}>
              <Ionicons
                name="location-outline"
                size={14}
                color={COLORS.textLight}
              />
              <Text style={styles.metadataText} numberOfLines={1}>
                {item.location || "Lieu non spécifié"}
              </Text>
            </View>
            <View style={styles.metadataItem}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color={COLORS.textLight}
              />
              <Text style={styles.metadataText}>
                {formatDate(item.createdAt)}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
        </View>
      </TouchableOpacity>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="document-outline" size={64} color={COLORS.textLight} />
      <Text style={styles.emptyTitle}>
        {filter === "all" ? "Aucune déclaration" : "Aucun résultat"}
      </Text>
      <Text style={styles.emptyDescription}>
        {filter === "all"
          ? "Vous n'avez pas encore fait de déclaration d'objet perdu"
          : "Aucune déclaration ne correspond à ce filtre"}
      </Text>
      {filter === "all" && (
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => navigation.navigate("ReportLost")}
        >
          <Ionicons name="add" size={20} color={COLORS.white} />
          <Text style={styles.emptyButtonText}>Faire une déclaration</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </SafeAreaView>
    );
  }

  const filteredReports = getFilteredReports();
  const filterCounts = getFilterCounts();

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
        <Text style={styles.headerTitle}>Mes déclarations</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{reports.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{filterCounts.pending}</Text>
          <Text style={styles.statLabel}>En cours</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{filterCounts.found}</Text>
          <Text style={styles.statLabel}>Trouvés</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <FilterButton filterKey="all" label="Tout" count={filterCounts.all} />
        <FilterButton
          filterKey="pending"
          label="En cours"
          count={filterCounts.pending}
        />
        <FilterButton
          filterKey="found"
          label="Trouvés"
          count={filterCounts.found}
        />
        <FilterButton
          filterKey="closed"
          label="Fermés"
          count={filterCounts.closed}
        />
      </View>

      {/* Reports List */}
      <FlatList
        data={filteredReports}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ReportCard item={item} />}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={<EmptyState />}
      />
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

  // Stats
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
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
  },

  // Filters
  filtersContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.textSecondary,
  },
  filterButtonTextActive: {
    color: COLORS.white,
  },
  filterBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.textLight,
    justifyContent: "center",
    alignItems: "center",
  },
  filterBadgeActive: {
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.white,
  },
  filterBadgeTextActive: {
    color: COLORS.white,
  },

  // List
  list: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },

  // Report Card
  reportCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 1,
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  reportTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 2,
  },
  reportRef: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: "500",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.white,
  },
  reportDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  reportFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  reportMetadata: {
    flex: 1,
    gap: 4,
  },
  metadataItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metadataText: {
    fontSize: 12,
    color: COLORS.textLight,
    flex: 1,
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.white,
  },
});

export default AllReportsScreen;
