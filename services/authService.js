import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updatePassword as firebaseUpdatePassword,
  confirmPasswordReset as firebaseConfirmPasswordReset,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import "./databaseService/firebaseConfig";
import { auth } from "./databaseService/firebaseConfig";
import { createUserDocument } from "./firestore";
import { Alert } from "react-native";

// ✅ SUPPRIMÉ - Pas de hooks dans les services
// import * as Google from "expo-auth-session/providers/google";
// import * as WebBrowser from "expo-web-browser";

// ✅ Fonction utilitaire pour créer les credentials Google (sans hooks)
export const createGoogleCredential = async (idToken, accessToken) => {
  try {
    const credential = GoogleAuthProvider.credential(idToken, accessToken);
    const result = await signInWithCredential(auth, credential);
    return result.user;
  } catch (error) {
    console.error("Erreur création credential Google:", error);
    throw error;
  }
};

// ✅ Fonction simple pour la connexion Google (utilisée depuis le composant)
export const signInWithGoogleCredential = async (authentication) => {
  try {
    const { idToken, accessToken } = authentication;
    const credential = GoogleAuthProvider.credential(idToken, accessToken);
    const result = await signInWithCredential(auth, credential);

    // Créer le document utilisateur si première connexion
    const isNewUser = result.additionalUserInfo?.isNewUser;
    if (isNewUser) {
      await createUserDocument(result.user.uid, {
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        createdAt: new Date(),
        role: "user",
        notifications: [],
      });
    }

    return result.user;
  } catch (error) {
    console.error("Erreur signInWithGoogleCredential:", error);
    throw error;
  }
};

export const registerUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Créer le document Firestore
    await createUserDocument(user.uid, {
      email: user.email,
      createdAt: new Date(),
      role: "user",
      notifications: [],
    });

    Alert.alert("Succès", "Votre compte a été créé avec succès !");
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      Alert.alert("Erreur", "Cet email est déjà utilisé.");
    } else if (error.code === "auth/weak-password") {
      Alert.alert("Erreur", "Le mot de passe est trop faible.");
    } else {
      Alert.alert("Erreur", error.message);
    }
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    Alert.alert("Bienvenue", "Connexion réussie !");
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      Alert.alert("Erreur", "Aucun compte n'est associé à cet email.");
    } else if (error.code === "auth/wrong-password") {
      Alert.alert("Erreur", "Mot de passe incorrect.");
    } else {
      Alert.alert("Erreur", error.message);
    }
    throw error;
  }
};

export const resetPassword = async (email) => {
  const actionCodeSettings = {
    //  URL qui sera dans le mail : on utilise notre schéma URI
    url: "ramlostfound://reset-password",
    handleCodeInApp: true,
  };
  try {
    await sendPasswordResetEmail(auth, email, actionCodeSettings);
    Alert.alert("Succès", "Email de réinitialisation envoyé.");
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      Alert.alert("Erreur", "Aucun compte n'est associé à cet email.");
    } else {
      Alert.alert("Erreur", error.message);
    }
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    Alert.alert("Erreur", "Impossible de se déconnecter.");
    throw error;
  }
};

export const updatePassword = async (newPassword) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Utilisateur non connecté.");
  }

  await firebaseUpdatePassword(user, newPassword);
};

export const confirmPasswordResetAction = async (oobCode, newPassword) => {
  try {
    // Cette méthode confirme le code et applique le nouveau mot de passe
    await firebaseConfirmPasswordReset(auth, oobCode, newPassword);
    Alert.alert("Succès", "Votre mot de passe a été mis à jour.");
  } catch (error) {
    // Erreurs possibles : code invalide, expiré, etc.
    throw new Error(error.message);
  }
};
