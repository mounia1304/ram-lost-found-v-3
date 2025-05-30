import React, { useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Clipboard,
  Linking,
  ScrollView,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import {
  AntDesign,
  Feather,
  MaterialIcons,
  FontAwesome,
  Ionicons,
} from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";

export default function QRCodeScreen() {
  const qrRef = useRef();
  const route = useRoute();
  const { shortCode } = route.params;

  const copyCode = () => {
    Clipboard.setString(shortCode);
    Alert.alert("Succès", "Code copié dans le presse-papiers");
  };

  const downloadQRCode = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission requise",
          "Autorisez l'accès à la galerie pour sauvegarder le QR Code"
        );
        return;
      }

      qrRef.current.toDataURL(async (data) => {
        const fileUri =
          FileSystem.documentDirectory + `QRCode_${shortCode}.png`;
        await FileSystem.writeAsStringAsync(fileUri, data, {
          encoding: FileSystem.EncodingType.Base64,
        });

        await MediaLibrary.saveToLibraryAsync(fileUri);
        Alert.alert("Succès", "QR Code enregistré dans votre galerie");
      });
    } catch (error) {
      Alert.alert("Erreur", "Impossible de sauvegarder le QR Code");
    }
  };

  const contactMethods = [
    {
      id: 1,
      icon: <FontAwesome name="phone" size={20} color="#A6192E" />,
      text: "Appeler le service client",
      action: () => Linking.openURL("tel:+212600000000"),
    },
    {
      id: 2,
      icon: <MaterialIcons name="email" size={20} color="#A6192E" />,
      text: "Envoyer un email",
      action: () => Linking.openURL("mailto:lostandfound@royalairmaroc.com"),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Message de succès */}
        <View style={styles.successMessage}>
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          <Text style={styles.successText}>
            Déclaration enregistrée avec succès
          </Text>
        </View>

        {/* Message de remerciement */}
        <View style={styles.thankYouBox}>
          <Text style={styles.thankYouText}>
            Merci d'avoir contribué à rendre son objet à son propriétaire. Votre
            geste fait la différence !
          </Text>
        </View>

        {/* Code et QR Code */}
        <View style={styles.codeSection}>
          <Text style={styles.sectionTitle}>Votre code de suivi</Text>

          <View style={styles.codeContainer}>
            <Text style={styles.codeText}>{shortCode}</Text>
            <TouchableOpacity onPress={copyCode} style={styles.copyButton}>
              <Feather name="copy" size={18} color="#A6192E" />
              <Text style={styles.copyText}>Copier</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionSubtitle}>QR Code à présenter</Text>

          <View style={styles.qrContainer}>
            <QRCode
              value={shortCode}
              size={200}
              color="#000"
              backgroundColor="#FFF"
              getRef={qrRef}
            />
          </View>

          <TouchableOpacity
            onPress={downloadQRCode}
            style={styles.downloadButton}
          >
            <AntDesign name="download" size={18} color="#FFF" />
            <Text style={styles.buttonText}>Télécharger le QR Code</Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.instructionBox}>
          <MaterialIcons name="info-outline" size={24} color="#A6192E" />
          <Text style={styles.instructionText}>
            Présentez ce code au bureau Lost & Found de l'aéroport pour déposer
            l'objet
          </Text>
        </View>

        {/* Bloc de contact */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Besoin d'aide ?</Text>

          {contactMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={styles.contactMethod}
              onPress={method.action}
            >
              <View style={styles.contactIcon}>{method.icon}</View>
              <Text style={styles.contactText}>{method.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  successMessage: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  successText: {
    marginLeft: 10,
    color: "#2E7D32",
    fontWeight: "500",
    fontSize: 16,
  },
  thankYouBox: {
    backgroundColor: "##C2C1BE",
    padding: 15,
    borderRadius: 8,
    marginBottom: 25,
    borderLeftWidth: 4,
    borderLeftColor: "#61374E",
  },
  thankYouText: {
    color: "#61374E",
    fontSize: 14,
    lineHeight: 20,
  },
  codeSection: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  sectionSubtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 20,
    marginBottom: 15,
    textAlign: "center",
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  codeText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 6,
    backgroundColor: "rgba(166, 25, 46, 0.1)",
  },
  copyText: {
    marginLeft: 5,
    color: "#A6192E",
    fontWeight: "500",
  },
  qrContainer: {
    alignItems: "center",
    marginVertical: 15,
  },
  downloadButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#A6192E",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "600",
    marginLeft: 10,
  },
  instructionBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#A6192E",
  },
  instructionText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  contactSection: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  contactMethod: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(166, 25, 46, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  contactText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
});
