import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet, Image, Text } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/databaseService/firebaseConfig";
import { useNavigation } from "@react-navigation/native";

const AuthLoadingScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigation.replace("profileTabs"); // Connecté
      } else {
        navigation.replace("Home"); // Non connecté
      }
    });

    return unsubscribe;
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/logoRam.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color="#ED1C24" style={styles.spinner} />
    </View>
  );
};

export default AuthLoadingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 180,
    height: 120,
    marginBottom: 30,
  },
  text: {
    fontSize: 18,
    fontWeight: "500",
    color: "#ED1C24",
    marginBottom: 20,
  },
  spinner: {
    marginTop: 10,
  },
});
