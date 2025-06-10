import React, { useState, useEffect } from "react";
import {
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
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
import Constants from "expo-constants";

// Configuration pour Expo Google Auth
WebBrowser.maybeCompleteAuthSession();

// Couleurs RAM selon la charte officielle
const COLORS = {
  primary: "#C20831",
  secondary: "#61374E",
  tertiary: "#B49360",
  white: "#FFFFFF",
  background: "#FAFAFA",
  surface: "#FFFFFF",
  text: "#333231",
  textSecondary: "#595855",
  textLight: "#7B7A78",
  border: "#D8D7D4",
  shadow: "rgba(0, 0, 0, 0.1)",
};

const LoginScreen = ({ route, navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Récupérer la destination de retour, si elle existe
  const returnTo = route.params?.returnTo;

  // Configuration Google OAuth corrigée
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId:
      "936517417100-5bq5m1qar1ku8chbrpmf6ie1kv4v4b6t.apps.googleusercontent.com",
    iosClientId:
      "936517417100-5bq5m1qar1ku8chbrpmf6ie1kv4v4b6t.apps.googleusercontent.com",
    androidClientId:
      "526528819985-rg52pi1ki41kc548i14tueep0h8s9ltg.apps.googleusercontent.com",
    webClientId:
      "936517417100-5bq5m1qar1ku8chbrpmf6ie1kv4v4b6t.apps.googleusercontent.com",
    scopes: ["openid", "profile", "email"],
    additionalParameters: {},
    extraParams: {
      prompt: "select_account",
    },
  });

  // Gérer la réponse Google Auth
  useEffect(() => {
    if (response?.type === "success") {
      handleGoogleSuccess(response.authentication);
    } else if (response?.type === "error") {
      console.error("Google Auth Error:", response.error);
      Alert.alert(
        "Erreur d'authentification",
        "La connexion avec Google a échoué. Veuillez réessayer."
      );
    }
  }, [response]);

  const handleGoogleSuccess = async (authentication) => {
    try {
      setIsLoading(true);

      if (!authentication?.accessToken) {
        throw new Error("Token d'accès Google manquant");
      }

      // Utiliser la fonction du service
      await signInWithGoogleCredential(authentication);

      // Navigation après succès
      if (returnTo) {
        navigation.navigate(returnTo);
      } else {
        navigation.navigate("Home");
      }
    } catch (error) {
      console.error("Erreur Google login:", error);
      Alert.alert(
        "Erreur de connexion",
        "La connexion avec Google a échoué. Veuillez réessayer."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      if (!request) {
        Alert.alert("Erreur", "Service Google non disponible");
        return;
      }

      setIsLoading(true);
      const result = await promptAsync();

      // Le résultat sera géré par l'useEffect
      if (result.type === "cancel") {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Erreur lors du lancement Google Auth:", error);
      Alert.alert("Erreur", "Impossible de lancer l'authentification Google.");
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    // Validation des champs
    if (!email.trim() || !password.trim()) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }

    // Validation format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert("Erreur", "Format d'email invalide.");
      return;
    }

    setIsLoading(true);
    try {
      await loginUser(email.trim(), password);

      if (returnTo) {
        navigation.navigate(returnTo);
      } else {
        navigation.navigate("Home");
      }
    } catch (error) {
      let errorMessage = "Une erreur est survenue lors de la connexion";

      switch (error.code) {
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
          errorMessage = "Email ou mot de passe incorrect";
          break;
        case "auth/invalid-email":
          errorMessage = "Format d'email invalide";
          break;
        case "auth/too-many-requests":
          errorMessage = "Trop de tentatives. Veuillez réessayer plus tard.";
          break;
        case "auth/user-disabled":
          errorMessage = "Ce compte a été désactivé";
          break;
        case "auth/network-request-failed":
          errorMessage = "Problème de connexion réseau";
          break;
        default:
          console.error("Login error:", error);
      }

      Alert.alert("Erreur de connexion", errorMessage);
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
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* Title */}
          <Text style={styles.title}>Connexion</Text>
          <Text style={styles.subtitle}>
            Connectez-vous à votre compte RAM Lost & Found
          </Text>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Email Input */}
            <Text style={styles.inputLabel}>Email</Text>
            <View style={[styles.inputContainer, email && styles.inputFocused]}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={email ? COLORS.primary : COLORS.textLight}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="votre@email.com"
                placeholderTextColor={COLORS.textLight}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            {/* Password Input */}
            <Text style={styles.inputLabel}>Mot de passe</Text>
            <View
              style={[styles.inputContainer, password && styles.inputFocused]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={password ? COLORS.primary : COLORS.textLight}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Votre mot de passe"
                placeholderTextColor={COLORS.textLight}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
                disabled={isLoading}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={COLORS.textLight}
                />
              </TouchableOpacity>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => navigation.navigate("ForgotPassword")}
              disabled={isLoading}
            >
              <Text style={styles.forgotPasswordText}>
                Mot de passe oublié ?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.disabledButton]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Text style={styles.loginButtonText}>Se connecter</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Login */}
          <TouchableOpacity
            style={[styles.googleButton, isLoading && styles.disabledButton]}
            onPress={handleGoogleLogin}
            disabled={!request || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.text} size="small" />
            ) : (
              <>
                <AntDesign
                  name="google"
                  size={20}
                  color="#DB4437"
                  style={styles.googleIcon}
                />
                <Text style={styles.googleButtonText}>
                  Continuer avec Google
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Vous n'avez pas de compte ?</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Register", { returnTo })}
              disabled={isLoading}
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
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  formContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 8,
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: COLORS.background,
    height: 52,
  },
  inputFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
  },
  inputIcon: {
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
    paddingVertical: 0,
  },
  eyeIcon: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
    paddingVertical: 4,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "500",
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: "500",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    height: 52,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 32,
  },
  googleIcon: {
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 20,
  },
  footerText: {
    color: COLORS.textLight,
    fontSize: 14,
  },
  registerText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
});

export default LoginScreen;
