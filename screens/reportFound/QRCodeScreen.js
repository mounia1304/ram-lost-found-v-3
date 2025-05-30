import React, { useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import {
  MaterialIcons,
  FontAwesome5,
  Entypo,
  Feather,
} from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";

const PRIMARY_COLOR = "#A6192E";
const ACCENT_COLOR = "#F4F4F4";
const SECENDARY_COLOR = " #6f42c1";
export default function QRCodeScreen() {
  const qrRef = useRef();
  const route = useRoute();
  const { docId, shortCode } = route.params;

  const downloadQRCode = async () => {
    try {
      qrRef.current.toDataURL(async (dataUrl) => {
        const fileUri = FileSystem.documentDirectory + `${shortCode}.png`;
        await FileSystem.writeAsStringAsync(fileUri, dataUrl, {
          encoding: FileSystem.EncodingType.Base64,
        });
        await Sharing.shareAsync(fileUri, {
          mimeType: "image/png",
          dialogTitle: "Partager le QR Code RAM",
          UTI: "image/png",
        });
      });
    } catch (error) {
      Alert.alert("Erreur", "Impossible de partager le QR code.");
    }
  };

  const dropPoints = [
    { id: "1", name: "Stand RAM – Hall A", address: "Terminal 1, Aérogare A" },
    { id: "2", name: "Stand RAM – Hall B", address: "Terminal 2, Arrivées" },
    { id: "3", name: "Point RAM – Enregistrement", address: "Hall principal" },
  ];

  const contactRAM = {
    email: "lostandfound@royalairmaroc.com",
    phone: "+212600000000",
  };

  const openMap = (address) => {
    const url =
      Platform.OS === "ios"
        ? `maps:0,0?q=${encodeURIComponent(address)}`
        : `geo:0,0?q=${encodeURIComponent(address)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert("Erreur", "Impossible d’ouvrir la localisation.");
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Étape 1 */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <MaterialIcons
              name="confirmation-number"
              size={24}
              color="#6f42c1"
            />
            <Text style={styles.sectionTitle}>
              Étape 1 : Référence de Réclamation
            </Text>
          </View>
          <Text style={styles.bodyText}>
            Veuillez noter ce code. Il vous sera demandé lors de la récupération
            de votre objet.
          </Text>
          <View style={styles.referenceBox}>
            <Text style={styles.code}>{shortCode}</Text>
          </View>
        </View>

        {/* Étape 2 */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <FontAwesome5 name="qrcode" size={24} color="#6f42c1" />
            <Text style={styles.sectionTitle}>
              Étape 2 : QR Code à présenter
            </Text>
          </View>
          <Text style={styles.bodyText}>
            Ce QR code contient votre identifiant unique. Montrez-le à l’agent
            RAM au guichet.
          </Text>
          <View style={styles.qrContainer}>
            <QRCode value={docId} size={200} getRef={qrRef} />
          </View>
          <TouchableOpacity style={styles.button} onPress={downloadQRCode}>
            <FontAwesome5 name="download" size={16} color="#fff" />
            <Text style={styles.buttonText}>
              Télécharger / Partager QR Code
            </Text>
          </TouchableOpacity>
        </View>

        {/* Étape 3 */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Feather name="map-pin" size={24} color="#6f42c1" />
            <Text style={styles.sectionTitle}>Étape 3 : Points de Dépôt</Text>
          </View>
          <Text style={styles.bodyText}>
            Retrouvez ci-dessous les points où vous pouvez récupérer votre
            objet.
          </Text>
          {dropPoints.map((pt) => (
            <TouchableOpacity
              key={pt.id}
              style={styles.dropPoint}
              onPress={() => openMap(pt.address)}
            >
              <MaterialIcons name="place" size={20} color={PRIMARY_COLOR} />
              <Text style={styles.dropText}>{pt.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Étape 4 */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <MaterialIcons name="support-agent" size={24} color="#6f42c1" />"
            <Text style={styles.sectionTitle}>Assistance RAM</Text>
          </View>
          <Text style={styles.bodyText}>
            Si vous avez des questions, contactez-nous.
          </Text>
          <TouchableOpacity
            onPress={() => Linking.openURL(`mailto:${contactRAM.email}`)}
          >
            <Text style={styles.link}>✉️ {contactRAM.email}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => Linking.openURL(`tel:${contactRAM.phone}`)}
          >
            <Text style={styles.link}>📞 {contactRAM.phone}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: ACCENT_COLOR },
  container: {
    padding: 16,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: PRIMARY_COLOR,
    marginVertical: 12,
    textAlign: "center",
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6f42c1",
    marginLeft: 8,
  },
  bodyText: {
    fontSize: 14,
    color: "#444",
    marginBottom: 12,
    lineHeight: 20,
  },
  referenceBox: {
    backgroundColor: ACCENT_COLOR,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  code: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000000",
  },
  qrContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 12,
    borderRadius: 6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  dropPoint: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  dropText: {
    fontSize: 15,
    marginLeft: 8,
    color: "#333",
  },
  link: {
    fontSize: 15,
    color: PRIMARY_COLOR,
    marginBottom: 8,
  },
});
