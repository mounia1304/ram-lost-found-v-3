import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Linking,
  Alert,
} from "react-native";

const CustomCheckbox = ({ value, onValueChange }) => {
  const handleOpenLink = async () => {
    const url =
      "https://www.royalairmaroc.com/ma-en/general-terms-and-conditions";
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Erreur", "Impossible d'ouvrir le lien.");
    }
  };

  return (
    <Pressable onPress={() => onValueChange(!value)} style={styles.container}>
      <View style={[styles.checkbox, value && styles.checkedBox]}>
        {value && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={styles.label}>
        J'accepte les{" "}
        <Text style={styles.link} onPress={handleOpenLink}>
          conditions générales
        </Text>
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: 10,
    paddingRight: 20,
  },
  checkbox: {
    height: 24,
    width: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#007AFF",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  checkedBox: {
    backgroundColor: "#007AFF",
  },
  checkmark: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  label: {
    fontSize: 15,
    color: "#333",
    flexShrink: 1,
    lineHeight: 20,
  },
  link: {
    color: "#007AFF",
    textDecorationLine: "underline",
  },
});

export default CustomCheckbox;
