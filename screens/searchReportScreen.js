// screens/SearchReportScreen.js
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Modal,
  Alert,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BarCodeScanner } from "expo-barcode-scanner";
import { getLostReportByIref } from "../services/reportLostService";

const SearchReportScreen = ({ navigation }) => {
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);

  // Demander la permission pour utiliser la caméra
  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  // Gérer le scan d'un code QR
  const handleBarCodeScanned = ({ type, data }) => {
    setScannerVisible(false);
    if (data) {
      // Supposer que le QR contient directement l'ID du document
      searchByDocId(data);
    }
  };

  // Recherche par référence
  const handleReferenceSearch = async () => {
    if (!reference.trim()) {
      setError("Veuillez entrer une référence");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getLostReportByIref(reference);

      if (result) {
        // Si un résultat est trouvé, naviguer vers l'écran de détail
        navigation.navigate("ReportDetail", { report: result });
      } else {
        setError("Aucun rapport trouvé avec cette référence");
      }
    } catch (err) {
      console.error("Erreur de recherche:", err);
      setError(err.message || "Une erreur est survenue lors de la recherche");
    } finally {
      setLoading(false);
    }
  };

  // Recherche par ID du document (après scan QR)
  const searchByDocId = async (docId) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getReportById(docId);

      if (result) {
        // Si un résultat est trouvé, naviguer vers l'écran de détail
        navigation.navigate("ReportDetail", { report: result });
      } else {
        setError("Aucun rapport trouvé avec cet identifiant");
      }
    } catch (err) {
      console.error("Erreur de recherche par ID:", err);
      setError(err.message || "Une erreur est survenue lors de la recherche");
    } finally {
      setLoading(false);
    }
  };

  // Gérer l'ouverture du scanner
  const openScanner = () => {
    if (hasPermission === null) {
      Alert.alert("Permission", "Demande d'accès à la caméra en cours...");
      return;
    }

    if (hasPermission === false) {
      Alert.alert(
        "Permission refusée",
        "Veuillez autoriser l'accès à la caméra dans les paramètres"
      );
      return;
    }

    setScannerVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recherche de réclamation</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Entrez la référence de votre réclamation
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Ex: REF12345"
              value={reference}
              onChangeText={setReference}
              placeholderTextColor="#999"
              autoCapitalize="characters"
              returnKeyType="search"
              onSubmitEditing={handleReferenceSearch}
            />

            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleReferenceSearch}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="search" size={22} color="#fff" />
              )}
            </TouchableOpacity>
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.orText}>OU</Text>
            <View style={styles.line} />
          </View>

          <TouchableOpacity
            style={styles.qrButton}
            onPress={openScanner}
            disabled={loading}
          >
            <Ionicons
              name="qr-code"
              size={22}
              color="#fff"
              style={styles.qrIcon}
            />
            <Text style={styles.qrButtonText}>Scanner un QR code</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal pour le scanner de QR code */}
      <Modal
        visible={scannerVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setScannerVisible(false)}
      >
        <View style={styles.modalContainer}>
          <SafeAreaView style={styles.scannerContainer}>
            <View style={styles.scannerHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setScannerVisible(false)}
              >
                <Ionicons name="close" size={26} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.scannerTitle}>Scanner le QR code</Text>
            </View>

            <BarCodeScanner
              onBarCodeScanned={handleBarCodeScanned}
              style={styles.scanner}
            />

            <View style={styles.scannerFrame}>
              <View style={styles.scannerTargetCorner1} />
              <View style={styles.scannerTargetCorner2} />
              <View style={styles.scannerTargetCorner3} />
              <View style={styles.scannerTargetCorner4} />
            </View>

            <Text style={styles.scanInstruction}>
              Placez le QR code au centre du cadre
            </Text>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#333",
    marginRight: 12,
  },
  searchButton: {
    height: 50,
    width: 50,
    backgroundColor: "#5352ed",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#5352ed",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 14,
    marginBottom: 12,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#eee",
  },
  orText: {
    paddingHorizontal: 16,
    color: "#999",
    fontSize: 14,
    fontWeight: "500",
  },
  qrButton: {
    height: 50,
    backgroundColor: "#5352ed",
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#5352ed",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  qrIcon: {
    marginRight: 10,
  },
  qrButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  scannerContainer: {
    flex: 1,
  },
  scannerHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  closeButton: {
    padding: 8,
  },
  scannerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 16,
  },
  scanner: {
    flex: 1,
  },
  scannerFrame: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  scannerTargetCorner1: {
    position: "absolute",
    top: "35%",
    left: "25%",
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: "#5352ed",
  },
  scannerTargetCorner2: {
    position: "absolute",
    top: "35%",
    right: "25%",
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: "#5352ed",
  },
  scannerTargetCorner3: {
    position: "absolute",
    bottom: "35%",
    left: "25%",
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: "#5352ed",
  },
  scannerTargetCorner4: {
    position: "absolute",
    bottom: "35%",
    right: "25%",
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: "#5352ed",
  },
  scanInstruction: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    padding: 24,
  },
});

export default SearchReportScreen;
