import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function LostChoiceScreen() {
  const navigation = useNavigation();

  const handleInPlane = () => navigation.navigate("ReportLost");

  const handleOutsidePlane = () => {
    Alert.alert(
      "Objet perdu ailleurs",
      "Vous serez redirigé vers le service approprié",
      [
        { text: "Annuler" },
        {
          text: "OK",
          onPress: () =>
            Linking.openURL(
              "https://deliverback.com/fr/casablanca-airport-lost-and-found/"
            ),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Où avez-vous perdu votre objet ?</Text>

      <TouchableOpacity style={styles.button} onPress={handleInPlane}>
        <Text style={styles.buttonText}>Dans l'avion</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={handleOutsidePlane}
      >
        <Text style={styles.buttonText}>Ailleurs dans l'aéroport</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#FAFAFA",
  },
  title: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 30,
    color: "#333231",
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#C20831",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: "center",
  },
  secondaryButton: {
    backgroundColor: "#61374E",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});
