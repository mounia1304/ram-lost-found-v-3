import React, { useState, useEffect } from "react";
import {
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  Alert,
} from "react-native";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import "../../services/databaseService/firebaseConfig";
import { auth } from "../../services/databaseService/firebaseConfig";
import {
  loginUser,
  signInWithGoogleCredential,
} from "../../services/authService";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";

// Configuration pour Expo Google Auth
WebBrowser.maybeCompleteAuthSession();

// Couleurs RAM
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

const LoginScreen = ({ route, navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Récupérer la destination de retour, si elle existe
  const returnTo = route.params?.returnTo;

  // ✅ Hook Google Auth dans le composant (correct)
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId:
      "936517417100-5bq5m1qar1ku8chbrpmf6ie1kv4v4b6t.apps.googleusercontent.com",
    iosClientId:
      "936517417100-5bq5m1qar1ku8chbrpmf6ie1kv4v4b6t.apps.googleusercontent.com",
    androidClientId:
      "936517417100-5bq5m1qar1ku8chbrpmf6ie1kv4v4b6t.apps.googleusercontent.com",
    webClientId:
      "936517417100-5bq5m1qar1ku8chbrpmf6ie1kv4v4b6t.apps.googleusercontent.com",
  });

  // ✅ Gérer la réponse Google Auth
  useEffect(() => {
    if (response?.type === "success") {
      handleGoogleSuccess(response.authentication);
    }
  }, [response]);

  const handleGoogleSuccess = async (authentication) => {
    try {
      setIsLoading(true);

      // ✅ Utiliser la fonction du service (sans hooks)
      await signInWithGoogleCredential(authentication);

      if (returnTo) {
        navigation.navigate(returnTo);
      } else {
        navigation.navigate("Home");
      }
    } catch (error) {
      console.error("Erreur Google login:", error);
      Alert.alert("Erreur", "La connexion avec Google a échoué.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await promptAsync();
    } catch (error) {
      console.error("Erreur lors du lancement Google Auth:", error);
      Alert.alert("Erreur", "Impossible de lancer l'authentification Google.");
    }
  };

  const handleLogin = async () => {
    // Vérification des champs
    if (!email.trim() || !password.trim()) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }
    setIsLoading(true);
    try {
      await loginUser(email, password);
      if (returnTo) {
        navigation.navigate(returnTo);
      } else {
        navigation.navigate("Home");
      }
    } catch (error) {
      let errorMessage = "Une erreur est survenue lors de la connexion";

      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        errorMessage = "Email ou mot de passe incorrect";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Format d'email invalide";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Trop de tentatives. Veuillez réessayer plus tard.";
      }

      Alert.alert("Erreur de connexion", errorMessage);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.logoContainer}>
            <Image
              source={{
                uri: "https://www.royalairmaroc.com/content/dam/royal-air-maroc/Static/logo_ram_arabic-english.png",
              }}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.welcomeText}>RAM Lost & Found</Text>
          </View>

          <Text style={styles.title}>Connexion</Text>

          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={COLORS.textLight}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Votre adresse email"
                placeholderTextColor={COLORS.textLight}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <Text style={styles.inputLabel}>Mot de passe</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={COLORS.textLight}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Votre mot de passe"
                placeholderTextColor={COLORS.textLight}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={COLORS.textLight}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => navigation.navigate("ForgotPassword")}
            >
              <Text style={styles.forgotPasswordText}>
                Mot de passe oublié ?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.disabledButton]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.loginButtonText}>Se connecter</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* OU se connecter avec Google */}
          <View style={{ marginTop: 15 }}>
            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleLogin}
              disabled={!request || isLoading}
            >
              <AntDesign
                name="google"
                size={20}
                color="#DB4437"
                style={styles.googleIcon}
              />
              <Text style={styles.googleButtonText}>Continuer avec Google</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Vous n'avez pas de compte ?</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Register", { returnTo })}
            >
              <Text style={styles.registerText}>Créer un compte</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: 5,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  logo: {
    width: 150,
    height: 50,
  },
  welcomeText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 20,
  },
  formContainer: {
    backgroundColor: COLORS.light,
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputLabel: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 8,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
  },
  inputIcon: {
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: 50,
    color: COLORS.text,
    fontSize: 16,
  },
  eyeIcon: {
    paddingHorizontal: 12,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: COLORS.light,
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    color: COLORS.textLight,
    fontSize: 14,
  },
  registerText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 5,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 8,
    height: 50,
    marginTop: 10,
  },
  googleIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
});

export default LoginScreen;
