import React, { useState } from "react";
import { View, Text, Alert, StyleSheet } from "react-native";
import { auth } from "../../services/databaseService/firebaseConfig";
import { resetPassword } from "../../services/authService";
import Input from "../../components/input";
import Button from "../../components/button";
import Title from "../../components/title";
import SubTitle from "../../components/subTitle";
const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert("Erreur", "Veuillez entrer votre adresse e-mail.");
      return;
    }

    await resetPassword(email);
  };

  return (
    <View style={styles.container}>
      <Title text={"Mot de passe oublié"} />
      <SubTitle
        text={"veuiller saisir  votre adresse-mail"}
        style={styles.SubTitle}
      />
      <Input
        placeholder="Votre adresse e-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <Button
        title="Réinitialiser le mot de passe"
        onPress={handleResetPassword}
        style={styles.Button}
      />

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
    flex: 2,
    padding: 20,
    justifyContent: "center",
  },
  loginText: {
    marginTop: 15,
    textAlign: "left",
    color: "#0066cc",
  },
  Button: {
    marginBottom: 10,
  },
  SubTitle: {
    marginTop: 1000,
  },
});

export default ForgotPasswordScreen;
