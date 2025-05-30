import React from "react";
import { View, Text, StyleSheet, Alert, Linking } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Title from "../../components/title";
import Button from "../../components/button";

export default function FoundChoiceScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = React.useState(false);

  const handleInPlane = () => {
    setLoading(false);
    navigation.navigate("Reportfound");
  };

  const handleOutsidePlane = () => {
    setLoading(true);
    Alert.alert(
      "Trouvé ailleurs ?",
      "Tu seras redirigé vers la page pour contacter les responsables."
    );
    setLoading(false);
    Linking.openURL(
      "https://deliverback.com/fr/casablanca-airport-lost-and-found/"
    );
  };

  return (
    <View style={styles.container}>
      <Title text="Tu as trouvé un objet ?" style={styles.customTitle} />
      <Text style={styles.subtitle}>
        Merci de nous aider ! Dis-nous où tu l'as trouvé.
      </Text>

      <View style={styles.buttonContainer}>
        <Button
          title="C'était à bord de l'avion"
          onPress={handleInPlane}
          loading={loading}
          disabled={loading}
          style={styles.bigButton}
          textStyle={styles.bigButtonText}
        />
        <View style={{ height: 8 }} />
        <Button
          title="Non, c'est ailleurs !"
          onPress={handleOutsidePlane}
          loading={loading}
          disabled={loading}
          style={styles.bigButton}
          textStyle={styles.bigButtonText}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 30,
    backgroundColor: "#fff",
    marginTop: 10,
  },
  customTitle: {
    color: "#000", // noir
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 30,
    color: "#333",
  },
  buttonContainer: {
    width: "100%",
  },
  bigButton: {
    paddingVertical: 18,
    borderRadius: 12,
    marginBottom: 10,
  },
  bigButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
