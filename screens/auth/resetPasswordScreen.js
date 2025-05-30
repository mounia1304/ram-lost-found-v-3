import React, { useState } from "react";
import { View, Alert, Text, StyleSheet } from "react-native";
import { auth } from "../../services/databaseService/firebaseConfig";
import { confirmPasswordResetAction } from "../../services/authService";
import { validatePassword } from "../../utils/validators";
import { useRoute } from "@react-navigation/native";
import Input from "../../components/input";
import Button from "../../components/button";
import Title from "../../components/title";
const ResetPasswordScreen = ({ navigation }) => {
  const route = useRoute();
  const { oobCode } = route.params || {};
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleResetPassword = async () => {
    // Vérifications
    if (!password.trim() || !confirmPassword.trim()) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }

    if (!validatePassword(password)) {
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe doivent etre identiques!! ");
      return;
    }
    if (!oobCode) {
      Alert.alert("Erreur", "Lien invalide ou expiré.");
      return;
    }
    try {
      // On confirme la réinitialisation avec le code et le nouveau mot de passe
      await confirmPasswordResetAction(oobCode, password);
      Alert.alert("succes", "votre mot de passe á eté bien modifié");
      navigation.navigate("Login");
    } catch (error) {
      console.error("Erreur de réinitialisation du mot de passe :", error);
      Alert.alert("Erreur", error.message);
    }
  };
  return (
    <View style={styles.container}>
      <Title text={"Réinitialiser votre mot de passe"} />

      <Input
        placeholder="Nouveau mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Input
        placeholder="Confirmer le mot de passe"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <Button title="Valider" onPress={handleResetPassword} />

      <Text
        style={styles.loginText}
        onPress={() => navigation.navigate("Login")}
      >
        Retour à la connexion
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  loginText: {
    marginTop: 15,
    textAlign: "center",
    color: "#0066cc",
  },
});

export default ResetPasswordScreen;
