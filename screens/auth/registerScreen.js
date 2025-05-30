import React, { useState } from "react";
import { View, Alert, Text, StyleSheet } from "react-native";
import { auth } from "../../services/databaseService/firebaseConfig";
import { registerUser } from "../../services/authService";
import { validatePassword } from "../../utils/validators";
import Input from "../../components/input";
import Button from "../../components/button";
import Title from "../../components/title";

const COLORS = {
  primary: "#c2002f",
  primaryDark: "#a4001f",
  secondary: "#003366",
  light: "#ffffff",
  background: "#f8f9fa",
  text: "#333333",
  textLight: "#767676",
  border: "#e0e0e0",
};

const RegisterScreen = ({ route, navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Récupérer la destination de retour si elle existe
  const returnTo = route.params?.returnTo;

  const handleRegister = async () => {
    if (!validatePassword(password)) return;

    try {
      await registerUser(email, password);

      Alert.alert("Succès", "Votre compte a été créé avec succès !", [
        {
          text: "OK",
          onPress: () => {
            // Si un écran de retour est spécifié, naviguer vers celui-ci
            // après la connexion, sinon aller à l'écran de connexion normal
            if (returnTo) {
              navigation.navigate("Login", { returnTo });
            } else {
              navigation.navigate("Login");
            }
          },
        },
      ]);
    } catch (error) {
      console.error("Erreur lors de l'inscription :", error);
      Alert.alert("Erreur", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Title text={"Créer un compte"} />

      <Input
        placeholder="Adresse e-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <Input
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button title="S'inscrire" onPress={handleRegister} />

      <Text
        style={styles.loginText}
        onPress={() =>
          navigation.navigate("Login", returnTo ? { returnTo } : undefined)
        }
      >
        Vous avez déjà un compte ? Se connecter
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

export default RegisterScreen;
