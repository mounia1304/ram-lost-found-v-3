import { Alert } from "react-native";

// Validation du mot de passe
export const validatePassword = (password) => {
  if (!password) {
    Alert.alert("Erreur", "Veuillez entrer un mot de passe.");
    return false;
  }

  if (password.length < 6) {
    Alert.alert(
      "Erreur",
      "Le mot de passe doit contenir au moins 6 caractères."
    );
    return false;
  }

  if (!/[A-Z]/.test(password)) {
    Alert.alert(
      "Erreur",
      "Le mot de passe doit contenir au moins une lettre majuscule."
    );
    return false;
  }

  if (!/[a-z]/.test(password)) {
    Alert.alert(
      "Erreur",
      "Le mot de passe doit contenir au moins une lettre minuscule."
    );
    return false;
  }

  if (!/[0-9]/.test(password)) {
    Alert.alert("Erreur", "Le mot de passe doit contenir au moins un chiffre.");
    return false;
  }

  if (!/[@$!%*?&#£$=)(/&%¤#,.-_<>:;)]/.test(password)) {
    Alert.alert(
      "Erreur",
      "Le mot de passe doit contenir au moins un caractère spécial ."
    );
    return false;
  }

  return true;
};
